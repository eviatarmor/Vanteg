import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { resetAgents } from "@/features/agents/model/store"

import { TeamsPage } from "./TeamsPage"
import { resetTeams } from "./model/store"

function renderTeams(path = "/teams") {
  const router = createMemoryRouter(
    [
      { path: "/teams", Component: TeamsPage },
      { path: "/teams/:teamId", Component: TeamsPage },
    ],
    { initialEntries: [path] }
  )
  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("TeamsPage", () => {
  beforeEach(() => {
    resetAgents()
    resetTeams()
  })

  it("lists seeded teams with a create action", () => {
    renderTeams()

    expect(screen.getByRole("heading", { name: "Teams" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Software engineering/ })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New team" }).length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Select a team" })).toBeInTheDocument()
  })

  it("opens a team graph with lead and senior SWE agents", () => {
    renderTeams("/teams/team-swe")

    expect(screen.getAllByText("Lead SWE").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Senior SWE").length).toBeGreaterThan(0)
    expect(screen.getByText("Lead SWE agent")).toBeInTheDocument()
  })

  it("adds an agent from the canvas menu", async () => {
    const user = userEvent.setup()
    renderTeams("/teams/team-swe")

    const pane = document.querySelector(".react-flow__pane")
    expect(pane).not.toBeNull()
    fireEvent.contextMenu(pane!)

    await user.click(screen.getByRole("menuitem", { name: "Add member" }))
    await user.click(screen.getByRole("button", { name: /Research analyst/ }))

    expect(screen.getByText("Research analyst")).toBeInTheDocument()
  })
})
