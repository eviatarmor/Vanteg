import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAgents } from "@/features/agents/model/store"
import { resetInbox } from "@/features/inbox/model/store"

import { HomePage } from "./HomePage"
import { failNextHomeLoad, resetHomeLoadFlags } from "./model/load"

function hrefsToTemplates(): HTMLElement[] {
  return screen.queryAllByRole("link").filter((link) => {
    const href = link.getAttribute("href") ?? ""
    return href === "/templates" || href.startsWith("/templates/")
  })
}

describe("HomePage", () => {
  beforeEach(() => {
    resetAgents()
    resetInbox()
    resetHomeLoadFlags()
    window.localStorage.clear()
  })

  it("renders Home without a Quick actions section", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Quick actions" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("region", { name: "Quick actions" })
    ).not.toBeInTheDocument()
    expect(hrefsToTemplates()).toHaveLength(0)
    await waitFor(() => {
      expect(screen.getByText("Overview")).toBeInTheDocument()
    })
  })

  it("shows a stats skeleton then workspace stats and a multi-column suggestion grid", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByTestId("home-stats-skeleton")).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Getting started" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "You're all set" })
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Overview")).toBeInTheDocument()
      expect(screen.getByText("Waiting on you")).toBeInTheDocument()
    })

    expect(screen.getByText("Runs this week")).toBeInTheDocument()
    expect(screen.getByText("Agents")).toBeInTheDocument()
    expect(screen.getByText("Workflows")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Suggested for you" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Route failed HTTP Request runs to Support copilot")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Open Support copilot/i })
    ).toHaveAttribute("href", "/agents/agent-support")
    expect(
      screen.queryByRole("link", { name: /Browse templates/i })
    ).not.toBeInTheDocument()
    expect(hrefsToTemplates()).toHaveLength(0)

    const suggestionHeading = screen.getByRole("heading", {
      name: "Suggested for you",
    })
    const suggestionSection = suggestionHeading.closest("section")
    expect(suggestionSection).toBeTruthy()
    const cards = within(suggestionSection!).getAllByRole("article")
    expect(cards.length).toBeGreaterThanOrEqual(3)
    const cardGrid = cards[0]!.parentElement
    expect(cardGrid?.className ?? "").toMatch(
      /\b(?:\S+:)?grid-cols-(?:[2-9]|1[0-2])\b/
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
    expect(
      screen.queryByRole("heading", { name: "Getting started" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))

    await waitFor(() => {
      expect(screen.getByText("Waiting on you")).toBeInTheDocument()
    })
  })
})
