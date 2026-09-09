import { beforeEach, describe, expect, it } from "vitest"

import { err } from "@workspace/integrations"

import { getIntegrationsAdapter, setIntegrationsAdapter } from "./adapter"
import {
  addDataRow,
  completeOAuthCallback,
  connectConnector,
  createCustomCredential,
  deleteCustomCredential,
  disconnectConnector,
  ensureCustomCredentialsLoaded,
  getCustomCredentialsMeta,
  getIntegrationsSnapshot,
  insertDataRows,
  resetIntegrationsStore,
  setCustomCredentialsLoadFailureOnce,
  startManagedOAuthConnect,
  updateCustomCredential,
} from "./store"

describe("integrations store", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("connects Google Sheets without a client secret and opens In / Data / Out sheets", async () => {
    const result = await connectConnector("google-sheets")
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    const connection = result.data
    const snapshot = getIntegrationsSnapshot()

    expect(connection.connectorId).toBe("google-sheets")
    expect(snapshot.credentials).toHaveLength(1)
    expect(snapshot.credentials[0]?.kind).toBe("oauth2")
    expect(snapshot.credentials[0]?.managed).toBe(true)
    expect(snapshot.credentials[0]?.fields).not.toHaveProperty("clientId")
    expect(snapshot.credentials[0]?.fields).not.toHaveProperty("clientSecret")
    expect(snapshot.connections[0]?.sheets.in.map((row) => row.key)).toEqual(
      expect.arrayContaining(["spreadsheetId", "sheetName", "range", "operation"])
    )
    expect(snapshot.connections[0]?.sheets.data.length).toBeGreaterThan(0)
    expect(snapshot.connections[0]?.sheets.out).toEqual([])
  })

  it("saves a Stripe API key as a credential", async () => {
    await connectConnector("stripe", { apiKey: "sk_test_vanteg" })

    const credential = getIntegrationsSnapshot().credentials[0]
    expect(credential?.kind).toBe("api-key")
    expect(credential?.fields.apiKey).toBe("sk_test_vanteg")
  })

  it("returns validation errors for empty Stripe keys", async () => {
    const result = await connectConnector("stripe", { apiKey: "" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("validation")
      expect(result.error.fields?.apiKey).toBe("Required")
    }
  })

  it("inserts data rows and records output variables", async () => {
    const result = await connectConnector("google-sheets")
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    const connection = result.data
    addDataRow(connection.id, {
      name: "Ada Lovelace",
      email: "ada@vanteg.dev",
      company: "Vanteg",
      status: "active",
    })
    const rowId = getIntegrationsSnapshot().connections[0]?.sheets.data.at(-1)?.id
    expect(rowId).toBeDefined()

    insertDataRows(connection.id, [rowId!])

    const sheets = getIntegrationsSnapshot().connections[0]?.sheets
    expect(sheets?.out.length).toBe(1)
    expect(sheets?.out[0]?.updatedRows).toBe(1)
    expect(sheets?.out[0]?.spreadsheetId).toBeTruthy()
    expect(sheets?.data.find((row) => row.id === rowId)?.inserted).toBe(true)
  })

  it("keeps a previous Stripe key when reconnecting with a blank field", async () => {
    await connectConnector("stripe", { apiKey: "sk_live_one" })
    const id = getIntegrationsSnapshot().credentials[0]?.id
    expect(id).toBeDefined()

    await connectConnector("stripe", { apiKey: "" }, id)

    expect(getIntegrationsSnapshot().credentials[0]?.fields.apiKey).toBe("sk_live_one")
  })

  it("creates and updates custom credentials without exposing blank-secret clears", async () => {
    const created = await createCustomCredential({
      name: "HMAC prod",
      kind: "hmac",
      fields: { secret: "shh", algorithm: "SHA256" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }
    expect(getIntegrationsSnapshot().customCredentials).toHaveLength(1)

    const updated = await updateCustomCredential({
      id: created.data.id,
      name: "HMAC staging",
      fields: { secret: "", algorithm: "SHA512", headerName: "X-Sig" },
    })
    expect(updated.ok).toBe(true)
    if (!updated.ok) {
      return
    }
    expect(updated.data.fields.secret).toBe("shh")
    expect(updated.data.fields.algorithm).toBe("SHA512")
    expect(updated.data.name).toBe("HMAC staging")

    const deleted = await deleteCustomCredential(created.data.id)
    expect(deleted.ok).toBe(true)
    expect(getIntegrationsSnapshot().customCredentials).toHaveLength(0)
  })

  it("starts managed OAuth and completes via callback into the store", async () => {
    const started = await startManagedOAuthConnect("slack")
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }
    expect(started.data.authorizeUrl).toContain("/integrations/oauth/callback")
    expect(getIntegrationsSnapshot().connections).toHaveLength(0)

    const params = new URL(started.data.authorizeUrl, "http://localhost")
    const completed = await completeOAuthCallback({
      code: params.searchParams.get("code") ?? undefined,
      state: params.searchParams.get("state") ?? undefined,
      provider: params.searchParams.get("provider") ?? undefined,
    })
    expect(completed.ok).toBe(true)
    if (!completed.ok) {
      return
    }
    expect(completed.data.connectorId).toBe("slack")
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials[0]?.managed).toBe(true)
  })

  it("rejects completing OAuth when state is missing", async () => {
    const result = await completeOAuthCallback({ code: "mock-code" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("validation")
    }
  })

  it("replays completeOAuthCallback without duplicating the connection", async () => {
    const started = await startManagedOAuthConnect("slack")
    expect(started.ok).toBe(true)
    if (!started.ok) {
      return
    }
    const params = new URL(started.data.authorizeUrl, "http://localhost")
    const input = {
      code: params.searchParams.get("code") ?? undefined,
      state: params.searchParams.get("state") ?? undefined,
      provider: params.searchParams.get("provider") ?? undefined,
    }
    const first = await completeOAuthCallback(input)
    const second = await completeOAuthCallback(input)
    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials).toHaveLength(1)
  })

  it("reconnects Stripe without creating a second adapter connection", async () => {
    await connectConnector("stripe", { apiKey: "sk_live_one" })
    const id = getIntegrationsSnapshot().credentials[0]?.id
    expect(id).toBeDefined()

    await connectConnector("stripe", { apiKey: "sk_live_two" }, id)

    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials[0]?.fields.apiKey).toBe("sk_live_two")

    const listed = await getIntegrationsAdapter().listConnections()
    expect(listed.ok && listed.data).toHaveLength(1)
  })

  it("keeps the connector row when adapter delete fails", async () => {
    await connectConnector("stripe", { apiKey: "sk_test" })
    const connectionId = getIntegrationsSnapshot().connections[0]?.id
    expect(connectionId).toBeDefined()

    const inner = getIntegrationsAdapter()
    setIntegrationsAdapter({
      ...inner,
      deleteConnection: async () =>
        err({ code: "internal", message: "Adapter down" }),
    })

    const result = await disconnectConnector(connectionId!)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe("Adapter down")
    }
    expect(getIntegrationsSnapshot().connections).toHaveLength(1)
    expect(getIntegrationsSnapshot().credentials).toHaveLength(1)
  })

  it("removes the connector row after adapter delete succeeds", async () => {
    await connectConnector("stripe", { apiKey: "sk_test" })
    const connectionId = getIntegrationsSnapshot().connections[0]?.id
    expect(connectionId).toBeDefined()

    const result = await disconnectConnector(connectionId!)
    expect(result.ok).toBe(true)
    expect(getIntegrationsSnapshot().connections).toHaveLength(0)
    expect(getIntegrationsSnapshot().credentials).toHaveLength(0)

    const listed = await getIntegrationsAdapter().listConnections()
    expect(listed.ok && listed.data).toHaveLength(0)
  })

})

describe("custom credentials load status", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("hydrates credentials from the adapter", async () => {
    const created = await createCustomCredential({
      name: "Listed",
      kind: "bearer",
      fields: { token: "tok" },
    })
    expect(created.ok).toBe(true)
    await ensureCustomCredentialsLoaded()
    expect(getCustomCredentialsMeta().status).toBe("ready")
    expect(getIntegrationsSnapshot().customCredentials.map((item) => item.name)).toContain(
      "Listed"
    )
  })

  it("records a load failure", async () => {
    setCustomCredentialsLoadFailureOnce()
    await ensureCustomCredentialsLoaded()
    expect(getCustomCredentialsMeta()).toMatchObject({
      status: "error",
      error: "Failed to load custom credentials",
    })
  })
})
