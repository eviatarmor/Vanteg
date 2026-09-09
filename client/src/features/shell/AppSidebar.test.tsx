import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { resetInbox } from "@/features/inbox/model/store"
import { KeyboardShortcutsProvider } from "@/features/shortcuts/KeyboardShortcutsProvider"

import { AppSidebar } from "./AppSidebar"

function renderSidebar() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <KeyboardShortcutsProvider>
          <SidebarProvider>
            <AppSidebar />
          </SidebarProvider>
        </KeyboardShortcutsProvider>
      </TooltipProvider>
    </MemoryRouter>
  )
}

describe("AppSidebar", () => {
  beforeEach(() => {
    resetInbox()
  })

  it("renders Vanteg branding, grouped nav, inbox badge, and owner", () => {
    renderSidebar()

    expect(screen.getByText("Vanteg")).toBeInTheDocument()
    expect(screen.queryByText("Hudson Plumbing")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /inbox/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Assistant" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Agents" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Teams" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Templates" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Data" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Memory" })).toBeInTheDocument()
    expect(screen.getByText("Manage")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Integrations" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "API Keys" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Shortcuts" })).toBeInTheDocument()
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
