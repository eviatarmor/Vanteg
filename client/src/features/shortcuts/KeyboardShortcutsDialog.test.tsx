import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { KeyboardShortcutsProvider } from "./KeyboardShortcutsProvider"

function Harness() {
  return (
    <KeyboardShortcutsProvider>
      <div>
        <input aria-label="Name" />
        <button type="button">Outside</button>
      </div>
    </KeyboardShortcutsProvider>
  )
}

describe("KeyboardShortcutsDialog", () => {
  it("opens with ? when focus is not in an input and closes with Escape", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument()

    await user.keyboard("?")

    const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText("Focus search")).toBeInTheDocument()
    expect(screen.getByText("Close dialogs and menus")).toBeInTheDocument()
    expect(screen.getByText("Delete the selected node or edge")).toBeInTheDocument()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument()
  })

  it("does not open with ? while typing in an input", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("textbox", { name: "Name" }))
    await user.keyboard("?")

    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("?")
  })
})
