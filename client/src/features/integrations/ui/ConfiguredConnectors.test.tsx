import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { err } from "@workspace/integrations"

import {
  getIntegrationsAdapter,
  setIntegrationsAdapter,
} from "../model/adapter"
import { connectConnector, resetIntegrationsStore } from "../model/store"
import { ConfiguredConnectors } from "./ConfiguredConnectors"

describe("ConfiguredConnectors", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("keeps the row and shows an error when disconnect fails", async () => {
    const user = userEvent.setup()
    await connectConnector("stripe", { apiKey: "sk_test" })

    const inner = getIntegrationsAdapter()
    setIntegrationsAdapter({
      ...inner,
      deleteConnection: async () =>
        err({ code: "internal", message: "Adapter down" }),
    })

    render(<ConfiguredConnectors onAdd={() => {}} />)

    expect(screen.getByText("Stripe")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Disconnect" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Adapter down")
    expect(screen.getByText("Stripe")).toBeInTheDocument()
  })
})
