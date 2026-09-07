import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ExplorerTree } from "./ExplorerTree"

describe("ExplorerTree", () => {
  it("expands folders and reports the selected leaf", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ExplorerTree
        aria-label="Databases"
        selectedId="users"
        onSelect={onSelect}
        defaultExpanded={["production", "public"]}
        nodes={[
          {
            id: "production",
            label: "production",
            icon: "database",
            children: [
              {
                id: "public",
                label: "public",
                icon: "schema",
                children: [{ id: "users", label: "users", icon: "table" }],
              },
            ],
          },
        ]}
      />
    )

    expect(screen.getByRole("tree", { name: "Databases" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /users/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    await user.click(screen.getByRole("treeitem", { name: /production/ }))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole("treeitem", { name: /production/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    )
    expect(screen.queryByRole("treeitem", { name: /users/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole("treeitem", { name: /production/ }))

    expect(screen.getByRole("treeitem", { name: /users/ })).toBeInTheDocument()
  })

  it("selects a leaf without toggling folders", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ExplorerTree
        aria-label="Databases"
        onSelect={onSelect}
        defaultExpanded={["production", "public"]}
        nodes={[
          {
            id: "production",
            label: "production",
            icon: "database",
            children: [
              {
                id: "public",
                label: "public",
                icon: "schema",
                children: [{ id: "users", label: "users", icon: "table" }],
              },
            ],
          },
        ]}
      />
    )

    await user.click(screen.getByRole("treeitem", { name: /users/ }))

    expect(onSelect).toHaveBeenCalledWith("users")
  })
})
