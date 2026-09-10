import { describe, expect, it } from "vitest"

import { getOAuthApp } from "@workspace/integrations"

import { CONNECTORS, getConnector, listConnectorCategories } from "./catalog"

describe("integration catalog", () => {
  it("ships only Google connectors with unique ids", () => {
    expect(CONNECTORS.length).toBeGreaterThan(0)
    expect(
      CONNECTORS.every((connector) => connector.category === "Google")
    ).toBe(true)
    expect(new Set(CONNECTORS.map((connector) => connector.id)).size).toBe(
      CONNECTORS.length
    )
    expect(
      CONNECTORS.some((connector) => connector.id === "google-sheets")
    ).toBe(true)
    expect(CONNECTORS.some((connector) => connector.id === "slack")).toBe(false)
  })

  it("gives every connector brand icon, auth, and In / Data / Out fields", () => {
    for (const connector of CONNECTORS) {
      expect(connector.iconSlug.length).toBeGreaterThan(0)
      expect(connector.inFields.length).toBeGreaterThan(0)
      expect(connector.dataFields.length).toBeGreaterThan(0)
      expect(connector.outFields.length).toBeGreaterThan(0)
      expect(connector.auth.kind).toMatch(
        /^(oauth2|api-key|jwt|basic|bearer|service-account)$/
      )
    }
  })

  it("keeps unshipped connectors lookupable while hiding them from the catalog", () => {
    expect(getConnector("klaviyo")?.auth).toEqual({
      kind: "oauth2",
      oauthAppId: "klaviyo",
    })
    expect(getConnector("slack")?.auth).toEqual({
      kind: "oauth2",
      oauthAppId: "slack",
    })
    expect(
      CONNECTORS.find((connector) => connector.id === "slack")
    ).toBeUndefined()
  })

  it("includes Google Sheets with Google OAuth", () => {
    expect(getConnector("google-sheets")?.auth).toEqual({
      kind: "oauth2",
      oauthAppId: "google",
    })
  })

  it("uses Google Sheets fields that match n8n and Zapier", () => {
    const sheets = getConnector("google-sheets")
    expect(sheets?.inFields.map((field) => field.id)).toEqual(
      expect.arrayContaining([
        "spreadsheetId",
        "sheetName",
        "range",
        "operation",
      ])
    )
    expect(sheets?.dataFields.map((field) => field.id)).toEqual(
      expect.arrayContaining(["name", "email", "company", "status"])
    )
    expect(sheets?.outFields.map((field) => field.id)).toEqual(
      expect.arrayContaining(["updatedRange", "updatedRows", "spreadsheetId"])
    )
  })

  it("points every OAuth connector at a Vanteg-owned app", () => {
    for (const connector of CONNECTORS) {
      if (connector.auth.kind !== "oauth2") {
        continue
      }
      expect(connector.auth.oauthAppId, connector.id).toBeTruthy()
      expect(getOAuthApp(connector.auth.oauthAppId ?? "")).toBeDefined()
    }
  })

  it("groups connectors into named categories", () => {
    const categories = listConnectorCategories()
    expect(categories).toEqual(["Google"])
  })
})
