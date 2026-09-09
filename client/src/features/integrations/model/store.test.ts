import { beforeEach, describe, expect, it } from "vitest"

import {
  addDataRow,
  connectConnector,
  getIntegrationsSnapshot,
  insertDataRows,
  resetIntegrationsStore,
} from "./store"

describe("integrations store", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("connects Google Sheets without a client secret and opens In / Data / Out sheets", () => {
    const connection = connectConnector("google-sheets")
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

  it("saves a Stripe API key as a credential", () => {
    connectConnector("stripe", { apiKey: "sk_test_vanteg" })

    const credential = getIntegrationsSnapshot().credentials[0]
    expect(credential?.kind).toBe("api-key")
    expect(credential?.fields.apiKey).toBe("sk_test_vanteg")
  })

  it("inserts data rows and records output variables", () => {
    const connection = connectConnector("google-sheets")
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

  it("keeps a previous Stripe key when reconnecting with a blank field", () => {
    connectConnector("stripe", { apiKey: "sk_live_one" })
    const id = getIntegrationsSnapshot().credentials[0]?.id
    expect(id).toBeDefined()

    connectConnector("stripe", { apiKey: "" }, id)

    expect(getIntegrationsSnapshot().credentials[0]?.fields.apiKey).toBe("sk_live_one")
  })
})
