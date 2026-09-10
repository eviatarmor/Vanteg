import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider, useLocation } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import {
  getAssistantOpen,
  resetAssistantOpen,
} from "@/features/assistant/model/open-store"
import { resetAgents } from "@/features/agents/model/store"
import { resetInbox } from "@/features/inbox/model/store"
import { resetTeams } from "@/features/teams/model/store"
import {
  createDraft,
  resetWorkflows,
  saveWorkflow,
} from "@/features/workflows/model/store"

import { AppSearch } from "./AppSearch"

function SearchHarness() {
  const location = useLocation()
  return (
    <>
      <AppSearch />
      <p>{`${location.pathname}${location.search}`}</p>
    </>
  )
}

function renderSearch(path = "/") {
  const router = createMemoryRouter(
    [
      { path: "/", Component: SearchHarness },
      { path: "/inbox", Component: SearchHarness },
      { path: "/workflows/:workflowId", Component: SearchHarness },
      { path: "/agents/:agentId?", Component: SearchHarness },
      { path: "/teams/:teamId?", Component: SearchHarness },
      { path: "/integrations", Component: SearchHarness },
      { path: "/settings", Component: SearchHarness },
      { path: "/data", Component: SearchHarness },
      { path: "/api-keys", Component: SearchHarness },
    ],
    { initialEntries: [path] }
  )
  return render(<RouterProvider router={router} />)
}

describe("AppSearch", () => {
  beforeEach(() => {
    resetWorkflows()
    resetInbox()
    resetAgents()
    resetTeams()
    resetAssistantOpen()
  })

  it("shows a search field in the top bar", () => {
    renderSearch()

    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument()
  })

  it("lists matching workflows and opens one", async () => {
    const user = userEvent.setup()
    const workflow = createDraft()
    saveWorkflow(workflow.id, { name: "Form intake" })
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "intake")

    expect(
      screen.getByRole("option", { name: "Form intake" })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: "Form intake" }))

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("")
    expect(screen.getByText(`/workflows/${workflow.id}`)).toBeInTheDocument()
  })

  it("clears the query from a control that fills the field", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "lasdasd"
    )

    expect(screen.queryByText("Ctrl+K")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear search" }))

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("")
  })

  it("finds inbox items", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "credential"
    )

    expect(
      screen.getByRole("option", { name: /Slack credential needs renewal/i })
    ).toBeInTheDocument()
  })

  it("shows command actions and creates a workflow", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "create workflow"
    )

    expect(
      screen.getByRole("option", { name: "Create workflow" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "Create workflow" }))

    expect(screen.getByText(/\/workflows\//)).toBeInTheDocument()
  })

  it("creates an agent from the palette", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "create agent"
    )

    expect(
      screen.getByRole("option", { name: "Create agent" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "Create agent" }))

    expect(screen.getByText(/\/agents\//)).toBeInTheDocument()
  })

  it("opens the assistant from the palette", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "assistant"
    )
    await user.click(screen.getByRole("option", { name: "Open Assistant" }))

    expect(getAssistantOpen()).toBe(true)
  })

  it("jumps to integrations from an action", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "integrations"
    )
    await user.click(screen.getByRole("option", { name: "Go to Connectors" }))

    expect(screen.getByText("/integrations")).toBeInTheDocument()
  })

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "zzznomatchxyz"
    )

    expect(screen.getByText("No results")).toBeInTheDocument()
    expect(screen.getByText(/No matches for/)).toBeInTheDocument()
  })

  it("shows recent workflows and agents with an empty query", async () => {
    const user = userEvent.setup()
    const workflow = createDraft()
    saveWorkflow(workflow.id, { name: "Recent form" })
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))

    expect(screen.getByText("Recent workflows")).toBeInTheDocument()
    expect(screen.getByText("Recent agents")).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Recent form" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Create workflow" })
    ).toBeInTheDocument()
  })
})
