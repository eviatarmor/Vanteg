import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

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

    render(
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    )

    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Deploy" })).toBeInTheDocument()
    expect(screen.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument()
    expect(screen.queryByRole("complementary", { name: "Workflow assistant" })).not.toBeInTheDocument()
  })

  it("shows a not-found state for unknown ids", () => {
    const router = createMemoryRouter(
      [{ path: "/workflows/:workflowId", Component: WorkflowEditorPage }],
      { initialEntries: ["/workflows/missing"] }
    )

    render(
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    )

    expect(screen.getByText("This workflow was not found.")).toBeInTheDocument()
  })
})
