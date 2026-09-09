import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TEXT_FORMAT_REGEX } from "../model/column-types"
import { AddColumnDialog } from "./AddColumnDialog"

describe("AddColumnDialog", () => {
  it("chips select options instead of a comma-separated field", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<AddColumnDialog open onOpenChange={() => {}} onAdd={onAdd} />)

    await user.type(screen.getByLabelText("Name"), "Status")
    await user.click(screen.getByLabelText("Type"))
    await user.click(screen.getByRole("option", { name: "Select" }))

    const options = screen.getByPlaceholderText("Type an option and press Enter")
    await user.type(options, "Open{Enter}")
    await user.type(screen.getByPlaceholderText("Add another"), "Closed{Enter}")

    expect(screen.getByText("Open")).toBeInTheDocument()
    expect(screen.getByText("Closed")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Admin, Member, Guest")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add column" }))

    expect(onAdd).toHaveBeenCalledWith({
      name: "Status",
      variant: "select",
      options: [
        { label: "Open", value: "open" },
        { label: "Closed", value: "closed" },
      ],
    })
  })

  it("uses the same input font for the regex placeholder as the name field", () => {
    render(<AddColumnDialog open onOpenChange={() => {}} onAdd={() => {}} />)

    const name = screen.getByPlaceholderText("Column name")
    const regex = screen.getByPlaceholderText("Optional pattern")

    expect(regex).not.toHaveClass("font-mono")
    expect(name.className.replace(/\s+/g, " ")).toEqual(regex.className.replace(/\s+/g, " "))
  })

  it("opens a side panel of text types that prepopulate regex", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<AddColumnDialog open onOpenChange={() => {}} onAdd={onAdd} />)

    await user.type(screen.getByLabelText("Name"), "Work email")
    await user.click(screen.getByLabelText("Type"))
    await user.hover(screen.getByRole("option", { name: "Text" }))
    await user.click(screen.getByRole("option", { name: "Email" }))

    const regex = screen.getByLabelText("Regex")
    expect(regex).toHaveValue(TEXT_FORMAT_REGEX.email)

    await user.click(screen.getByRole("button", { name: "Add column" }))

    expect(onAdd).toHaveBeenCalledWith({
      name: "Work email",
      variant: "short-text",
      regex: TEXT_FORMAT_REGEX.email,
      textFormat: "email",
    })
  })

  it("prefills and saves an existing column", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <AddColumnDialog
        open
        column={{
          id: "email",
          name: "Email",
          variant: "short-text",
          textFormat: "email",
          regex: TEXT_FORMAT_REGEX.email,
        }}
        onOpenChange={() => {}}
        onAdd={onAdd}
      />
    )

    expect(screen.getByRole("dialog", { name: "Edit column" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("Email")
    expect(screen.getByLabelText("Regex")).toHaveValue(TEXT_FORMAT_REGEX.email)

    await user.clear(screen.getByLabelText("Name"))
    await user.type(screen.getByLabelText("Name"), "Work email")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(onAdd).toHaveBeenCalledWith({
      name: "Work email",
      variant: "short-text",
      regex: TEXT_FORMAT_REGEX.email,
      textFormat: "email",
    })
  })

  it("does not show a schema preview for time or datetime columns", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<AddColumnDialog open onOpenChange={() => {}} onAdd={onAdd} />)

    await user.type(screen.getByLabelText("Name"), "Starts at")
    await user.click(screen.getByLabelText("Type"))
    await user.click(screen.getByRole("option", { name: "Time" }))

    expect(screen.queryByLabelText("Time schema")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Schema")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Include seconds")).toBeInTheDocument()

    await user.click(screen.getByLabelText("Type"))
    await user.click(screen.getByRole("option", { name: "Datetime" }))

    expect(screen.queryByLabelText("Time schema")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Schema")).not.toBeInTheDocument()
    await user.click(screen.getByLabelText("Include seconds"))
    await user.click(screen.getByRole("button", { name: "Add column" }))

    expect(onAdd).toHaveBeenCalledWith({
      name: "Starts at",
      variant: "datetime",
      showSeconds: true,
    })
  })
})
