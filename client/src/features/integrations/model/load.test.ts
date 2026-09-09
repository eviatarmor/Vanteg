import { beforeEach, describe, expect, it } from "vitest"

import {
  failNextIntegrationsLoad,
  humanizeIntegrationsLoadError,
  loadIntegrationsList,
  resetIntegrationsLoadFlags,
} from "./load"

describe("integrations load", () => {
  beforeEach(() => {
    resetIntegrationsLoadFlags()
  })

  it("resolves when load succeeds", async () => {
    await expect(loadIntegrationsList()).resolves.toBeUndefined()
  })

  it("throws a human message when fail-next is set", async () => {
    failNextIntegrationsLoad()
    await expect(loadIntegrationsList()).rejects.toThrow(
      "We couldn't load your connectors. Check your connection and try again."
    )
    await expect(loadIntegrationsList()).resolves.toBeUndefined()
  })

  it("humanizes unknown errors with a fallback", () => {
    expect(humanizeIntegrationsLoadError(null)).toBe(
      "We couldn't load your connectors. Check your connection and try again."
    )
    expect(humanizeIntegrationsLoadError(new Error("boom"))).toBe("boom")
  })
})
