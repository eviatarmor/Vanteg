import { useState } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Bot, type LucideIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { serializeMentionDocument } from "./mention-document"
import { MentionInput } from "./MentionInput"
import type { MentionItem, MentionKindMeta, MentionSegment } from "./types"

const items: MentionItem[] = [
  {
    kind: "agent",
    id: "agent-1",
    label: "Support Bot",
    description: "Handles support tickets",
  },
  {
    kind: "agent",
    id: "agent-2",
    label: "Sales Agent",
  },
]

const kinds: MentionKindMeta[] = [
  { kind: "agent", label: "Agents", icon: Bot as LucideIcon },
]

function Harness({
  initial = [{ type: "text", text: "" }],
  onSegmentsChange = vi.fn(),
  onSubmit = vi.fn((event: SubmitEvent) => {
    event.preventDefault()
  }),
  disabled = false,
}: {
  initial?: MentionSegment[]
  onSegmentsChange?: (segments: MentionSegment[]) => void
  onSubmit?: (event: SubmitEvent) => void
  disabled?: boolean
}) {
  const [segments, setSegments] = useState<MentionSegment[]>(initial)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(event.nativeEvent)
      }}
    >
      <MentionInput
        items={items}
        kinds={kinds}
        segments={segments}
        disabled={disabled}
        placeholder="Ask Vanteg…"
        aria-label="Message"
        onSegmentsChange={(next) => {
          onSegmentsChange(next)
          setSegments(next)
        }}
      />
      <button type="submit">Send</button>
    </form>
  )
}

function renderInput(
  options: {
    initial?: MentionSegment[]
    onSegmentsChange?: ReturnType<typeof vi.fn>
    onSubmit?: ReturnType<typeof vi.fn>
    disabled?: boolean
  } = {}
) {
  const onSegmentsChange = options.onSegmentsChange ?? vi.fn()
  const onSubmit = options.onSubmit ?? vi.fn()
  return {
    user: userEvent.setup(),
    onSegmentsChange,
    onSubmit,
    ...render(
      <Harness
        initial={options.initial}
        onSegmentsChange={onSegmentsChange}
        onSubmit={onSubmit}
        disabled={options.disabled}
      />
    ),
  }
}

describe("MentionInput", () => {
  it("opens Mentions on @ and inserts the highlighted item at the caret with ArrowDown then Enter", async () => {
    const { user, onSegmentsChange } = renderInput({
      initial: [{ type: "text", text: "Ask " }],
    })
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.type(box, "@")
    const mentions = await screen.findByRole("listbox", { name: "Mentions" })
    expect(
      within(mentions).getByRole("option", { name: "Support Bot" })
    ).toBeInTheDocument()
    await user.keyboard("{ArrowDown}{Enter}")
    expect(
      screen.queryByRole("listbox", { name: "Mentions" })
    ).not.toBeInTheDocument()
    const next = onSegmentsChange.mock.calls.at(-1)?.[0] as MentionSegment[]
    expect(serializeMentionDocument(next)).toBe("Ask Sales Agent")
    expect(
      within(box).getByRole("button", { name: "Remove Sales Agent" })
    ).toBeInTheDocument()
  })

  it("inserts a clicked mention at the caret", async () => {
    const { user, onSegmentsChange } = renderInput({
      initial: [{ type: "text", text: "Ping " }],
    })
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.type(box, "@")
    await user.click(await screen.findByRole("option", { name: "Support Bot" }))
    const next = onSegmentsChange.mock.calls.at(-1)?.[0] as MentionSegment[]
    expect(serializeMentionDocument(next)).toBe("Ping Support Bot")
    expect(
      within(box).getByRole("button", { name: "Remove Support Bot" })
    ).toBeInTheDocument()
  })

  it("closes the picker on Escape and leaves the query", async () => {
    const { user, onSegmentsChange } = renderInput()
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.type(box, "@sup")
    expect(await screen.findByRole("listbox", { name: "Mentions" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(
      screen.queryByRole("listbox", { name: "Mentions" })
    ).not.toBeInTheDocument()
    const next = onSegmentsChange.mock.calls.at(-1)?.[0] as MentionSegment[]
    expect(serializeMentionDocument(next)).toContain("@sup")
  })

  it("removes a chip from the field with its button", async () => {
    const { user, onSegmentsChange } = renderInput({
      initial: [
        { type: "text", text: "Ask " },
        {
          type: "mention",
          uid: "uid-1",
          item: items[0]!,
        },
        { type: "text", text: " now" },
      ],
    })
    const box = screen.getByRole("textbox", { name: "Message" })
    expect(
      within(box).getByRole("button", { name: "Remove Support Bot" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove Support Bot" }))
    const next = onSegmentsChange.mock.calls.at(-1)?.[0] as MentionSegment[]
    expect(serializeMentionDocument(next)).toBe("Ask  now")
    expect(
      within(box).queryByRole("button", { name: "Remove Support Bot" })
    ).not.toBeInTheDocument()
  })

  it("allows two chips of the same entity", async () => {
    const { user } = renderInput({
      initial: [
        { type: "text", text: "" },
        {
          type: "mention",
          uid: "uid-1",
          item: items[0]!,
        },
        { type: "text", text: " " },
      ],
    })
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.type(box, "@")
    await user.click(await screen.findByRole("option", { name: "Support Bot" }))
    expect(
      screen.getAllByRole("button", { name: "Remove Support Bot" })
    ).toHaveLength(2)
  })

  it("exposes aria-expanded and aria-activedescendant while the picker is open", async () => {
    const { user } = renderInput()
    const box = screen.getByRole("textbox", { name: "Message" })
    expect(box).toHaveAttribute("aria-expanded", "false")
    await user.click(box)
    await user.type(box, "@")
    await screen.findByRole("listbox", { name: "Mentions" })
    expect(box).toHaveAttribute("aria-expanded", "true")
    expect(box.getAttribute("aria-activedescendant")).toBe(
      "mention-option-agent:agent-1"
    )
  })

  it("marks an empty document with the placeholder", () => {
    renderInput()
    const box = screen.getByRole("textbox", { name: "Message" })
    expect(box).toHaveAttribute("data-placeholder", "Ask Vanteg…")
    expect(box).toHaveAttribute("data-empty", "true")
    expect(box).toHaveClass("w-full", "text-left")
    expect(box.parentElement).toHaveClass("w-full")
    expect(box).not.toHaveTextContent("Ask Vanteg…")
    const placeholder = screen.getByText("Ask Vanteg…")
    expect(placeholder).toHaveAttribute("aria-hidden", "true")
    expect(placeholder).toHaveClass("absolute", "inset-0")
  })

  it("hides the overlay placeholder once the field has text", async () => {
    const { user } = renderInput()
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.type(box, "s")
    expect(box).not.toHaveAttribute("data-empty")
    expect(screen.queryByText("Ask Vanteg…")).not.toBeInTheDocument()
    expect(box).toHaveTextContent("s")
  })

  it("submits the ancestor form on Enter when the picker is closed", async () => {
    const { user, onSubmit } = renderInput({
      initial: [{ type: "text", text: "hello" }],
    })
    const box = screen.getByRole("textbox", { name: "Message" })
    await user.click(box)
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalled()
  })
})
