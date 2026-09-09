import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  API_KEYS_STORAGE_KEY,
  createApiKey,
  hydrateApiKeys,
  resetApiKeysStore,
  setApiKeysLoading,
} from "./model/store"
import { ApiKeysPage } from "./ApiKeysPage"

async function renderApiKeys(options?: { keepLoading?: boolean }) {
  const router = createMemoryRouter(
    [{ path: "/api-keys", Component: ApiKeysPage }],
    { initialEntries: ["/api-keys"] }
  )

  const view = render(<RouterProvider router={router} />)
  if (!options?.keepLoading) {
    await waitFor(() => {
      expect(screen.queryByText("Loading API keys…")).not.toBeInTheDocument()
    })
  }
  return view
}

describe("ApiKeysPage", () => {
  beforeEach(() => {
    resetApiKeysStore()
  })

  afterEach(() => {
    resetApiKeysStore()
    vi.useRealTimers()
  })

  it("shows private and public key tabs under a header separator", async () => {
    await renderApiKeys()

    expect(screen.getByRole("heading", { name: "API Keys" })).toBeInTheDocument()
    expect(
      screen.getByText("API keys for calling Vanteg from outside this workspace.")
    ).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Private keys" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Public keys" })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "No private keys yet" })).toBeInTheDocument()
    })
    expect(screen.queryByRole("heading", { name: "No API keys yet" })).not.toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New private key" }).length).toBeGreaterThan(
      0
    )
    expect(
      screen.getByRole("heading", { name: "API Keys" }).closest("div")?.parentElement
        ?.parentElement
    ).toHaveClass("border-b")
  })

  it("opens a name prompt for a public key", async () => {
    const user = userEvent.setup()
    await renderApiKeys()

    await user.click(screen.getByRole("tab", { name: "Public keys" }))

    expect(screen.getByRole("heading", { name: "No public keys yet" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("button", { name: "New public key" })[0]!)

    expect(screen.getByRole("dialog", { name: "New public key" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Key name")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Scopes" })).toBeInTheDocument()
  })

  it("creates a key, reveals the secret once with maskSecretLast (not password), and lists it", async () => {
    const user = userEvent.setup()
    await renderApiKeys()


    await user.click(screen.getAllByRole("button", { name: "New private key" })[0]!)
    await user.type(screen.getByPlaceholderText("Key name"), "Deploy bot")
    await user.click(screen.getByRole("button", { name: "Read" }))
    await user.click(screen.getByRole("button", { name: "Create" }))

    await waitFor(() => {
      expect(screen.getByLabelText("Secret (shown once)")).toBeInTheDocument()
    })

    const secretField = screen.getByLabelText("Secret (shown once)")
    expect(secretField).toHaveAttribute("type", "text")
    expect(secretField).not.toHaveAttribute("type", "password")
    expect((secretField as HTMLInputElement).value).toMatch(/^\*+[A-Za-z0-9]$/)

    await user.click(screen.getByRole("button", { name: "Done" }))

    expect(screen.getByText("Deploy bot")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("read")).toBeInTheDocument()
    expect(screen.getByText(/vtg_sk_/)).toBeInTheDocument()
    expect(localStorage.getItem(API_KEYS_STORAGE_KEY)).toContain("Deploy bot")
  })

  it("revokes a key after confirm", async () => {
    const user = userEvent.setup()
    createApiKey({ kind: "private-keys", name: "Temp", scopes: [] })
    hydrateApiKeys()
    await renderApiKeys()

    await waitFor(() => {
      expect(screen.getByText("Temp")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Actions for Temp" }))
    await user.click(screen.getByRole("menuitem", { name: "Revoke" }))

    const dialog = screen.getByRole("dialog", { name: "Revoke API key" })
    expect(dialog).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Revoke" }))

    await waitFor(() => {
      expect(screen.getByText("Revoked")).toBeInTheDocument()
    })
  })

  it("shows loading and error states", async () => {
    setApiKeysLoading()
    const { unmount } = await renderApiKeys({ keepLoading: true })
    expect(screen.getByText("Loading API keys…")).toBeInTheDocument()
    unmount()
    resetApiKeysStore()

    localStorage.setItem(API_KEYS_STORAGE_KEY, "not-json")
    const user = userEvent.setup()
    await renderApiKeys()

    expect(screen.getByText("Could not load API keys")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear storage and retry" }))
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "No private keys yet" })).toBeInTheDocument()
    })
  })
})
