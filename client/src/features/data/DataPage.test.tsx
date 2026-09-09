import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { DataPage } from "./DataPage"
import { resetDataStore } from "./model/store"

function renderData(path = "/data") {
  const router = createMemoryRouter([{ path: "/data", Component: DataPage }], {
    initialEntries: [path],
  })

  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("DataPage", () => {
  beforeEach(() => {
    resetDataStore()
  })

  it("shows a database tree and the selected users table", () => {
    renderData()

    expect(screen.getByRole("heading", { name: "Data" })).toBeInTheDocument()
    expect(screen.getByRole("tree", { name: "Databases" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /production/ })).toBeInTheDocument()
    expect(
      screen.getAllByRole("treeitem", { name: /users/ }).some(
        (item) => item.getAttribute("aria-selected") === "true"
      )
    ).toBe(true)
    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Email/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Created At/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Updated At/ })).toBeInTheDocument()
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()
  })

  it("toggles a database folder without leaving the selected table", async () => {
    const user = userEvent.setup()
    renderData()

    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Email/ })).toBeInTheDocument()

    await user.click(screen.getByRole("treeitem", { name: /production/ }))

    expect(screen.queryByRole("heading", { name: "Select a table" })).not.toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Email/ })).toBeInTheDocument()
    expect(screen.queryByRole("treeitem", { name: /orders/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole("treeitem", { name: /production/ }))

    expect(screen.getByRole("treeitem", { name: /orders/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Email/ })).toBeInTheDocument()
  })

  it("opens a name prompt when creating a table", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "New table" }))

    expect(screen.getByRole("dialog", { name: "New table" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Table name")).toBeInTheDocument()
  })

  it("creates a table from the name prompt", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "New table" }))
    await user.type(screen.getByLabelText("Name"), "sessions")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(screen.getByRole("treeitem", { name: /sessions/ })).toBeInTheDocument()
  })

  it("adds a column from the trailing add-column control", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "Add column" }))

    expect(screen.getByRole("dialog", { name: "Add column" })).toBeInTheDocument()

    await user.type(screen.getByLabelText("Name"), "Phone")
    await user.click(
      within(screen.getByRole("dialog", { name: "Add column" })).getByRole("button", {
        name: "Add column",
      })
    )

    expect(screen.getByRole("columnheader", { name: /Phone/ })).toBeInTheDocument()

    const grid = screen.getByRole("grid", { name: "Data grid" })
    expect(grid.getAttribute("style")).toMatch(/--col-phone-size/)
    expect(grid.getAttribute("style")).toMatch(/--header-phone-size/)
    expect(grid.getAttribute("style")).toMatch(/--col-createdAt-size/)

    const headerRow = screen.getByRole("button", { name: "Phone" }).closest(
      "[data-slot='grid-header-row']"
    )
    const headerCells = headerRow?.querySelectorAll("[data-slot='grid-header-cell']")
    const headerNames = [...(headerCells ?? [])].map((cell) => cell.textContent)
    expect(headerNames?.join(" ")).toMatch(/Phone.*Created At.*Updated At/)
  })

  it("deletes a column from the header menu", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "Email" }))
    await user.click(screen.getByRole("menuitem", { name: "Delete column" }))

    expect(screen.queryByRole("columnheader", { name: /Email/ })).not.toBeInTheDocument()
    expect(screen.queryByText("ada@vanteg.dev")).not.toBeInTheDocument()
  })

  it("does not offer delete on created at or updated at", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "Created At" }))
    expect(screen.queryByRole("menuitem", { name: "Delete column" })).not.toBeInTheDocument()
    expect(screen.queryByRole("menuitem", { name: "Edit column" })).not.toBeInTheDocument()
  })

  it("edits a column from the header menu", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "Email" }))
    await user.click(screen.getByRole("menuitem", { name: "Edit column" }))

    expect(screen.getByRole("dialog", { name: "Edit column" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveValue("Email")

    await user.clear(screen.getByLabelText("Name"))
    await user.type(screen.getByLabelText("Name"), "Work email")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(screen.getByRole("columnheader", { name: /Work email/ })).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /^Email / })).not.toBeInTheDocument()
  })

  it("moves a column left and right from the header menu", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("button", { name: "Name" }))
    expect(screen.getByRole("menuitem", { name: "Move left" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("button", { name: "Updated At" }))
    expect(screen.getByRole("menuitem", { name: "Move right" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("button", { name: "Email" }))
    await user.click(screen.getByRole("menuitem", { name: "Move left" }))

    const headerRow = screen.getByRole("button", { name: "Email" }).closest(
      "[data-slot='grid-header-row']"
    )
    const headerNames = [
      ...(headerRow?.querySelectorAll("[data-slot='grid-header-cell']") ?? []),
    ].map((cell) => cell.textContent)

    expect(headerNames[0]).toMatch(/Email/)
    expect(headerNames[1]).toMatch(/Name/)

    await user.click(screen.getByRole("button", { name: "Email" }))
    await user.click(screen.getByRole("menuitem", { name: "Move right" }))

    const restoredNames = [
      ...(screen
        .getByRole("button", { name: "Name" })
        .closest("[data-slot='grid-header-row']")
        ?.querySelectorAll("[data-slot='grid-header-cell']") ?? []),
    ].map((cell) => cell.textContent)

    expect(restoredNames[0]).toMatch(/Name/)
    expect(restoredNames[1]).toMatch(/Email/)
  })

  it("makes data column headers draggable", () => {
    renderData()

    expect(screen.getByRole("button", { name: "Email" })).toHaveAttribute("draggable")
    expect(screen.getByRole("button", { name: "Created At" })).toHaveAttribute("draggable")
    expect(screen.getByRole("button", { name: "Add column" })).not.toHaveAttribute("draggable")
  })

  it("places add column after the last data column in the scrollable header", () => {
    renderData()

    const addColumn = screen.getByRole("button", { name: "Add column" })
    expect(addColumn.closest("[data-slot='grid-add-column']")).not.toHaveClass("sticky")

    const headerRow = addColumn.closest("[data-slot='grid-header-row']")
    const headerCells = headerRow?.querySelectorAll(
      "[data-slot='grid-header-cell'], [data-slot='grid-add-column']"
    )
    expect(headerCells?.[headerCells.length - 1]).toHaveAttribute(
      "data-slot",
      "grid-add-column"
    )
    expect(headerCells?.[headerCells.length - 2]?.textContent).toMatch(/Updated At/)
  })

  it("shows a variable tree and data table", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("tab", { name: "Variables" }))

    expect(screen.getByRole("tree", { name: "Variable groups" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Global/ })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Key/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Value/ })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toHaveAttribute(
      "aria-rowcount",
      "4"
    )
    expect(screen.queryByRole("button", { name: "Edit APP_NAME" })).not.toBeInTheDocument()
  })

  it("shows a secrets tree and data table with hidden values", async () => {
    const user = userEvent.setup()
    renderData()

    await user.click(screen.getByRole("tab", { name: "Secrets" }))

    expect(screen.getByRole("tree", { name: "Secret groups" })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Key/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Secret/ })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toHaveAttribute(
      "aria-rowcount",
      "3"
    )
    expect(screen.queryByText("dev-jwt-secret")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Edit JWT_SECRET" })).not.toBeInTheDocument()
  })

  it("asks for a key and a secret in the new secret dialog", async () => {
    const user = userEvent.setup()
    renderData("/data?tab=secrets")

    await user.click(screen.getByRole("button", { name: "New secret" }))

    expect(screen.getByRole("dialog", { name: "New secret" })).toBeInTheDocument()
    expect(screen.getByLabelText("Key")).toBeInTheDocument()
    expect(screen.getByLabelText("Secret")).toBeInTheDocument()
    expect(screen.getByLabelText("Secret")).not.toHaveAttribute("type", "password")

    await user.type(screen.getByLabelText("Secret"), "hidden")

    expect(screen.getByLabelText("Secret")).toHaveValue("*****n")
  })

  it("asks for a key and a value in the new variable dialog", async () => {
    const user = userEvent.setup()
    renderData("/data?tab=variables")

    await user.click(screen.getByRole("button", { name: "New variable" }))

    expect(screen.getByRole("dialog", { name: "New variable" })).toBeInTheDocument()
    expect(screen.getByLabelText("Key")).toBeInTheDocument()
    expect(screen.getByLabelText("Value")).toBeInTheDocument()
  })
})
