import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import type { Agent } from "../model/types"
import { AgentList } from "./AgentList"

const agent: Agent = {
  id: "agent-long",
  name: "Support copilot with a very long display name",
  description: "Answers customer questions with shared support memory and extra context.",
  instructions: "",
  model: "grok-4.6",
  icon: "headset",
  memoryBaseIds: [],
  knowledgeBaseIds: [],
  workflowIds: [],
  capabilityIds: ["file_retrieval"],
  updatedAt: 1,
}

describe("AgentList", () => {
  it("truncates long names and descriptions so they ellipsize", () => {
    render(
      <MemoryRouter>
        <div className="w-48">
          <AgentList agents={[agent]} selectedId={agent.id} />
        </div>
      </MemoryRouter>
    )

    const link = screen.getByRole("link", { name: /Support copilot/ })
    expect(link).toHaveClass("min-w-0")
    expect(screen.getByText(agent.name)).toHaveClass("truncate")
    expect(screen.getByText(agent.description)).toHaveClass("truncate")
    expect(link.querySelector("svg")).toBeInTheDocument()
  })

  it("shows an empty list state with create action", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <MemoryRouter>
        <AgentList agents={[]} onCreate={onCreate} />
      </MemoryRouter>
    )

    expect(screen.getByTestId("agents-empty-list")).toBeInTheDocument()
    expect(screen.getByText("No agents yet")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New agent" }))
    expect(onCreate).toHaveBeenCalled()
  })
})
