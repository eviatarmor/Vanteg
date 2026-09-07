import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { listWorkflows, resetWorkflows } from "./model/store"
import { WorkflowsPage } from "./WorkflowsPage"

function renderWorkflows(path = "/workflows") {
  const router = createMemoryRouter(
    [
      { path: "/workflows", Component: WorkflowsPage },
      {
        path: "/workflows/:workflowId",
        Component: function EditorStub() {
          return <p>Workflow editor</p>
        },
      },
    ],
    { initialEntries: [path] }
  )

  return render(<RouterProvider router={router} />)
}

describe("WorkflowsPage", () => {
  beforeEach(() => {
    resetWorkflows()
  })

  it("shows an empty card instead of a placeholder sentence", () => {
    renderWorkflows()

    expect(screen.getByRole("heading", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByText("Build, draft, and run automations.")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "No production workflows" })).toBeInTheDocument()
    expect(
      screen.queryByText("Deployed workflows will appear here.")
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New workflow" }).length).toBeGreaterThan(0)
  })

  it("creates a named draft immediately and opens the editor", async () => {
    const user = userEvent.setup()
    renderWorkflows()

    await user.click(screen.getAllByRole("button", { name: "New workflow" })[0]!)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByText("Workflow editor")).toBeInTheDocument()
    expect(listWorkflows("draft")).toHaveLength(1)
    expect(listWorkflows("draft")[0]?.name).toBe("Untitled workflow")
  })

  it("opens drafts from the tab query", async () => {
    renderWorkflows("/workflows?tab=drafts")

    expect(screen.getByRole("heading", { name: "No draft workflows" })).toBeInTheDocument()
  })
})
