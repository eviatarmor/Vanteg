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
    await user.click(
      screen.getByRole("button", { name: /Sheets, Drive, and Docs/ })
    )

    expect(
      screen.getByRole("button", { name: "Back to connectors" })
    ).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Actions" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Create row/ }))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ id: "spreadsheet-create-row" })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("lists extra google triggers and actions after opening the app", async () => {
    const user = userEvent.setup()

    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    await user.click(screen.getByRole("tab", { name: "Connectors" }))
    await user.click(
      screen.getByRole("button", { name: /Sheets, Drive, and Docs/ })
    )

    expect(screen.getByRole("button", { name: /New row/ })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Updated row/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Upload Drive file/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Create row/ })
    ).toBeInTheDocument()

    const triggerTabs = screen.getAllByRole("tab", { name: "Triggers" })
    await user.click(triggerTabs.at(-1)!)
    expect(screen.getByRole("button", { name: /New row/ })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Upload Drive file/ })
    ).not.toBeInTheDocument()
  })

  it("stretches the last odd trigger card across the picker width", () => {
    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    expect(screen.getByRole("button", { name: /Outbound call/ })).toHaveClass(
      "col-span-2"
    )
    expect(screen.getByRole("button", { name: /Manual/ })).not.toHaveClass(
      "col-span-2"
    )
  })

  it("packs picker cards at the start of the grid instead of stretching rows", () => {
    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    const card = screen.getByRole("button", { name: /Manual/ })
    expect(card.parentElement).toHaveClass("content-start")
    expect(card).not.toHaveClass("h-full", "flex-1")
  })

  it("scrolls the connector list inside a clipped viewport", async () => {
    const user = userEvent.setup()

    render(<NodePickerDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    await user.click(screen.getByRole("tab", { name: "Connectors" }))

    const slack = screen.getByRole("button", { name: /Sheets, Drive, and Docs/ })
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
