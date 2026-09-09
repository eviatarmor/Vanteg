import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAgents } from "@/features/agents/model/store"
import { resetInbox } from "@/features/inbox/model/store"

import { HomePage } from "./HomePage"
import { failNextHomeLoad, resetHomeLoadFlags } from "./model/load"
import { dismissOnboarding, resetOnboarding } from "./model/onboarding-store"

describe("HomePage", () => {
  beforeEach(() => {
    resetAgents()
    resetInbox()
    resetHomeLoadFlags()
    resetOnboarding()
    window.localStorage.clear()
  })

  it("shows quick action CTAs to templates, assistant, workflows, and agents", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Quick actions" })).toBeInTheDocument()

    const actions = screen.getByRole("region", { name: "Quick actions" })
    expect(within(actions).getByRole("link", { name: "Templates" })).toHaveAttribute(
      "href",
      "/templates"
    )
    expect(within(actions).getByRole("link", { name: "Assistant" })).toHaveAttribute(
      "href",
      "/assistant"
    )
    expect(within(actions).getByRole("link", { name: "New workflow" })).toHaveAttribute(
      "href",
      "/workflows"
    )
    expect(within(actions).getByRole("link", { name: "New agent" })).toHaveAttribute(
      "href",
      "/agents"
    )
  })

  it("shows a stats skeleton then workspace stats, suggestions, and the onboarding checklist", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByTestId("home-stats-skeleton")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Getting started" })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Overview")).toBeInTheDocument()
      expect(screen.getByText("Waiting on you")).toBeInTheDocument()
    })

    expect(screen.getByText("Runs this week")).toBeInTheDocument()
    expect(screen.getByText("Agents")).toBeInTheDocument()
    expect(screen.getByText("Workflows")).toBeInTheDocument()
    expect(screen.getByText("Suggested for you")).toBeInTheDocument()
    expect(
      screen.getByText("Route failed HTTP Request runs to Support copilot")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Open Support copilot/i })).toHaveAttribute(
      "href",
      "/agents/agent-support"
    )
    expect(screen.getByRole("link", { name: /Browse templates/i })).toHaveAttribute(
      "href",
      "/templates"
    )
    expect(
      screen.queryByRole("heading", { name: "Nothing on the dashboard yet" })
    ).not.toBeInTheDocument()
  })

  it("shows human error copy and retries overview load", async () => {
    const user = userEvent.setup()
    failNextHomeLoad()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("Could not load overview")).toBeInTheDocument()
    expect(
      screen.getByText(/couldn't load workspace stats/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))

    await waitFor(() => {
      expect(screen.getByText("Waiting on you")).toBeInTheDocument()
    })
  })

  it("hides the checklist after it was dismissed", () => {
    dismissOnboarding()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    expect(screen.queryByRole("heading", { name: "Getting started" })).not.toBeInTheDocument()
  })
})
