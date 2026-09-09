import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { resetAgents } from "@/features/agents/model/store"

import { TeamsPage } from "./TeamsPage"
import { createTeam, resetTeams } from "./model/store"

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

  it("uses the shared canvas toolbar instead of default React Flow controls", () => {
    renderTeams("/teams/team-swe")

    expect(document.querySelector(".react-flow__controls")).toBeNull()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Fit view" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lock canvas" })).toBeInTheDocument()
  })

  it("adds an agent from the canvas menu with role and field chips", async () => {
    const user = userEvent.setup()
    renderTeams("/teams/team-swe")

    const pane = document.querySelector(".react-flow__pane")
    expect(pane).not.toBeNull()
    fireEvent.contextMenu(pane!)

    await user.click(screen.getByRole("menuitem", { name: "Add member" }))

    expect(screen.getByRole("dialog", { name: "Add member" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Lead" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-pressed", "false")

    await user.click(screen.getByRole("radio", { name: "Researcher" }))
    await user.click(screen.getByRole("button", { name: "Knowledge" }))
    await user.click(screen.getByRole("option", { name: /Research analyst/ }))
    await user.click(screen.getByRole("button", { name: "Add member" }))

    expect(screen.getByText("Research analyst")).toBeInTheDocument()
    expect(screen.getAllByText("Researcher").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Knowledge").length).toBeGreaterThan(0)
  })

  it("shows an empty-team CTA to add the first member", async () => {
    const user = userEvent.setup()
    const team = createTeam("Blank ops")
    renderTeams(`/teams/${team.id}`)

    expect(screen.getByText("No members yet")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add member" }))
    expect(screen.getByRole("dialog", { name: "Add member" })).toBeInTheDocument()
  })

  it("opens the member sheet with structured role options", async () => {
    const user = userEvent.setup()
    renderTeams("/teams/team-swe")

    const leadLabel = screen.getAllByText("Lead SWE agent")[0]
    fireEvent.doubleClick(leadLabel.closest(".react-flow__node") ?? leadLabel)

    const sheet = await screen.findByRole("dialog")
    expect(within(sheet).getByText(/Set the role and which fields/i)).toBeInTheDocument()
    expect(within(sheet).getByRole("radio", { name: "Custom" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(within(sheet).getByRole("button", { name: "Save member" })).toBeInTheDocument()

    await user.click(within(sheet).getByRole("radio", { name: "Lead" }))
    await user.click(within(sheet).getByRole("button", { name: "Save member" }))

    expect(screen.getAllByText("Lead").length).toBeGreaterThan(0)
  })
})
