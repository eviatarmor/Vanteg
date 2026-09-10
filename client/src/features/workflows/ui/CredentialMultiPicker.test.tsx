import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  holdNextCustomCredentialsLoad,
  releaseCustomCredentialsLoad,
  setCustomCredentialsLoadFailureOnce,
} from "@/features/integrations/model/custom-credentials-load"
import {
  createCustomCredential,
  resetIntegrationsStore,
} from "@/features/integrations/model/store"

import { CredentialMultiPicker } from "./CredentialMultiPicker"

function renderPicker(
  props: {
    value?: string[]
    onToggle?: (credentialId: string, enabled: boolean) => void
  } = {}
) {
  const onToggle = props.onToggle ?? vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <CredentialMultiPicker value={props.value ?? []} onToggle={onToggle} />
        ),
      },
      { path: "/integrations", element: <div>Integrations</div> },
    ],
    { initialEntries: ["/"] }
  )
  return {
    onToggle,
    ...render(<RouterProvider router={router} />),
  }
}

describe("CredentialMultiPicker", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("shows loading then empty state pointing at Custom Credentials", async () => {
    holdNextCustomCredentialsLoad()
    renderPicker()

    expect(screen.getByLabelText("Loading credentials")).toBeInTheDocument()

    releaseCustomCredentialsLoad()

    await waitFor(() => {
      expect(screen.getByTestId("credential-multi-picker-empty")).toHaveTextContent(
        "No custom credentials yet"
      )
    })
    expect(
      screen.getByRole("link", { name: /Connectors → Custom Credentials/i })
    ).toHaveAttribute("href", "/integrations?tab=custom-credentials")
    expect(screen.getByRole("link", { name: /Create new/i })).toHaveAttribute(
      "href",
      "/integrations?tab=custom-credentials"
    )
    expect(document.querySelector('input[type="password"]')).toBeNull()
  })

  it("lists credentials by name and kind without raw secrets and toggles selection", async () => {
    const user = userEvent.setup()
    const created = await createCustomCredential({
      name: "Prod bearer",
      kind: "bearer",
      fields: { token: "tok_live_secret_value" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }

    const { onToggle } = renderPicker()

    await waitFor(() => {
      expect(screen.getByRole("checkbox", { name: "Prod bearer" })).toBeInTheDocument()
    })
    expect(screen.getByText("Bearer")).toBeInTheDocument()
    expect(screen.queryByText("tok_live_secret_value")).not.toBeInTheDocument()
    expect(document.querySelector('input[type="password"]')).toBeNull()

    await user.click(screen.getByRole("checkbox", { name: "Prod bearer" }))
    expect(onToggle).toHaveBeenCalledWith(created.data.id, true)
  })

  it("shows error state with retry", async () => {
    const user = userEvent.setup()
    setCustomCredentialsLoadFailureOnce()
    renderPicker()

    await waitFor(() => {
      expect(screen.getByTestId("credential-multi-picker-error")).toHaveTextContent(
        /Couldn’t load credentials|Failed to load custom credentials/
      )
    })

    await user.click(screen.getByRole("button", { name: "Retry" }))

    await waitFor(() => {
      expect(screen.getByTestId("credential-multi-picker-empty")).toBeInTheDocument()
    })
  })
})
