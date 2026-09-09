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
    expect(started.data.authorizeUrl).toContain("https://example.invalid/oauth/slack")
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
})
