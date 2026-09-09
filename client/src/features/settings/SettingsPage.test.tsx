import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"
import { getSession, resetAuthSession } from "@/features/auth/model/session"

import { SettingsPage } from "./SettingsPage"
import { resetPreferences } from "./model/preferences"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}))

function renderSettings() {
  return render(
    <ThemeProvider defaultTheme="light">
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe("SettingsPage", () => {
  beforeEach(() => {
    resetPreferences()
    resetAuthSession()
    window.localStorage.clear()
  })

  it("renders profile, appearance, notifications, and workspace sections", () => {
    renderSettings()

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "No settings yet" })).not.toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Appearance")).toBeInTheDocument()
    expect(screen.getByText("Notifications")).toBeInTheDocument()
    expect(screen.getByText("Workspace")).toBeInTheDocument()

    expect(screen.getByLabelText("Name")).toHaveValue("Darren")
    expect(screen.getByLabelText("Email")).toHaveValue("darren@vanteg.app")
    expect(screen.getByLabelText("Display name")).toHaveValue("Vanteg")
    expect(screen.getByLabelText("Email notifications")).toBeChecked()
    expect(screen.getByLabelText("Inbox notifications")).toBeChecked()
  })

  it("validates profile and saves with a success toast", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    renderSettings()

    const name = screen.getByLabelText("Name")
    await user.clear(name)
    await user.click(screen.getByRole("button", { name: "Save profile" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Name is required.")
    expect(toast.error).toHaveBeenCalled()

    await user.type(name, "Ada Lovelace")
    await user.clear(screen.getByLabelText("Email"))
    await user.type(screen.getByLabelText("Email"), "ada@vanteg.app")
    await user.click(screen.getByRole("button", { name: "Save profile" }))

    expect(toast.success).toHaveBeenCalledWith("Profile saved.")
    expect(screen.getByText("Signed in as ada@vanteg.app")).toBeInTheDocument()
    expect(getSession()).toEqual({
      email: "ada@vanteg.app",
      name: "Ada Lovelace",
    })
  })

  it("persists notification toggles and workspace name", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    renderSettings()

    await user.click(screen.getByLabelText("Email notifications"))
    expect(toast.success).toHaveBeenCalledWith("Notification preferences saved.")

    const workspace = screen.getByLabelText("Display name")
    await user.clear(workspace)
    await user.type(workspace, "Acme Ops")
    await user.click(screen.getByRole("button", { name: "Save workspace" }))

    expect(toast.success).toHaveBeenCalledWith("Workspace settings saved.")

    const stored = JSON.parse(
      window.localStorage.getItem("vanteg.settings.preferences") ?? "{}"
    )
    expect(stored).toMatchObject({
      emailNotifications: false,
      inboxNotifications: true,
      displayName: "Acme Ops",
    })
  })

  it("exposes a theme select for light, dark, and system", async () => {
    const user = userEvent.setup()
    renderSettings()

    const trigger = screen.getByLabelText("Theme")
    expect(trigger).toBeInTheDocument()
    await user.click(trigger)

    const listbox = await screen.findByRole("listbox")
    expect(within(listbox).getByRole("option", { name: "Light" })).toBeInTheDocument()
    expect(within(listbox).getByRole("option", { name: "Dark" })).toBeInTheDocument()
    expect(within(listbox).getByRole("option", { name: "System" })).toBeInTheDocument()
  })
})
