import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"

import { ApiKeysPage } from "./ApiKeysPage"

function renderApiKeys() {
  const router = createMemoryRouter(
    [{ path: "/api-keys", Component: ApiKeysPage }],
    { initialEntries: ["/api-keys"] }
  )

  return render(<RouterProvider router={router} />)
}

describe("ApiKeysPage", () => {
  it("shows private and public key tabs under a header separator", () => {
    renderApiKeys()

    expect(screen.getByRole("heading", { name: "API Keys" })).toBeInTheDocument()
    expect(
      screen.getByText("API keys for calling Vanteg from outside this workspace.")
    ).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Private keys" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Public keys" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "No private keys yet" })).toBeInTheDocument()
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
    renderApiKeys()

    await user.click(screen.getByRole("tab", { name: "Public keys" }))

    expect(screen.getByRole("heading", { name: "No public keys yet" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("button", { name: "New public key" })[0]!)

    expect(screen.getByRole("dialog", { name: "New public key" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Key name")).toBeInTheDocument()
  })
})
