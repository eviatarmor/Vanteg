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
  it("shows the empty API keys workspace", () => {
    renderApiKeys()

    expect(screen.getByRole("heading", { name: "API Keys" })).toBeInTheDocument()
    expect(
      screen.getByText("API keys for calling Freeze from outside this workspace.")
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "No API keys yet" })).toBeInTheDocument()
    expect(
      screen.getByText(
        "API keys for calling Freeze from outside this workspace will appear here."
      )
    ).toBeVisible()
    expect(screen.getAllByRole("button", { name: "New API key" }).length).toBeGreaterThan(
      0
    )
  })

  it("opens a name prompt when creating an API key", async () => {
    const user = userEvent.setup()
    renderApiKeys()

    await user.click(screen.getAllByRole("button", { name: "New API key" })[0]!)

    expect(screen.getByRole("dialog", { name: "New API key" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Key name")).toBeInTheDocument()
  })
})
