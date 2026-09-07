import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetConversations } from "./model/assistant-store"
import { createDraft, resetWorkflows } from "./model/store"
import { WorkflowEditorPage } from "./WorkflowEditorPage"

describe("WorkflowEditorPage", () => {
  beforeEach(() => {
    resetWorkflows()
    resetConversations()
  })

  it("renders the named draft editor", () => {
    const workflow = createDraft()
    const router = createMemoryRouter(
      [{ path: "/workflows/:workflowId", Component: WorkflowEditorPage }],
      { initialEntries: [`/workflows/${workflow.id}`] }
    )

    render(<RouterProvider router={router} />)

    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument()
    expect(
      screen.getByText("Right-click the canvas to add a step. Double-click a node to edit it.")
    ).toBeInTheDocument()
    expect(screen.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument()
    expect(screen.queryByRole("complementary", { name: "Workflow assistant" })).not.toBeInTheDocument()
  })

  it("shows a not-found state for unknown ids", () => {
    const router = createMemoryRouter(
      [{ path: "/workflows/:workflowId", Component: WorkflowEditorPage }],
      { initialEntries: ["/workflows/missing"] }
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByText("This workflow was not found.")).toBeInTheDocument()
  })
})
