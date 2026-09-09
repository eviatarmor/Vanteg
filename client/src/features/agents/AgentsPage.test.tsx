import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { resetMemoryStore } from "@/features/memory/model/store"

import { AgentsPage } from "./AgentsPage"
import { getAgent, resetAgents } from "./model/store"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderAgents(path = "/agents") {
  const router = createMemoryRouter(
    [
      { path: "/agents", Component: AgentsPage },
      { path: "/agents/:agentId", Component: AgentsPage },
      { path: "/integrations", element: <div>Integrations destination</div> },
    ],
    { initialEntries: [path] }
  )
  return {
    router,
    ...render(
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    ),
  }
}

describe("AgentsPage", () => {
  beforeEach(() => {
    resetAgents()
    resetMemoryStore()
    vi.clearAllMocks()
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

  it("opens an agent, toggles assignments, and saves with confirmation", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    renderAgents("/agents/agent-research")

    expect(screen.getByLabelText(/Name/)).toHaveValue("Research analyst")
    expect(screen.getByLabelText("System prompt")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Research" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByLabelText("Workspace")).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Support" })).not.toBeChecked()
    expect(screen.getByRole("button", { name: "Web search" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("link", { name: /Open Integrations/i })).toHaveAttribute(
      "href",
      "/integrations"
    )

    await user.click(screen.getByRole("checkbox", { name: "Support" }))
    expect(screen.getByRole("checkbox", { name: "Support" })).toBeChecked()
    expect(getAgent("agent-research")?.memoryBaseIds).not.toContain("base-support")

    await user.click(screen.getByRole("button", { name: "Save agent" }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Agent saved.")
    })
    expect(getAgent("agent-research")?.memoryBaseIds).toContain("base-support")
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
    const { toast } = await import("sonner")
    renderAgents()

    await user.click(screen.getAllByRole("button", { name: "New agent" })[0]!)
    await user.type(screen.getByLabelText(/Name/), "Inbox triager")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(
      await screen.findByRole("link", { name: /Inbox triager/ })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(document.getElementById("agent-name")).toHaveValue("Inbox triager")
    })
    expect(toast.success).toHaveBeenCalledWith("Created Inbox triager")
  })

  it("disables create until a name is entered", async () => {
    const user = userEvent.setup()
    renderAgents()

    await user.click(screen.getAllByRole("button", { name: "New agent" })[0]!)
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled()
    await user.type(screen.getByLabelText(/Name/), "Ops")
    expect(screen.getByRole("button", { name: "Create" })).toBeEnabled()
  })

  it("blocks save when the agent name is empty", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    renderAgents("/agents/agent-research")

    const name = screen.getByLabelText(/Name/)
    await user.clear(name)
    await user.click(screen.getByRole("button", { name: "Save agent" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Name is required.")
    expect(toast.error).toHaveBeenCalled()
  })

  it("deletes an agent after confirm dialog", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    const { router } = renderAgents("/agents/agent-research")

    await user.click(screen.getByRole("button", { name: "Delete" }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Delete agent" })).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Delete" }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Deleted Research analyst")
    })
    expect(getAgent("agent-research")).toBeUndefined()
    expect(router.state.location.pathname).toBe("/agents")
  })
})
