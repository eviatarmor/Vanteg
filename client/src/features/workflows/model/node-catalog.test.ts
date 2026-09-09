import { describe, expect, it } from "vitest"

import { getNodeTypeForEditor } from "./auth-fields"
import {
  getNodeType,
  listCommonIntegrations,
  listCommonTriggers,
  listConnectorApps,
  listConnectors,
  listLogicGates,
  listNodeTypes,
  listPickerSections,
  nodeTypesByCategory,
} from "./node-catalog"

describe("workflow node catalog", () => {
  it("includes triggers, actions, apps, and logic nodes", () => {
    const ids = listNodeTypes().map((node) => node.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "manual",
        "webhook",
        "schedule",
        "inbound-call",
        "outbound-call",
        "rss",
        "http",
        "email-send",
        "respond-webhook",
        "ai",
        "if",
        "code",
        "loop",
        "slack",
        "github",
        "notion",
        "airtable",
        "discord",
      ])
    )
  })

  it("groups nodes by category", () => {
    expect(nodeTypesByCategory().map((group) => group.category)).toEqual([
      "Triggers",
      "Actions",
      "Apps",
      "Logic",
    ])
  })

  it("looks up a node type by id", () => {
    expect(getNodeType("webhook")?.label).toBe("Webhook")
    expect(getNodeType("missing")).toBeUndefined()
  })

  it("lists common triggers, all logic gates, and common integrations", () => {
    expect(listCommonTriggers().map((node) => node.id)).toEqual([
      "manual",
      "webhook",
      "schedule",
      "inbound-call",
      "outbound-call",
    ])
    expect(listLogicGates().map((node) => node.id)).toEqual([
      "if",
      "switch",
      "filter",
      "delay",
      "code",
      "set",
      "merge",
      "loop",
      "transform",
      "paths",
      "formatter",
    ])
    expect(listCommonIntegrations().map((node) => node.id)).toEqual([
      "http",
      "email-send",
      "slack",
      "spreadsheet",
      "database",
    ])
  })

  it("groups the more picker into triggers, logic gates, and connectors", () => {
    expect(listPickerSections().map((section) => section.label)).toEqual([
      "Triggers",
      "Logic gates",
      "Connectors",
    ])
    expect(listConnectors().map((node) => node.id)).toEqual(
      expect.arrayContaining(["http", "slack", "github", "ai"])
    )
    expect(listConnectorApps().map((app) => app.name)).toEqual(
      expect.arrayContaining([
        "Slack",
        "GitHub",
        "HTTP",
        "Google",
        "Email",
        "HubSpot",
        "Stripe",
        "Google Calendar",
        "Zendesk",
      ])
    )
    expect(
      listConnectorApps()
        .find((app) => app.id === "github")
        ?.methods.map((method) => method.id)
    ).toEqual(
      expect.arrayContaining([
        "github-new-issue",
        "github-pull-request",
        "github-new-commit",
        "github-new-release",
        "github",
        "github-comment",
        "github-create-pr",
        "github-add-label",
      ])
    )
  })

  it("gives every connector app at least two triggers and two actions", () => {
    for (const app of listConnectorApps()) {
      const triggers = app.methods.filter((method) => method.kind === "trigger")
      const actions = app.methods.filter((method) => method.kind === "action")
      expect(triggers.length, `${app.name} triggers`).toBeGreaterThanOrEqual(2)
      expect(actions.length, `${app.name} actions`).toBeGreaterThanOrEqual(2)
    }
  })

  it("exposes extra slack and google methods in the picker", () => {
    const slack = listConnectorApps().find((app) => app.id === "slack")
    const google = listConnectorApps().find((app) => app.id === "google")
    expect(slack?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining([
        "slack-new-channel",
        "slack-app-mentioned",
        "slack-upload-file",
        "slack-add-reaction",
      ])
    )
    expect(google?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining([
        "spreadsheet-updated-row",
        "google-drive-new-file",
        "spreadsheet-create-row",
        "google-drive-upload",
        "spreadsheet-delete-row",
        "google-drive-new-folder",
      ])
    )
  })

  it("exposes Setup fields on HTTP Request and related HTTP nodes", () => {
    const http = getNodeType("http")
    expect(http?.fields.map((field) => field.key)).toEqual([
      "method",
      "url",
      "query",
      "headers",
      "body",
      "timeout",
    ])
    expect(http?.fields.find((field) => field.key === "method")?.control).toBe("select")
    expect(http?.fields.find((field) => field.key === "method")?.options?.map((o) => o.value)).toEqual(
      expect.arrayContaining(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"])
    )
    expect(http?.fields.find((field) => field.key === "query")?.control).toBe("textarea")
    expect(http?.fields.find((field) => field.key === "headers")).toMatchObject({
      control: "code",
      language: "json",
    })
    expect(http?.fields.find((field) => field.key === "body")?.control).toBe("textarea")
    expect(http?.fields.find((field) => field.key === "timeout")?.placeholder).toBe("30000")

    const poll = getNodeType("http-poll")
    expect(poll?.fields.map((field) => field.key)).toEqual([
      "method",
      "url",
      "query",
      "headers",
    ])
    expect(poll?.fields.find((field) => field.key === "headers")?.control).toBe("code")

    const download = getNodeType("http-download")
    expect(download?.fields.map((field) => field.key)).toEqual(["url", "headers", "path"])
    expect(download?.fields.find((field) => field.key === "headers")?.control).toBe("code")

    expect(getNodeTypeForEditor("http")?.fields.map((field) => field.key)).toEqual([
      "method",
      "url",
      "query",
      "headers",
      "body",
      "timeout",
      "credentialId",
      "token",
    ])
  })

  it("covers CRM, payments, and the missing database insert action", () => {
    const hubspot = listConnectorApps().find((app) => app.id === "hubspot")
    const stripe = listConnectorApps().find((app) => app.id === "stripe")
    const database = listConnectorApps().find((app) => app.id === "database")
    expect(hubspot?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining(["hubspot-deal-stage-changed", "hubspot-create-contact"])
    )
    expect(stripe?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining(["stripe-payment-failed", "stripe-subscription-cancelled"])
    )
    expect(database?.methods.map((method) => method.id)).toContain("database-insert-row")
  })

  it("exposes textarea/select/number Setup fields on AI, Classify, and Extract", () => {
    for (const id of ["ai", "ai-classify", "ai-extract"] as const) {
      const node = getNodeType(id)
      expect(node?.fields.find((field) => field.key === "prompt")).toMatchObject({
        control: "textarea",
      })
      const model = node?.fields.find((field) => field.key === "model")
      expect(model?.control).toBe("select")
      expect(model?.options?.map((option) => option.value)).toEqual(
        expect.arrayContaining(["grok-4.6", "gpt-5.5", "claude-sonnet-5"])
      )
      const temperature = node?.fields.find((field) => field.key === "temperature")
      expect(temperature?.control ?? "input").toBe("input")
      expect(temperature?.help).toMatch(/temperature/i)
      expect(temperature?.placeholder).toBe("0.7")
    }

    expect(getNodeType("ai")?.fields.map((field) => field.key)).toEqual([
      "prompt",
      "model",
      "temperature",
    ])
    expect(getNodeType("ai-classify")?.fields.map((field) => field.key)).toEqual([
      "prompt",
      "labels",
      "model",
      "temperature",
    ])
    expect(getNodeType("ai-extract")?.fields.map((field) => field.key)).toEqual([
      "prompt",
      "schema",
      "model",
      "temperature",
    ])
  })

  it("exposes operation select, query textarea, and table input on Database CRUD", () => {
    const database = getNodeType("database")
    expect(database?.fields.map((field) => field.key)).toEqual([
      "operation",
      "table",
      "query",
    ])
    const operation = database?.fields.find((field) => field.key === "operation")
    expect(operation?.control).toBe("select")
    expect(operation?.options?.map((option) => option.value)).toEqual([
      "insert",
      "update",
      "select",
      "delete",
    ])
    expect(database?.fields.find((field) => field.key === "query")).toMatchObject({
      control: "textarea",
    })
    const table = database?.fields.find((field) => field.key === "table")
    expect(table?.control ?? "input").toBe("input")
    expect(table?.placeholder).toBe("jobs")
  })
})
