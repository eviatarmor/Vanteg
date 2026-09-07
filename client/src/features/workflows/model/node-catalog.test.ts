import { describe, expect, it } from "vitest"

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
      expect.arrayContaining(["Slack", "GitHub", "HTTP", "Google", "Email"])
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
      ])
    )
  })
})
