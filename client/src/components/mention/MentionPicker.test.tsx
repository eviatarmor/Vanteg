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

  it("makes the mentions list a vertical scrollport", () => {
    renderPicker()
    const list = screen.getByRole("listbox", { name: "Mentions" })
    expect(list).toHaveClass("overflow-y-auto", "min-h-0")
    expect(list.className).toContain("max-h-[min(12rem,var(--radix-popover-content-available-height,12rem))]")
  })

  it("scrolls the list down when the highlighted option is below the visible area", () => {
    const { rerender, props } = renderPicker()
    const list = screen.getByRole("listbox", { name: "Mentions" })
    let scrollTop = 0
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value
      },
    })
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return makeRect(0, 80)
        }
        if (this.getAttribute("aria-selected") === "true") {
          return makeRect(120, 152)
        }
        return makeRect(0, 0)
      }
    )

    rerender(
      <MentionPicker
        {...props}
        highlighted={mentionItemValue(items[2]!)}
      />
    )

    expect(scrollTop).toBe(72)
  })

  it("scrolls the list up when the highlighted option is above the visible area", () => {
    const { rerender, props } = renderPicker({
      highlighted: mentionItemValue(items[2]!),
    })
    const list = screen.getByRole("listbox", { name: "Mentions" })
    let scrollTop = 90
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value
      },
    })
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return makeRect(80, 160)
        }
        if (this.getAttribute("aria-selected") === "true") {
          return makeRect(40, 72)
        }
        return makeRect(0, 0)
      }
    )

    rerender(
      <MentionPicker
        {...props}
        highlighted={mentionItemValue(items[0]!)}
      />
    )

    expect(scrollTop).toBe(50)
  })
})

function makeRect(top: number, bottom: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    bottom,
    left: 0,
    right: 240,
    width: 240,
    height: bottom - top,
    toJSON: () => ({}),
  } as DOMRect
}
