import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { AppSidebar } from "./AppSidebar"

function renderSidebar() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </TooltipProvider>
    </MemoryRouter>
  )
}

describe("AppSidebar", () => {
  it("renders Freeze branding, grouped nav, inbox badge, and owner", () => {
    renderSidebar()

    expect(screen.getByText("Freeze")).toBeInTheDocument()
    expect(screen.queryByText("Hudson Plumbing")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /inbox/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Agents" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Teams" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Data" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Memory" })).toBeInTheDocument()
    expect(screen.getByText("Manage")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Integrations" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "API Keys" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("Darren")).toBeInTheDocument()
    expect(screen.getByText("Owner")).toBeInTheDocument()
    expect(screen.getByText("DH")).toBeInTheDocument()
    expect(screen.queryByText("Bay")).not.toBeInTheDocument()
  })

  it("opens the avatar menu with Settings and Log out", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole("button", { name: /account menu/i }))

    expect(screen.getByRole("menuitem", { name: "Settings" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument()
  })
})
