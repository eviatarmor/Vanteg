import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { resetMemoryStore } from "@/features/memory/model/store"

import { AgentsPage } from "./AgentsPage"
import { resetAgents } from "./model/store"

function renderAgents(path = "/agents") {
  const router = createMemoryRouter(
    [
      { path: "/agents", Component: AgentsPage },
      { path: "/agents/:agentId", Component: AgentsPage },
    ],
    { initialEntries: [path] }
  )
  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("AgentsPage", () => {
  beforeEach(() => {
    resetAgents()
    resetMemoryStore()
  })

  it("lists seeded agents and a create action", () => {
    renderAgents()

    expect(screen.getByRole("heading", { name: "Agents" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Support copilot/ })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New agent" }).length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Select an agent" })).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Select an agent" }).closest("section")
    ).toHaveClass("flex", "flex-col")
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()
  })

  it("opens an agent and assigns a memory base", async () => {
    const user = userEvent.setup()
    renderAgents("/agents/agent-research")

    expect(screen.getByLabelText("Name")).toHaveValue("Research analyst")
    expect(screen.getByRole("radio", { name: "Research" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByLabelText("Workspace")).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Support" })).not.toBeChecked()

    await user.click(screen.getByRole("checkbox", { name: "Support" }))

    expect(screen.getByRole("checkbox", { name: "Support" })).toBeChecked()
  })

  it("groups models by company with icons in the model selector", async () => {
    const user = userEvent.setup()
    renderAgents("/agents/agent-research")

    const trigger = screen.getByRole("button", { name: "Model" })
    expect(trigger).toHaveTextContent("Grok 4.6")
    expect(trigger.querySelector('img[alt="xai logo"]')).toBeInTheDocument()

    await user.click(trigger)

    const picker = screen.getByRole("dialog", { name: "Model Selector" })
    for (const company of ["OpenAI", "Anthropic", "Google", "xAI", "Moonshot", "Z.ai", "Meta"]) {
      expect(within(picker).getByText(company)).toBeInTheDocument()
    }
    expect(within(picker).queryByText("Mistral")).not.toBeInTheDocument()
    expect(within(picker).queryByText("DeepSeek")).not.toBeInTheDocument()
    expect(within(picker).getByRole("option", { name: /GPT-6 Astra/i })).toBeInTheDocument()
    expect(within(picker).getByRole("option", { name: /Muse Spark/i })).toBeInTheDocument()
    expect(picker.querySelector('img[alt="openai logo"]')).toBeInTheDocument()
    expect(picker.querySelector('img[alt="anthropic logo"]')).toBeInTheDocument()

    await user.click(within(picker).getByRole("option", { name: /GPT-6 Astra/i }))

    expect(screen.getByRole("button", { name: "Model" })).toHaveTextContent("GPT-6 Astra")
  })

  it("creates an agent from the name prompt", async () => {
    const user = userEvent.setup()
    renderAgents()

    await user.click(screen.getAllByRole("button", { name: "New agent" })[0]!)
    await user.type(screen.getByLabelText("Name"), "Inbox triager")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(screen.getByLabelText("Name")).toHaveValue("Inbox triager")
    expect(screen.getByRole("link", { name: /Inbox triager/ })).toBeInTheDocument()
  })
})
