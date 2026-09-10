import { describe, expect, it } from "vitest"

import { getConnector } from "./catalog"
import { credentialFieldsFor, isManagedOAuth } from "./credential-fields"

describe("credential fields", () => {
  it("lets users connect Google through the Vanteg-owned app", () => {
    const sheets = getConnector("google-sheets")
    expect(sheets).toBeDefined()
    expect(isManagedOAuth(sheets!)).toBe(true)
    expect(credentialFieldsFor(sheets!).map((field) => field.id)).toEqual([])
  })

  it("asks for an API key for Stripe", () => {
    const stripe = getConnector("stripe")
    expect(stripe).toBeDefined()
    expect(credentialFieldsFor(stripe!).map((field) => field.id)).toEqual([
      "apiKey",
    ])
    expect(credentialFieldsFor(stripe!)[0]?.secret).toBe(true)
  })

  it("asks for JWT claims for Workday", () => {
    const workday = getConnector("workday")
    expect(workday).toBeDefined()
    expect(credentialFieldsFor(workday!).map((field) => field.id)).toEqual([
      "algorithm",
      "secret",
      "issuer",
      "audience",
    ])
  })

  it("asks for username and password for PostgreSQL", () => {
    const postgres = getConnector("postgresql")
    expect(postgres).toBeDefined()
    expect(credentialFieldsFor(postgres!).map((field) => field.id)).toEqual([
      "host",
      "database",
      "username",
      "password",
    ])
  })
})
