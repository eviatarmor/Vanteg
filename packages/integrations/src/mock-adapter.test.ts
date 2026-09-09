import { beforeEach, describe, expect, it } from "vitest"

import { createMockIntegrationsAdapter } from "./mock-adapter.ts"
import type { IntegrationsAdapter } from "./runtime.ts"

describe("createMockIntegrationsAdapter", () => {
  let adapter: IntegrationsAdapter

  beforeEach(() => {
    adapter = createMockIntegrationsAdapter()
  })

  it("rejects createConnection when apiKey is empty", async () => {
    const result = await adapter.createConnection({
      appId: "stripe",
      fields: { apiKey: "" },
    })
    expect(result.ok).toBe(false)
    if (result.ok) {
      return
    }
    expect(result.error.code).toBe("validation")
    expect(result.error.fields?.apiKey).toBe("Required")
  })

  it("connects managed OAuth apps via connectApp", async () => {
    const result = await adapter.connectApp({ appId: "google-sheets" })
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.data.appId).toBe("google-sheets")
    expect(result.data.status).toBe("connected")

    const listed = await adapter.listConnections()
    expect(listed.ok && listed.data).toHaveLength(1)
  })

  it("startOAuth returns a fake authorize URL and completeOAuth creates a connection", async () => {
    const started = await adapter.startOAuth({ provider: "slack" })
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }
    expect(started.data.authorizeUrl).toContain("/integrations/oauth/callback")
    expect(started.data.authorizeUrl).toContain("code=mock-code")
    expect(started.data.authorizeUrl).toContain(`state=${encodeURIComponent(started.data.state)}`)
    expect(started.data.state).toBeTruthy()

    const completed = await adapter.completeOAuth({
      provider: "slack",
      code: "any",
      state: started.data.state,
    })
    expect(completed.ok).toBe(true)
    if (!completed.ok) {
      return
    }
    expect(completed.data.status).toBe("connected")
  })

  it("executeMethod returns sheet-like payload and honors idempotencyKey", async () => {
    const connected = await adapter.connectApp({ appId: "google-sheets" })
    expect(connected.ok).toBe(true)
    if (!connected.ok) {
      return
    }

    const first = await adapter.executeMethod({
      connectionId: connected.data.id,
      methodId: "spreadsheet",
      input: { spreadsheetId: "abc", sheetName: "Leads" },
      idempotencyKey: "once",
    })
    expect(first.ok).toBe(true)
    if (!first.ok) {
      return
    }
    expect(first.data.updatedRows).toBe(1)
    expect(first.data.updatedRange).toBe("Leads!A2:D2")

    const second = await adapter.executeMethod({
      connectionId: connected.data.id,
      methodId: "spreadsheet",
      input: { spreadsheetId: "other", sheetName: "Other" },
      idempotencyKey: "once",
    })
    expect(second).toEqual(first)

    const unknown = await adapter.executeMethod({
      connectionId: connected.data.id,
      methodId: "totally-unknown-method",
      input: {},
    })
    expect(unknown.ok).toBe(false)
    if (!unknown.ok) {
      expect(unknown.error.code).toBe("not_found")
    }
  })

  it("verifyWebhook accepts the test signature", async () => {
    const connected = await adapter.connectApp({ appId: "slack" })
    expect(connected.ok).toBe(true)
    if (!connected.ok || !adapter.verifyWebhook) {
      return
    }
    const good = await adapter.verifyWebhook({
      provider: "slack",
      connectionId: connected.data.id,
      headers: { "x-vanteg-signature": "test" },
      rawBody: "{}",
    })
    expect(good.ok && good.data.accepted).toBe(true)

    const bad = await adapter.verifyWebhook({
      provider: "slack",
      connectionId: connected.data.id,
      headers: {},
      rawBody: "{}",
    })
    expect(bad.ok).toBe(false)
    if (!bad.ok) {
      expect(bad.error.code).toBe("webhook_invalid")
    }
  })

  it("deletes connections", async () => {
    const connected = await adapter.connectApp({
      appId: "stripe",
      fields: { apiKey: "sk_test" },
    })
    expect(connected.ok).toBe(true)
    if (!connected.ok) {
      return
    }
    const deleted = await adapter.deleteConnection(connected.data.id)
    expect(deleted.ok).toBe(true)
    const listed = await adapter.listConnections()
    expect(listed.ok && listed.data).toHaveLength(0)
  })

  it("completeOAuthCallback connects the pending appId on the happy path", async () => {
    const started = await adapter.startOAuth({
      provider: "google",
      appId: "gmail",
      name: "Gmail",
    })
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }

    const completed = await adapter.completeOAuthCallback({
      code: "mock-code",
      state: started.data.state,
      provider: "google",
    })
    expect(completed.ok).toBe(true)
    if (!completed.ok) {
      return
    }
    expect(completed.data.appId).toBe("gmail")
    expect(completed.data.name).toBe("Gmail")
    expect(completed.data.status).toBe("connected")
  })

  it("completeOAuthCallback rejects missing state or code", async () => {
    const missingState = await adapter.completeOAuthCallback({ code: "mock-code" })
    expect(missingState.ok).toBe(false)
    if (!missingState.ok) {
      expect(missingState.error.code).toBe("validation")
      expect(missingState.error.fields?.state).toBe("Required")
    }

    const started = await adapter.startOAuth({ provider: "slack", appId: "slack" })
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }
    const missingCode = await adapter.completeOAuthCallback({
      state: started.data.state,
      provider: "slack",
    })
    expect(missingCode.ok).toBe(false)
    if (!missingCode.ok) {
      expect(missingCode.error.code).toBe("validation")
      expect(missingCode.error.fields?.code).toBe("Required")
    }
  })

  it("completeOAuthCallback surfaces IdP error query params", async () => {
    const started = await adapter.startOAuth({ provider: "github", appId: "github" })
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }
    const denied = await adapter.completeOAuthCallback({
      state: started.data.state,
      provider: "github",
      error: "access_denied",
      errorDescription: "The user denied the request",
    })
    expect(denied.ok).toBe(false)
    if (!denied.ok) {
      expect(denied.error.code).toBe("unauthorized")
      expect(denied.error.message).toBe("The user denied the request")
    }
  })

  it("completeOAuthCallback rejects unknown state", async () => {
    const result = await adapter.completeOAuthCallback({
      code: "mock-code",
      state: "not-a-real-state",
      provider: "slack",
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("unauthorized")
    }
  })

  it("completeOAuthCallback returns the same connection when the state is replayed", async () => {
    const started = await adapter.startOAuth({
      provider: "google",
      appId: "gmail",
      name: "Gmail",
    })
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }

    const first = await adapter.completeOAuthCallback({
      code: "mock-code",
      state: started.data.state,
      provider: "google",
    })
    const second = await adapter.completeOAuthCallback({
      code: "mock-code",
      state: started.data.state,
      provider: "google",
    })
    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) {
      return
    }
    expect(second.data.id).toBe(first.data.id)
    expect(second.data.credentialId).toBe(first.data.credentialId)

    const listed = await adapter.listConnections()
    expect(listed.ok && listed.data).toHaveLength(1)
  })

  it("connectApp with connectionId updates the existing row instead of inserting", async () => {
    const first = await adapter.connectApp({
      appId: "stripe",
      fields: { apiKey: "sk_old" },
    })
    expect(first.ok).toBe(true)
    if (!first.ok) {
      return
    }

    const second = await adapter.connectApp({
      appId: "stripe",
      fields: { apiKey: "sk_new" },
      connectionId: first.data.id,
    })
    expect(second.ok).toBe(true)
    if (!second.ok) {
      return
    }
    expect(second.data.id).toBe(first.data.id)
    expect(second.data.credentialId).toBe(first.data.credentialId)

    const listed = await adapter.listConnections()
    expect(listed.ok && listed.data).toHaveLength(1)
  })


})
