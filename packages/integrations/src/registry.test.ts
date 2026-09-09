import { describe, expect, it } from "vitest"

import {
  CONNECTORS,
  getApp,
  getConnector,
  getOAuthApp,
  listApps,
  listConnectorCategories,
  listFeaturedMethods,
  listPickerConnectorApps,
  oauthApps,
  terraformOAuthApps,
} from "./registry.ts"

describe("integrations registry", () => {
  it("lists at least 100 apps with unique ids", () => {
    const apps = listApps()
    expect(apps.length).toBeGreaterThanOrEqual(100)
    expect(new Set(apps.map((app) => app.id)).size).toBe(apps.length)
    expect(CONNECTORS.length).toBe(apps.length)
  })

  it("gives every app an icon, auth, and In / Data / Out sheets", () => {
    for (const connector of CONNECTORS) {
      expect(connector.iconSlug.length, connector.id).toBeGreaterThan(0)
      expect(connector.inFields.length, connector.id).toBeGreaterThan(0)
      expect(connector.dataFields.length, connector.id).toBeGreaterThan(0)
      expect(connector.outFields.length, connector.id).toBeGreaterThan(0)
      expect(connector.auth.kind).toMatch(
        /^(oauth2|api-key|jwt|basic|bearer|service-account)$/
      )
      expect(connector.operations.length, connector.id).toBeGreaterThan(0)
    }
  })

  it("points every OAuth app at a Vanteg-owned provider", () => {
    for (const app of listApps()) {
      if (app.auth.kind !== "oauth2") {
        continue
      }
      expect(app.auth.provider, app.id).toBeTruthy()
      expect(getOAuthApp(app.auth.provider), app.id).toBeDefined()
    }
  })

  it("keeps featured Slack methods as the operations list, not only chat template verbs", () => {
    const slack = getApp("slack")
    expect(slack?.featured).toBe(true)
    expect(slack?.sheetsTemplate).toBe("chat")
    expect(slack?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining([
        "slack-new-message",
        "slack-new-channel",
        "slack",
        "slack-upload-file",
        "slack-add-reaction",
      ])
    )
    expect(getConnector("slack")?.operations).toEqual(
      expect.arrayContaining(["Send message", "Update message", "Upload file"])
    )
    expect(getConnector("slack")?.operations).not.toContain("post")
  })

  it("marks Slack channel MethodFields as resource-select", () => {
    const slack = getApp("slack")
    const channelFields = (slack?.methods ?? []).flatMap((method) =>
      method.fields.filter((field) => field.key === "channel")
    )
    expect(channelFields.length).toBeGreaterThanOrEqual(8)
    for (const field of channelFields) {
      expect(field.control).toBe("resource")
      expect(field.resourceType).toBe("slack.channel")
    }
  })

  it("marks featured app MethodFields as resource-select", () => {
    const cases: Array<{ appId: string; key: string; resourceType: string; min: number }> = [
      { appId: "github", key: "repo", resourceType: "github.repo", min: 10 },
      { appId: "google-sheets", key: "sheet", resourceType: "sheets.sheet", min: 4 },
      { appId: "discord", key: "channel", resourceType: "discord.channel", min: 5 },
      { appId: "notion", key: "page", resourceType: "notion.page", min: 4 },
      { appId: "google-calendar", key: "calendar", resourceType: "calendar.calendar", min: 4 },
      { appId: "google-forms", key: "formId", resourceType: "forms.form", min: 3 },
      { appId: "microsoft-teams", key: "team", resourceType: "teams.team", min: 7 },
      { appId: "microsoft-teams", key: "channel", resourceType: "teams.channel", min: 4 },
    ]
    for (const { appId, key, resourceType, min } of cases) {
      const app = getApp(appId)
      const fields = (app?.methods ?? []).flatMap((method) =>
        method.fields.filter((field) => field.key === key)
      )
      expect(fields.length, appId).toBeGreaterThanOrEqual(min)
      for (const field of fields) {
        expect(field.control, `${appId}.${key}`).toBe("resource")
        expect(field.resourceType, `${appId}.${key}`).toBe(resourceType)
      }
    }
  })

  it("promotes Microsoft Teams with featured methods and textarea message fields", () => {
    const teams = getApp("microsoft-teams")
    expect(teams?.featured).toBe(true)
    expect(teams?.sheetsTemplate).toBe("chat")
    expect(teams?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining([
        "microsoft-teams-new-message",
        "microsoft-teams-channel-created",
        "microsoft-teams-member-added",
        "microsoft-teams",
        "microsoft-teams-reply-in-thread",
        "microsoft-teams-update-message",
        "microsoft-teams-list-channels",
      ])
    )
    expect(getConnector("microsoft-teams")?.operations).toEqual(
      expect.arrayContaining(["Post message", "Reply in thread", "Update message", "List channels"])
    )
    expect(getConnector("microsoft-teams")?.operations).not.toContain("post")
    const messageFields = teams!.methods
      .filter((method) => method.kind === "action")
      .flatMap((method) => method.fields)
      .filter((field) => field.key === "message")
    expect(messageFields.length).toBeGreaterThan(0)
    expect(messageFields.every((field) => field.control === "textarea")).toBe(true)
    expect(listFeaturedMethods().map((method) => method.id)).toEqual(
      expect.arrayContaining(["microsoft-teams", "microsoft-teams-new-message"])
    )
  })

  it("marks Microsoft Teams team and channel MethodFields as resource-select", () => {
    const teams = getApp("microsoft-teams")
    const teamFields = (teams?.methods ?? []).flatMap((method) =>
      method.fields.filter((field) => field.key === "team")
    )
    const channelFields = (teams?.methods ?? []).flatMap((method) =>
      method.fields.filter((field) => field.key === "channel")
    )
    expect(teamFields.length).toBeGreaterThanOrEqual(7)
    expect(channelFields.length).toBeGreaterThanOrEqual(4)
    for (const field of teamFields) {
      expect(field.control).toBe("resource")
      expect(field.resourceType).toBe("teams.team")
    }
    for (const field of channelFields) {
      expect(field.control).toBe("resource")
      expect(field.resourceType).toBe("teams.channel")
    }
  })

  it("groups Google Sheets, Drive, and Docs into one picker app", () => {
    const google = listPickerConnectorApps().find((app) => app.id === "google")
    expect(getApp("google-sheets")?.pickerGroup).toBe("google")
    expect(getApp("google-drive")?.pickerGroup).toBe("google")
    expect(getApp("google-docs")?.pickerGroup).toBe("google")
    expect(google?.name).toBe("Google")
    expect(google?.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining([
        "spreadsheet-new-row",
        "spreadsheet",
        "google-drive-new-file",
        "google-drive-upload",
        "google-docs-create",
      ])
    )
    expect(listPickerConnectorApps().map((app) => app.id)).not.toContain("google-sheets")
  })

  it("derives picker nodes from featured methods", () => {
    const methodIds = listFeaturedMethods().map((method) => method.id)
    expect(methodIds).toEqual(
      expect.arrayContaining(["slack", "github-new-issue", "hubspot-create-contact"])
    )
    for (const app of listPickerConnectorApps()) {
      const triggers = app.methods.filter((method) => method.kind === "trigger")
      const actions = app.methods.filter((method) => method.kind === "action")
      expect(triggers.length, `${app.name} triggers`).toBeGreaterThanOrEqual(2)
      expect(actions.length, `${app.name} actions`).toBeGreaterThanOrEqual(2)
    }
  })

  it("does not list long-tail apps in the workflow picker", () => {
    const pickerIds = new Set(listPickerConnectorApps().map((app) => app.id))
    expect(pickerIds.has("klaviyo")).toBe(false)
    expect(getApp("klaviyo")?.featured).toBe(false)
    expect(getConnector("klaviyo")?.auth).toEqual({ kind: "oauth2", oauthAppId: "klaviyo" })
  })

  it("exports terraform locals whose scopes include provider base scopes plus app scopes", () => {
    const locals = terraformOAuthApps()
    expect(Object.keys(locals).sort()).toEqual(oauthApps.map((app) => app.id).sort())
    expect(oauthApps.every((app) => app.managed)).toBe(true)
    expect(getOAuthApp("microsoft")?.provisioner).toBe("azuread")
    expect(getOAuthApp("google")?.provisioner).toBe("google-apis")
    expect(getOAuthApp("slack")?.provisioner).toBe("ssm-slot")
    expect(locals.google.scopes).toEqual(
      expect.arrayContaining(["https://www.googleapis.com/auth/spreadsheets"])
    )
  })

  it("groups connectors into named categories", () => {
    expect(listConnectorCategories()).toEqual(
      expect.arrayContaining(["Google", "Microsoft", "Communication", "CRM", "AI"])
    )
  })
})
