import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomCredential,
  resetIntegrationsStore,
} from "@/features/integrations/model/store"

import { CredentialPicker } from "./CredentialPicker"

function renderPicker(
  props: {
    value?: string
    onChange?: (credentialId: string) => void
    label?: string
    help?: string
  } = {}
) {
  const onChange = props.onChange ?? vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <CredentialPicker
            value={props.value ?? ""}
            onChange={onChange}
            label={props.label}
            help={props.help}
          />
        ),
      },
      { path: "/integrations", element: <div>Integrations</div> },
    ],
    { initialEntries: ["/"] }
  )
  return {
    onChange,
    ...render(<RouterProvider router={router} />),
  }
}

describe("CredentialPicker", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("shows empty state pointing at Custom Credentials", () => {
    renderPicker()

    expect(screen.getByTestId("credential-picker-empty")).toHaveTextContent(
      "No custom credentials yet"
    )
    expect(
      screen.getByRole("link", { name: /Integrations → Custom Credentials/i })
    ).toHaveAttribute("href", "/integrations?tab=custom-credentials")
    expect(screen.getByRole("link", { name: /Create new/i })).toHaveAttribute(
      "href",
      "/integrations?tab=custom-credentials"
    )
  })

  it("lists custom credentials with kind badges and selects by id", async () => {
    const user = userEvent.setup()
    const created = await createCustomCredential({
      name: "Prod bearer",
      kind: "bearer",
      fields: { token: "tok_live" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }

    const { onChange } = renderPicker()

    expect(screen.queryByTestId("credential-picker-empty")).not.toBeInTheDocument()
    await user.click(screen.getByRole("combobox", { name: "Credential" }))
    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument()
    expect(screen.getByText("Prod bearer")).toBeInTheDocument()
    expect(screen.getByText("Bearer")).toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: /Prod bearer/i }))
    expect(onChange).toHaveBeenCalledWith(created.data.id)
  })

  it("shows Using credential when a value is selected", async () => {
    const created = await createCustomCredential({
      name: "Stripe key",
      kind: "api-key",
      fields: { apiKey: "sk_test" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }

    renderPicker({ value: created.data.id })

    expect(screen.getByTestId("credential-picker-using")).toHaveTextContent(
      "Using credential: Stripe key"
    )
  })

  it("lets the user clear a missing credential when the list is empty", async () => {
    const user = userEvent.setup()
    const { onChange } = renderPicker({ value: "cred_gone" })

    expect(screen.getByTestId("credential-picker-missing")).toHaveTextContent(
      /missing or was deleted/i
    )
    expect(screen.queryByTestId("credential-picker-empty")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenCalledWith("")
  })
})
