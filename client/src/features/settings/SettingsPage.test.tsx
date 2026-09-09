import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme-provider"

import { SettingsPage } from "./SettingsPage"
import { resetCompliance } from "./model/compliance"
import { resetPreferences } from "./model/preferences"
import { SETTINGS_SECTIONS } from "./model/sections"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}))

function renderSettings(initialEntry = "/settings") {
  return render(
    <ThemeProvider defaultTheme="light">
      <MemoryRouter initialEntries={[initialEntry]}>
        <SettingsPage />
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe("SettingsPage", () => {
  beforeEach(() => {
    resetPreferences()
    resetCompliance()
    window.localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("navigates between settings sections via the sidebar", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderSettings()

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument()
    const nav = screen.getByRole("navigation", { name: "Settings sections" })

    for (const section of SETTINGS_SECTIONS) {
      expect(
        within(nav).getByRole("button", { name: section.label })
      ).toBeInTheDocument()
    }

    expect(screen.getByLabelText("Name")).toHaveValue("Darren")
    expect(screen.getByLabelText("Email")).toHaveValue("darren@vanteg.app")

    await user.click(within(nav).getByRole("button", { name: "Billing" }))
    expect(screen.getByText("Current plan")).toBeInTheDocument()
    expect(screen.getByText("free")).toBeInTheDocument()
    expect(screen.getByLabelText("Workflow usage")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Upgrade to Pro" })).toBeInTheDocument()

    await user.click(within(nav).getByRole("button", { name: "Security" }))
    expect(screen.getByText("Change password")).toBeInTheDocument()
    expect(screen.getByLabelText("Current password")).toBeInTheDocument()
    expect(screen.getByLabelText("Current password")).not.toHaveAttribute(
      "type",
      "password"
    )

    await user.click(within(nav).getByRole("button", { name: "Compliance" }))
    expect(screen.getByText("Data processing agreement")).toBeInTheDocument()
    expect(screen.getByText("Subprocessors")).toBeInTheDocument()
    expect(screen.getByText("Audit log")).toBeInTheDocument()
  })

  it("runs the privacy data export flow to a ready download", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { toast } = await import("sonner")
    renderSettings("/settings?section=privacy")

    expect(screen.getByText("Data export")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Request export" }))
    expect(toast.success).toHaveBeenCalledWith("Data export requested.")
    expect(screen.getByText(/Preparing your export/i)).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(700)
    })

    expect(await screen.findByText(/Export ready/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Download JSON/i })
    ).toBeInTheDocument()
  })

  it("renders billing meters and upgrades the mock plan", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { toast } = await import("sonner")
    renderSettings("/settings?section=billing")

    expect(screen.getByText("Current plan")).toBeInTheDocument()
    expect(screen.getByText(/ending in/i)).toBeInTheDocument()
    expect(screen.getByText("4242")).toBeInTheDocument()
    expect(screen.getByText("Invoices")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Upgrade to Pro" }))
    expect(toast.success).toHaveBeenCalledWith("Upgraded to Pro (mock).")
    expect(screen.getByText("pro")).toBeInTheDocument()
  })

  it("uses SecretInput on password change without type=password", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { toast } = await import("sonner")
    renderSettings("/settings?section=security")

    const current = screen.getByLabelText("Current password")
    const next = screen.getByLabelText("New password")
    const confirm = screen.getByLabelText("Confirm new password")

    expect(current).toHaveAttribute("type", "text")
    expect(next).toHaveAttribute("type", "text")
    expect(confirm).toHaveAttribute("type", "text")

    await user.type(current, "old-secret-99")
    await user.type(next, "new-secret-99")
    await user.type(confirm, "new-secret-99")
    await user.click(screen.getByRole("button", { name: "Update password" }))

    expect(toast.success).toHaveBeenCalledWith("Password updated (mock).")
  })

  it("validates profile and saves with a success toast", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
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
  })

  it("persists notification toggles and workspace name", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { toast } = await import("sonner")
    renderSettings("/settings?section=notifications")

    await user.click(screen.getByLabelText("Email notifications"))
    expect(toast.success).toHaveBeenCalledWith("Notification preferences saved.")

    await user.click(
      screen.getByRole("button", { name: "Workspace" })
    )
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
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderSettings("/settings?section=appearance")

    const trigger = screen.getByLabelText("Theme")
    expect(trigger).toBeInTheDocument()
    await user.click(trigger)

    const listbox = await screen.findByRole("listbox")
    expect(within(listbox).getByRole("option", { name: "Light" })).toBeInTheDocument()
    expect(within(listbox).getByRole("option", { name: "Dark" })).toBeInTheDocument()
    expect(within(listbox).getByRole("option", { name: "System" })).toBeInTheDocument()
  })
})
