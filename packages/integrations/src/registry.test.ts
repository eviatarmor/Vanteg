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


  it("fills payment refund and invoice trigger fields with filters", () => {
    for (const id of ["stripe", "paypal", "square"] as const) {
      const app = getApp(id)
      expect(app, id).toBeDefined()
      const refund = app!.methods.find((method) => method.id === `${id}-refund-issued`)
      const invoice = app!.methods.find((method) => method.id === `${id}-invoice-paid`)
      expect(refund?.fields.map((field) => field.key), id).toEqual(["currency", "chargeId"])
      expect(invoice?.fields.map((field) => field.key), id).toEqual([
        "currency",
        "customerId",
        "invoiceId",
      ])
      const refundCurrency = refund?.fields.find((field) => field.key === "currency")
      expect(refundCurrency?.control, id).toBe("select")
      expect(refundCurrency?.placeholder, id).toBe("__any__")
      expect(refund?.fields.find((field) => field.key === "chargeId")?.help, id).toMatch(
        /optional/i
      )
      expect(invoice?.fields.find((field) => field.key === "customerId")?.help, id).toMatch(
        /optional/i
      )
    }
  })

  it("uses select controls for currency, ticket status, CRM stage, and GitHub action", () => {
    const stripeCharge = getApp("stripe")?.methods.find((method) => method.id === "stripe-new-charge")
    const currency = stripeCharge?.fields.find((field) => field.key === "currency")
    expect(currency?.control).toBe("select")
    expect(currency?.options?.map((option) => option.value)).toEqual([
      "__any__",
      "usd",
      "eur",
      "gbp",
      "aud",
      "cad",
    ])

    const createCharge = getApp("stripe")?.methods.find((method) => method.id === "stripe-create-charge")
    const chargeCurrency = createCharge?.fields.find((field) => field.key === "currency")
    expect(chargeCurrency?.control).not.toBe("select")
    expect(chargeCurrency?.placeholder).toBe("usd")

    const zendeskStatus = getApp("zendesk")?.methods.find(
      (method) => method.id === "zendesk-ticket-status-changed"
    )
    const status = zendeskStatus?.fields.find((field) => field.key === "status")
    expect(status?.control).toBe("select")
    expect(status?.placeholder).toBe("__any__")
    expect(status?.options?.map((option) => option.value)).toEqual([
      "__any__",
      "new",
      "open",
      "pending",
      "hold",
      "solved",
      "closed",
    ])
    expect(status?.help).toMatch(/generic family statuses/i)

    const zendeskUpdate = getApp("zendesk")?.methods.find(
      (method) => method.id === "zendesk-update-ticket-status"
    )
    expect(zendeskUpdate?.fields.find((field) => field.key === "status")?.options?.map((option) => option.value)).toEqual([
      "new",
      "open",
      "pending",
      "hold",
      "solved",
      "closed",
    ])

    const hubspotStage = getApp("hubspot")?.methods.find(
      (method) => method.id === "hubspot-deal-stage-changed"
    )
    const stage = hubspotStage?.fields.find((field) => field.key === "stage")
    expect(stage?.control).toBe("select")
    expect(stage?.placeholder).toBe("__any__")
    expect(stage?.options?.map((option) => option.value)).toEqual([
      "__any__",
      "qualification",
      "proposal",
      "negotiation",
      "closed_won",
      "closed_lost",
    ])

    const githubAction = getApp("github")?.methods.find((method) => method.id === "github")
    const action = githubAction?.fields.find((field) => field.key === "action")
    expect(action?.control).toBe("select")
    expect(action?.options?.map((option) => option.value)).toEqual([
      "create_issue",
      "create_comment",
      "create_pull_request",
    ])
  })

  it("uses textarea, select, and boolean controls for Slack and Discord", () => {
    const slackSend = getApp("slack")?.methods.find((method) => method.id === "slack")
    expect(slackSend?.fields.find((field) => field.key === "message")?.control).toBe("textarea")
    expect(slackSend?.fields.find((field) => field.key === "unfurlLinks")?.control).toBe("boolean")

    const slackReaction = getApp("slack")?.methods.find((method) => method.id === "slack-add-reaction")
    const slackEmoji = slackReaction?.fields.find((field) => field.key === "emoji")
    expect(slackEmoji?.control).toBe("select")
    expect(slackEmoji?.options?.map((option) => option.value)).toEqual([
      "eyes",
      "thumbsup",
      "thumbsdown",
      "white_check_mark",
      "tada",
      "fire",
      "heart",
      "clap",
      "rocket",
      "warning",
    ])
    expect(slackSend?.fields.find((field) => field.key === "unfurlLinks")?.placeholder).toBe("true")

    const discordSend = getApp("discord")?.methods.find((method) => method.id === "discord")
    expect(discordSend?.fields.find((field) => field.key === "message")?.control).toBe("textarea")
    const discordReaction = getApp("discord")?.methods.find((method) => method.id === "discord-add-reaction")
    expect(discordReaction?.fields.find((field) => field.key === "emoji")?.control).toBe("select")
  })

  it("groups connectors into named categories", () => {
    expect(listConnectorCategories()).toEqual(
      expect.arrayContaining(["Google", "Microsoft", "Communication", "CRM", "AI"])
    )
  })
})
