import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { IntegrationsPage } from "./IntegrationsPage"
import { getIntegrationsSnapshot, resetIntegrationsStore } from "./model/store"

function renderIntegrations(path = "/integrations") {
  const router = createMemoryRouter(
    [{ path: "/integrations", Component: IntegrationsPage }],
    { initialEntries: [path] }
  )

  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("IntegrationsPage", { timeout: 15_000 }, () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("shows Integrations and Custom Credentials tabs by default", () => {
    renderIntegrations()

    expect(screen.getByRole("heading", { name: "Integrations" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Integrations" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Custom Credentials" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Integrations" })).toHaveAttribute("data-state", "active")
    expect(screen.getByRole("heading", { name: "No connectors configured" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Add connector" }).length).toBeGreaterThan(0)
  })

  it("switches to Custom Credentials empty state via ?tab=", async () => {
    const user = userEvent.setup()
    renderIntegrations("/integrations?tab=custom-credentials")

    expect(screen.getByRole("tab", { name: "Custom Credentials" })).toHaveAttribute(
      "data-state",
      "active"
    )
    expect(screen.getByRole("heading", { name: "No custom credentials yet" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New credential" }).length).toBeGreaterThan(0)

    await user.click(screen.getByRole("tab", { name: "Integrations" }))
    expect(screen.getByRole("heading", { name: "No connectors configured" })).toBeInTheDocument()
  })

  it("opens a catalog dialog with only a search bar", async () => {
    const user = userEvent.setup()
    renderIntegrations()

    await user.click(screen.getAllByRole("button", { name: "Add connector" })[0]!)

    const dialog = screen.getByRole("dialog", { name: "Add connector" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Search connectors" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Google Sheets" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Slack" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Stripe" })).toBeInTheDocument()
    expect(dialog.querySelector('[data-slot="scroll-area"]')).toBeNull()
  })

  it("shows auth badges on catalog cards instead of categories", async () => {
    const user = userEvent.setup()
    renderIntegrations()

    await user.click(screen.getAllByRole("button", { name: "Add connector" })[0]!)

    const sheets = screen.getByRole("button", { name: "Google Sheets" })
    expect(within(sheets).getByText("OAUTH")).toBeInTheDocument()
    expect(within(sheets).queryByText("Google")).not.toBeInTheDocument()

    const postgres = screen.getByRole("button", { name: "PostgreSQL" })
    expect(within(postgres).getByText("BASIC")).toBeInTheDocument()
    expect(within(postgres).queryByText("Databases")).not.toBeInTheDocument()

    const snowflake = screen.getByRole("button", { name: "Snowflake" })
    expect(within(snowflake).getByText("JWT")).toBeInTheDocument()
  })

  it("frames catalog logos and spans extra columns on wide dialogs", async () => {
    const user = userEvent.setup()
    renderIntegrations()

    await user.click(screen.getAllByRole("button", { name: "Add connector" })[0]!)

    const dialog = screen.getByRole("dialog", { name: "Add connector" })
    expect(dialog.className).toMatch(/max-w-5xl|max-w-6xl/)

    const sheets = screen.getByRole("button", { name: "Google Sheets" })
    const logo = sheets.querySelector("img")
    expect(logo?.parentElement).toHaveClass("border")
    expect(logo?.parentElement).toHaveClass("bg-white")

    const search = screen.getByRole("textbox", { name: "Search connectors" })
    expect(search.parentElement).not.toHaveClass("border-b")

    const grid = dialog.querySelector("[data-slot='connector-catalog-grid']")
    expect(grid?.className).toMatch(/grid-cols-3|@min-/)
  })

  it("connects Google Sheets and lists it without In / Data / Out", async () => {
    const user = userEvent.setup()
    renderIntegrations()

    await user.click(screen.getAllByRole("button", { name: "Add connector" })[0]!)
    await user.click(screen.getByRole("button", { name: "Google Sheets" }))

    expect(screen.getByRole("dialog", { name: "Connect Google Sheets" })).toBeInTheDocument()
    expect(screen.queryByLabelText("Client ID")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Client Secret")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Connect with Google" }))

    await waitFor(() => {
      expect(screen.getByText("Google Sheets")).toBeInTheDocument()
    })
    expect(screen.queryByRole("tab", { name: "In" })).not.toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Data" })).not.toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Out" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Insert rows" })).not.toBeInTheDocument()
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
  })

  it("asks for an API key when connecting Stripe", async () => {
    const user = userEvent.setup()
    renderIntegrations()

    await user.click(screen.getAllByRole("button", { name: "Add connector" })[0]!)
    await user.click(screen.getByRole("button", { name: "Stripe" }))
    await user.type(screen.getByLabelText("API Key"), "sk_test_vanteg")
    await user.click(screen.getByRole("button", { name: "Connect" }))

    await waitFor(() => {
      expect(getIntegrationsSnapshot().credentials[0]?.fields.apiKey).toBe("sk_test_vanteg")
    })
    expect(screen.getByText("Stripe")).toBeInTheDocument()
  })

  it("shows validation errors when creating a custom credential without required fields", async () => {
    const user = userEvent.setup()
    renderIntegrations("/integrations?tab=custom-credentials")

    await user.click(screen.getAllByRole("button", { name: "New credential" })[0]!)
    expect(screen.getByRole("dialog", { name: "New credential" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Create" }))

    await waitFor(() => {
      expect(screen.getAllByText("Required").length).toBeGreaterThan(0)
    })
    expect(getIntegrationsSnapshot().customCredentials).toHaveLength(0)
  })

  it("creates a custom bearer credential and lists a masked preview", async () => {
    const user = userEvent.setup()
    renderIntegrations("/integrations?tab=custom-credentials")

    await user.click(screen.getAllByRole("button", { name: "New credential" })[0]!)
    await user.type(screen.getByLabelText("Name"), "Agent token")
    await user.type(screen.getByLabelText("Token"), "super-secret-token")
    await user.click(screen.getByRole("button", { name: "Create" }))

    await waitFor(() => {
      expect(getIntegrationsSnapshot().customCredentials).toHaveLength(1)
    })
    expect(screen.getByText("Agent token")).toBeInTheDocument()
    expect(screen.getByText("Bearer")).toBeInTheDocument()
    expect(screen.queryByText("super-secret-token")).not.toBeInTheDocument()
    expect(screen.getByText(/\*{5}/)).toBeInTheDocument()
  })
})
