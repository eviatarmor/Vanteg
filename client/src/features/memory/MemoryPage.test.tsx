import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { MemoryPage } from "./MemoryPage"
import { getMemorySnapshot, resetMemoryStore } from "./model/store"

function renderMemory(path = "/memory") {
  const router = createMemoryRouter([{ path: "/memory", Component: MemoryPage }], {
    initialEntries: [path],
  })
  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("MemoryPage", () => {
  beforeEach(() => {
    resetMemoryStore()
  })

  it("shows memory bases by default without a memories tab", () => {
    renderMemory()

    expect(screen.getByRole("heading", { name: "Memory" })).toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Memories" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "New memory" })).not.toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Memory bases" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: "Knowledge bases" })).toBeInTheDocument()
    expect(screen.getByRole("tree", { name: "Memory bases" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Workspace/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Workspace" })).toBeInTheDocument()
    expect(screen.queryByText("Shared facts every agent can use.")).not.toBeInTheDocument()
    expect(screen.queryByText("Agents can share these memories.")).not.toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Content/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Created At/ })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Data grid" })).toHaveAttribute(
      "aria-rowcount",
      "3"
    )
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()
  })

  it("creates a memory base from the name prompt", async () => {
    const user = userEvent.setup()
    renderMemory()

    await user.click(screen.getByRole("button", { name: "New memory base" }))
    await user.type(screen.getByLabelText("Name"), "Sales")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(screen.getByRole("treeitem", { name: /Sales/ })).toBeInTheDocument()
  })

  it("uploads a text file into the selected knowledge base", async () => {
    const user = userEvent.setup()
    renderMemory()

    await user.click(screen.getByRole("tab", { name: "Knowledge bases" }))

    const file = new File(["# Retrieval notes"], "notes.md", { type: "text/markdown" })
    await user.upload(screen.getByLabelText("Knowledge files"), file)

    expect(screen.getByRole("grid", { name: "Data grid" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /Status/ })).not.toBeInTheDocument()
    expect(getMemorySnapshot().documents.some((document) => document.name === "notes.md")).toBe(
      true
    )
    expect(screen.getByRole("grid", { name: "Data grid" })).toHaveAttribute(
      "aria-rowcount",
      "3"
    )
  })
})
