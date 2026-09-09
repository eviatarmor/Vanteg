import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import {
  createDraft,
  holdNextWorkflowsLoad,
  listWorkflows,
  releaseWorkflowsLoad,
  resetWorkflows,
  saveWorkflow,
  setWorkflowsLoadFailureOnce,
} from "./model/store"
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
      {
        path: "/templates",
        Component: function TemplatesStub() {
          return <p>Templates destination</p>
        },
      },
    ],
    { initialEntries: [path] }
  )

  return {
    router,
    ...render(<RouterProvider router={router} />),
  }
}

describe("WorkflowsPage", () => {
  beforeEach(() => {
    resetWorkflows()
  })

  it("shows a loading skeleton then an empty card with create and browse templates", async () => {
    const { router } = renderWorkflows()

    expect(screen.getByTestId("workflows-skeleton")).toBeInTheDocument()
    expect(screen.getByLabelText("Loading workflows")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByText("Build, draft, and run automations.")).toBeInTheDocument()

    expect(
      await screen.findByRole("heading", { name: "No production workflows" })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Create a workflow to start connecting triggers and actions/i)
    ).toBeInTheDocument()
    expect(screen.queryByText("Deployed workflows will appear here.")).not.toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New workflow" }).length).toBeGreaterThan(0)

    await userEvent.setup().click(screen.getByRole("button", { name: "Browse templates" }))
    expect(router.state.location.pathname).toBe("/templates")
  })

  it("creates a named draft immediately and opens the editor", async () => {
    const user = userEvent.setup()
    renderWorkflows()
    await screen.findByRole("heading", { name: "No production workflows" })

    await user.click(screen.getAllByRole("button", { name: "New workflow" })[0]!)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByText("Workflow editor")).toBeInTheDocument()
    expect(listWorkflows("draft")).toHaveLength(1)
    expect(listWorkflows("draft")[0]?.name).toBe("Untitled workflow")
  })

  it("opens drafts from the tab query", async () => {
    renderWorkflows("/workflows?tab=drafts")

    expect(
      await screen.findByRole("heading", { name: "No draft workflows" })
    ).toBeInTheDocument()
  })

  it("holds the skeleton while hydrating", async () => {
    holdNextWorkflowsLoad()
    renderWorkflows()

    expect(screen.getByTestId("workflows-skeleton")).toBeInTheDocument()
    expect(screen.getByLabelText("Loading workflows")).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "No production workflows" })
    ).not.toBeInTheDocument()

    releaseWorkflowsLoad()
    expect(
      await screen.findByRole("heading", { name: "No production workflows" })
    ).toBeInTheDocument()
  })

  it("shows an error panel and retries hydration", async () => {
    const user = userEvent.setup()
    setWorkflowsLoadFailureOnce()
    renderWorkflows()

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("Couldn’t load workflows")).toBeInTheDocument()
    expect(screen.getByText("Failed to load workflows")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(
      await screen.findByRole("heading", { name: "No production workflows" })
    ).toBeInTheDocument()
  })

  it("filters the list with search", async () => {
    const user = userEvent.setup()
    const first = createDraft()
    saveWorkflow(first.id, { name: "Lead alerts", status: "prod" })
    const second = createDraft()
    saveWorkflow(second.id, { name: "Onboarding", status: "prod" })

    renderWorkflows()

    await screen.findByRole("list", { name: "Workflows" })
    const search = screen.getByRole("textbox", { name: "Search workflows" })
    await user.type(search, "Lead")

    await waitFor(() => {
      expect(screen.getByText("Lead alerts")).toBeInTheDocument()
      expect(screen.queryByText("Onboarding")).not.toBeInTheDocument()
    })
  })
})
