import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { ThemeProvider } from "@/components/theme-provider"
import { KeyboardShortcutsProvider } from "@/features/shortcuts/KeyboardShortcutsProvider"

import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"

function renderShell() {
  return render(
    <ThemeProvider defaultTheme="system">
      <MemoryRouter>
        <TooltipProvider>
          <KeyboardShortcutsProvider>
            <SidebarProvider defaultOpen>
              <AppSidebar />
              <AppTopbar title="Home" />
            </SidebarProvider>
          </KeyboardShortcutsProvider>
        </TooltipProvider>
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe("sidebar collapse", () => {
  it("collapses to icon mode from the top bar button", async () => {
    const user = userEvent.setup()
    const { container } = renderShell()

    expect(container.querySelector('[data-collapsible="icon"]')).toBeNull()

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))

    expect(container.querySelector('[data-collapsible="icon"]')).not.toBeNull()
    expect(
      container.querySelectorAll('[data-slot="sidebar-separator"]').length
    ).toBeGreaterThan(0)
    expect(screen.getByText("3")).toBeInTheDocument()
  })
})
