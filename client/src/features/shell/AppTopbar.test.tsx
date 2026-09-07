import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAssistantOpen } from "@/features/assistant/model/open-store"
import { createDraft, resetWorkflows } from "@/features/workflows/model/store"

import { AppTopbar } from "./AppTopbar"

function renderTopbar(path = "/", title = "Workflows") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <SidebarProvider>
          <AppTopbar title={title} />
        </SidebarProvider>
      </TooltipProvider>
    </MemoryRouter>
  )
}

describe("AppTopbar", () => {
  beforeEach(() => {
    resetWorkflows()
    resetAssistantOpen()
  })

  it("shows the page title, Ask Freeze, and notifications", () => {
    renderTopbar("/", "Home")

    const header = screen.getByRole("banner")
    expect(header).toHaveTextContent("Home")
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ask Freeze" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByRole("button", { name: "Feedback" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute(
      "href",
      "/inbox"
    )
    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument()
    expect(screen.queryByText(/Ask Bay/i)).not.toBeInTheDocument()
  })

  it("puts the sidebar collapse control on the left of the top bar", () => {
    renderTopbar("/", "Home")

    const header = screen.getByRole("banner")
    const toggle = screen.getByRole("button", { name: "Toggle Sidebar" })
    const title = header.querySelector("p")

    expect(title).not.toBeNull()
    expect(title).toHaveTextContent("Home")
    expect(header.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_CONTAINED_BY).toBeTruthy()
    expect(
      toggle.compareDocumentPosition(title!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("includes the active tab name in the top bar breadcrumb", () => {
    renderTopbar("/data", "Data")

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Data" })).toHaveAttribute("href", "/data")
    expect(screen.getByText("Database")).toBeInTheDocument()
  })

  it("shows the selected data tab in the breadcrumb", () => {
    renderTopbar("/data?tab=secrets", "Data")

    expect(screen.getByRole("link", { name: "Data" })).toBeInTheDocument()
    expect(screen.getByText("Secrets")).toBeInTheDocument()
    expect(screen.queryByText("Database")).not.toBeInTheDocument()
  })

  it("shows an editable breadcrumb and environment badge on a workflow", async () => {
    resetWorkflows()
    const workflow = createDraft()
    renderTopbar(`/workflows/${workflow.id}`)

    const user = userEvent.setup()

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Untitled workflow" })).toBeInTheDocument()
    expect(screen.getByLabelText("Workflow environment")).toHaveTextContent("draft")
    expect(screen.queryByRole("heading", { name: "Workflows" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Untitled workflow" }))

    expect(screen.getByLabelText("Workflow name")).toHaveValue("Untitled workflow")
  })
})
