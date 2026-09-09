import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAgents } from "@/features/agents/model/store"
import { resetInbox } from "@/features/inbox/model/store"

import { HomePage } from "./HomePage"

describe("HomePage", () => {
  beforeEach(() => {
    resetAgents()
    resetInbox()
  })

  it("shows workspace stats and automation suggestions", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("Waiting on you")).toBeInTheDocument()
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
    expect(screen.queryByRole("heading", { name: "Nothing on the dashboard yet" })).not.toBeInTheDocument()
  })
})
