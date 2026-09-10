import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import {
  getIntegrationsSnapshot,
  resetIntegrationsStore,
  startManagedOAuthConnect,
} from "../model/store"
import { OAuthCallbackPage } from "./OAuthCallbackPage"

function renderCallback(path: string) {
  const router = createMemoryRouter(
    [
      { path: "/integrations", element: <div>Integrations home</div> },
      { path: "/integrations/oauth/callback", Component: OAuthCallbackPage },
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

describe("OAuthCallbackPage", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("completes the happy path and offers a back CTA", async () => {
    const user = userEvent.setup()
    const started = await startManagedOAuthConnect("google-sheets")
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }

    renderCallback(started.data.authorizeUrl)

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Connected" })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Google Sheets is ready to use/i)
    ).toBeInTheDocument()
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials[0]?.managed).toBe(true)

    await user.click(screen.getByRole("button", { name: "Back to Connectors" }))
    expect(screen.getByText("Integrations home")).toBeInTheDocument()
  })

  it("shows an error when the IdP returns error query params", async () => {
    const started = await startManagedOAuthConnect("slack")
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }

    const params = new URLSearchParams({
      state: started.data.state,
      provider: "slack",
      error: "access_denied",
      error_description: "Access was denied",
    })
    renderCallback(`/integrations/oauth/callback?${params.toString()}`)

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Connection failed" })
      ).toBeInTheDocument()
    })
    expect(screen.getByText("Access was denied")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument()
    expect(getIntegrationsSnapshot().connections).toHaveLength(0)
  })

  it("shows an error when state or code is missing", async () => {
    renderCallback("/integrations/oauth/callback?code=mock-code")

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Connection failed" })
      ).toBeInTheDocument()
    })
    expect(screen.getByText("Missing OAuth state")).toBeInTheDocument()
  })

  it("shows an error for an unknown state", async () => {
    renderCallback(
      "/integrations/oauth/callback?code=mock-code&state=expired&provider=google"
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Connection failed" })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText("Invalid or expired OAuth state")
    ).toBeInTheDocument()
  })

  it("still ends Connected under StrictMode with a single store connection", async () => {
    const started = await startManagedOAuthConnect("google-sheets")
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }

    const router = createMemoryRouter(
      [
        { path: "/integrations", element: <div>Integrations home</div> },
        { path: "/integrations/oauth/callback", Component: OAuthCallbackPage },
      ],
      { initialEntries: [started.data.authorizeUrl] }
    )

    render(
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>,
      { reactStrictMode: true }
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Connected" })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Google Sheets is ready to use/i)
    ).toBeInTheDocument()
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
  })
})
