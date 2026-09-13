import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Bot, Workflow, type LucideIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { mentionItemValue } from "./mention-document"
import { MentionPicker } from "./MentionPicker"
import type { MentionItem, MentionKindMeta } from "./types"

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
  {
    kind: "workflow",
    id: "workflow-1",
    label: "Onboarding Flow",
  },
]

const kinds: MentionKindMeta[] = [
  { kind: "agent", label: "Agents", icon: Bot as LucideIcon },
  { kind: "workflow", label: "Workflows", icon: Workflow as LucideIcon },
]

function renderPicker(
  overrides: Partial<{
    items: MentionItem[]
    open: boolean
    search: string
    highlighted: string
    onSelect: (item: MentionItem) => void
    onOpenChange: (open: boolean) => void
    onHighlightedChange: (value: string) => void
  }> = {}
) {
  const props = {
    items,
    kinds,
    open: true,
    search: "",
    highlighted: mentionItemValue(items[0]!),
    onSelect: vi.fn(),
    onOpenChange: vi.fn(),
    onHighlightedChange: vi.fn(),
    ...overrides,
  }
  return {
    user: userEvent.setup(),
    ...render(<MentionPicker {...props} />),
    props,
  }
}

describe("MentionPicker", () => {
  it("exposes an accessible mentions list when open", () => {
    renderPicker()

    expect(
      screen.getByRole("listbox", { name: "Mentions" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Support Bot" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Onboarding Flow" })
    ).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    renderPicker({ open: false })

    expect(
      screen.queryByRole("listbox", { name: "Mentions" })
    ).not.toBeInTheDocument()
  })

  it("groups items by kind with icons", () => {
    renderPicker()

    const list = screen.getByRole("listbox", { name: "Mentions" })
    const agents = within(list).getByText("Agents")
    const workflows = within(list).getByText("Workflows")

    expect(agents).toBeInTheDocument()
    expect(workflows).toBeInTheDocument()
    expect(agents.parentElement?.querySelector("svg")).not.toBeNull()
    expect(workflows.parentElement?.querySelector("svg")).not.toBeNull()
  })

  it("filters items by search", () => {
    renderPicker({ search: "onboard" })

    expect(
      screen.getByRole("option", { name: "Onboarding Flow" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "Support Bot" })
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Agents")).not.toBeInTheDocument()
    expect(screen.getByText("Workflows")).toBeInTheDocument()
  })

  it("marks the highlighted option", () => {
    renderPicker({ highlighted: mentionItemValue(items[1]!) })

    expect(screen.getByRole("option", { name: "Sales Agent" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(
      screen.getByRole("option", { name: "Support Bot" })
    ).toHaveAttribute("aria-selected", "false")
  })

  it("selects an item on click", async () => {
    const { user, props } = renderPicker()

    await user.click(screen.getByRole("option", { name: "Support Bot" }))

    expect(props.onSelect).toHaveBeenCalledTimes(1)
    expect(props.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "agent",
        id: "agent-1",
        label: "Support Bot",
      })
    )
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
  })
})
