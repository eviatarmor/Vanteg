import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { WebhookTestPanel } from "./WebhookTestPanel"

describe("WebhookTestPanel", () => {
  it("shows empty state, SecretInput, and a successful simulated response", async () => {
    const user = userEvent.setup()
    render(<WebhookTestPanel path="/hooks/demo" method="POST" />)

    expect(screen.getByRole("heading", { name: "Test webhook" })).toBeInTheDocument()
    expect(screen.getByTestId("webhook-test-empty")).toBeInTheDocument()
    expect(screen.getByLabelText("Sample payload")).toBeInTheDocument()
    expect(screen.getByLabelText("Headers (optional)")).toBeInTheDocument()
    expect(screen.getByLabelText("Signing secret")).toBeInTheDocument()
    expect(screen.getByLabelText("Signing secret")).not.toHaveAttribute("type", "password")
    expect(screen.getByText("POST /hooks/demo")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Signing secret"), "sec")
    expect(screen.getByLabelText("Signing secret")).toHaveValue("**c")

    await user.click(screen.getByRole("button", { name: "Send test" }))

    await waitFor(() => {
      expect(screen.getByTestId("webhook-test-success")).toBeInTheDocument()
    })
    expect(screen.getByText(/200 OK/)).toBeInTheDocument()
    expect(screen.getByText(/"simulated": true/)).toBeInTheDocument()
    expect(screen.getByText(/"path": "\/hooks\/demo"/)).toBeInTheDocument()
  })

  it("falls back to POST /hooks/vanteg and seeds the signing secret", () => {
    render(<WebhookTestPanel secret="whsec_abc" />)

    expect(screen.getByText("POST /hooks/vanteg")).toBeInTheDocument()
    expect(screen.getByLabelText("Signing secret")).toHaveValue("********c")
  })

  it("shows an error state for invalid JSON", async () => {
    const user = userEvent.setup()
    render(<WebhookTestPanel />)

    const payload = screen.getByLabelText("Sample payload")
    await user.clear(payload)
    await user.type(payload, "not-json")
    await user.click(screen.getByRole("button", { name: "Send test" }))

    await waitFor(() => {
      expect(screen.getByTestId("webhook-test-error")).toBeInTheDocument()
    })
    expect(
      screen.getByText("Sample payload must be valid JSON.")
    ).toBeInTheDocument()
  })
})
