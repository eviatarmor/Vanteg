import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PaneAddMenu } from "./FlowMenus"

function renderMenu() {
  const onAdd = vi.fn()
  const onMore = vi.fn()
  const onClose = vi.fn()
  render(
    <PaneAddMenu
      open
      x={12}
      y={24}
      onClose={onClose}
      onAdd={onAdd}
      onMore={onMore}
    />
  )
  return { onAdd, onMore, onClose }
}

describe("PaneAddMenu", () => {
  it("cascades Trigger, Logic, and Connectors instead of a flat labeled list", () => {
    renderMenu()

    expect(screen.getByRole("listbox", { name: "Add a step" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Trigger" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Logic" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Connectors" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Others" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Webhook" })).not.toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "If" })).not.toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "More" })).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Trigger" }).querySelector("svg")).not.toBeNull()
    expect(screen.getByRole("option", { name: "Logic" }).querySelector("svg")).not.toBeNull()
    expect(screen.getByRole("option", { name: "Connectors" }).querySelector("svg")).not.toBeNull()
    expect(screen.getByRole("option", { name: "Others" }).querySelector("svg")).not.toBeNull()
  })

  it("adds a node from a cascade submenu", async () => {
    const user = userEvent.setup()
    const { onAdd, onClose } = renderMenu()

    await user.click(screen.getByRole("option", { name: "Logic" }))
    expect(screen.getByRole("option", { name: "If" }).querySelector("svg")).not.toBeNull()
    await user.click(screen.getByRole("option", { name: "If" }))

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: "if", label: "If" }))
    expect(onClose).toHaveBeenCalled()
  })

  it("opens the picker from Connectors > More and from Others", async () => {
    const user = userEvent.setup()
    const { onMore, onClose } = renderMenu()

    await user.click(screen.getByRole("option", { name: "Connectors" }))
    expect(screen.getByRole("option", { name: "HTTP Request" })).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "More" }))
    expect(onMore).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalled()

    await user.click(screen.getByRole("option", { name: "Others" }))
    expect(onMore).toHaveBeenCalledTimes(2)
  })
})
