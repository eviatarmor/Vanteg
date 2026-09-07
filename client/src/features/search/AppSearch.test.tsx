import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider, useLocation } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { createDraft, resetWorkflows, saveWorkflow } from "@/features/workflows/model/store"

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
      { path: "/integrations", Component: SearchHarness },
      { path: "/api-keys", Component: SearchHarness },
    ],
    { initialEntries: [path] }
  )
  return render(<RouterProvider router={router} />)
}

describe("AppSearch", () => {
  beforeEach(() => {
    resetWorkflows()
  })

  it("shows a search field in the top bar", () => {
    renderSearch()

    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument()
  })

  it("lists matching workflows and opens one", async () => {
    const user = userEvent.setup()
    const workflow = createDraft()
    saveWorkflow(workflow.id, { name: "Form intake" })
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "intake")

    expect(screen.getByRole("option", { name: "Form intake" })).toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: "Form intake" }))

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("")
    expect(screen.getByText(`/workflows/${workflow.id}`)).toBeInTheDocument()
  })

  it("finds inbox items", async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole("searchbox", { name: "Search" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "webhook")

    expect(screen.getByRole("option", { name: /Webhook delivery/i })).toBeInTheDocument()
  })
})
