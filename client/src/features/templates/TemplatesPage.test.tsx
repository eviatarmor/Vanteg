import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"
import { toast } from "sonner"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import {
  getConversation,
  resetConversations,
} from "@/features/assistant/model/store"
import { getTeam, resetTeams } from "@/features/teams/model/store"
import { getWorkflow, resetWorkflows } from "@/features/workflows/model/store"

import { TemplatesPage } from "./TemplatesPage"
import { failNextCatalogLoad } from "./model/catalog"
import { clearRecentTemplateIds } from "./model/recent"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderTemplates(path = "/templates") {
  const router = createMemoryRouter(
    [
      { path: "/templates", Component: TemplatesPage },
      { path: "/templates/:industryId", Component: TemplatesPage },
      { path: "/assistant/:threadId?", element: <div>Assistant destination</div> },
      { path: "/workflows/:workflowId", element: <div>Workflow destination</div> },
      { path: "/teams/:teamId?", element: <div>Team destination</div> },
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

describe("TemplatesPage", () => {
  beforeEach(() => {
    resetConversations()
    resetWorkflows()
    resetTeams()
    clearRecentTemplateIds()
    vi.mocked(toast.success).mockClear()
  })

  it("renders the gallery with industry chips and template cards", async () => {
    renderTemplates()

    expect(screen.getByTestId("templates-skeleton")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Templates" })).toBeInTheDocument()
    })

    expect(screen.getByRole("tab", { name: "Legal" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "SaaS" })).toBeInTheDocument()
    expect(
      await screen.findByRole("button", { name: "Quote & engagement letter" })
    ).toBeInTheDocument()
    expect(screen.getByTestId("template-detail")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Use template" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Quote & engagement letter" })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("filters by industry route and type, and shows empty search state", async () => {
    const user = userEvent.setup()
    renderTemplates("/templates/legal")

    await screen.findByRole("button", { name: "Quote & engagement letter" })
    expect(screen.getByRole("tab", { name: "Legal" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    await user.click(screen.getByRole("button", { name: "Workflow" }))
    expect(
      screen.getByRole("button", { name: "Client onboarding" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Quote & engagement letter" })
    ).not.toBeInTheDocument()

    await user.type(screen.getByLabelText("Search templates"), "zzzz-no-match")
    expect(await screen.findByRole("heading", { name: "No templates match" })).toBeInTheDocument()
  })

  it("uses a template and navigates to the created draft", async () => {
    const user = userEvent.setup()
    const { router } = renderTemplates()

    const card = await screen.findByRole("button", {
      name: "Quote & engagement letter",
    })
    await user.click(card)

    const detail = screen.getByTestId("template-detail")
    await user.click(within(detail).getByRole("button", { name: "Use template" }))

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/assistant\//)
    })

    const conversationId = router.state.location.pathname.replace("/assistant/", "")
    expect(getConversation(conversationId)?.title).toBe("Quote & engagement letter")
    expect(toast.success).toHaveBeenCalled()
  })

  it("creates a workflow draft from a workflow template", async () => {
    const user = userEvent.setup()
    const { router } = renderTemplates("/templates/legal")

    const card = await screen.findByRole("button", { name: "Client onboarding" })
    await user.click(card)
    await user.click(screen.getByRole("button", { name: "Use template" }))

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/workflows\//)
    })
    const workflowId = router.state.location.pathname.replace("/workflows/", "")
    expect(getWorkflow(workflowId)?.name).toBe("Client onboarding")
  })

  it("creates a team stub from a team template", async () => {
    const user = userEvent.setup()
    const { router } = renderTemplates("/templates/legal")

    const card = await screen.findByRole("button", { name: "Intake desk team" })
    await user.click(card)
    await user.click(screen.getByRole("button", { name: "Use template" }))

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/teams\//)
    })
    const teamId = router.state.location.pathname.replace("/teams/", "")
    expect(getTeam(teamId)?.name).toBe("Intake desk team")
  })

  it("shows an error state when the catalog fails to load", async () => {
    failNextCatalogLoad()
    renderTemplates()

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(screen.getByText(/could not load templates/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })
})
