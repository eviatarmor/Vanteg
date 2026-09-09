import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NodePickerDialog } from "./NodePickerDialog"

describe("NodePickerDialog", () => {
  it("lets the user pick a connector from the more dialog", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onOpenChange = vi.fn()

    render(<NodePickerDialog open onOpenChange={onOpenChange} onAdd={onAdd} />)

    await user.click(screen.getByRole("tab", { name: "Connectors" }))
    await user.click(screen.getByRole("button", { name: /GitHub/ }))

    expect(
      screen.getByRole("button", { name: "Back to connectors" })
    ).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Actions" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Create issue/ }))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ id: "github" })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("lists extra slack triggers and actions after opening the app", async () => {
    const user = userEvent.setup()

    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    await user.click(screen.getByRole("tab", { name: "Connectors" }))
    await user.click(screen.getByRole("button", { name: /Slack/ }))

    expect(
      screen.getByRole("button", { name: /New channel/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /App mentioned/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Upload file/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Add reaction/ })
    ).toBeInTheDocument()

    const triggerTabs = screen.getAllByRole("tab", { name: "Triggers" })
    await user.click(triggerTabs.at(-1)!)
    expect(
      screen.getByRole("button", { name: /New message/ })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Upload file/ })
    ).not.toBeInTheDocument()
  })

  it("scrolls the connector list inside a clipped viewport", async () => {
    const user = userEvent.setup()

    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    await user.click(screen.getByRole("tab", { name: "Connectors" }))

    const slack = screen.getByRole("button", { name: /Slack/ })
    const viewport = slack.closest(".overflow-auto")
    expect(viewport).not.toBeNull()
    expect(viewport).toHaveClass("min-h-0", "flex-1", "overflow-auto")
    expect(viewport).not.toHaveClass("size-full")
    expect(viewport?.parentElement).toHaveClass(
      "overflow-hidden",
      "max-h-[24rem]"
    )
  })
})
