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

  it("keeps formId as input with clearer help and message as textarea", () => {
    for (const id of ["typeform", "google-forms", "surveymonkey"] as const) {
      const app = getApp(id)
      expect(app, id).toBeDefined()

      const submission = app!.methods.find((method) => method.id === `${id}-new-submission`)
      const formId = submission?.fields.find((field) => field.key === "formId")
      expect(formId?.control ?? "input", id).toBe("input")
      expect(formId?.label, id).toBe("Form ID")
      expect(formId?.help, id).toMatch(/form id|settings|title/i)

      const notify = app!.methods.find((method) => method.id === `${id}-notify-respondent`)
      const message = notify?.fields.find((field) => field.key === "message")
      expect(message?.control, id).toBe("textarea")
      expect(notify?.fields.find((field) => field.key === "formId")?.control ?? "input", id).toBe(
        "input"
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

  it("uses select controls for CRM pipeline and stage fields", () => {
    for (const id of ["hubspot", "salesforce", "pipedrive", "zoho-crm", "attio"] as const) {
      const app = getApp(id)
      expect(app, id).toBeDefined()

      const stageChanged = app!.methods.find((method) => method.id === `${id}-deal-stage-changed`)
      const pipeline = stageChanged?.fields.find((field) => field.key === "pipeline")
      const stage = stageChanged?.fields.find((field) => field.key === "stage")
      expect(pipeline?.control, id).toBe("select")
      expect(pipeline?.options?.map((option) => option.value), id).toEqual(
        expect.arrayContaining(["sales", "marketing", "support"])
      )
      expect(stage?.control, id).toBe("select")
      expect(stage?.placeholder, id).toBe("__any__")
      expect(stage?.options?.map((option) => option.value), id).toEqual(
        expect.arrayContaining(["__any__", "closed_won", "closed_lost", "qualification"])
      )
      expect(pipeline?.placeholder, id).toBe("__any__")

      const createDeal = app!.methods.find((method) => method.id === `${id}-create-deal`)
      const amount = createDeal?.fields.find((field) => field.key === "amount")
      expect(amount?.control ?? "input", id).toBe("input")
      expect(amount?.help, id).toMatch(/numeric|number|digits/i)

      const updateStage = app!.methods.find((method) => method.id === `${id}-update-deal-stage`)
      expect(updateStage?.fields.find((field) => field.key === "stage")?.control, id).toBe("select")
    }
  })

  it("clarifies calendar start/until fields and keeps calendar id as input", () => {
    for (const id of ["google-calendar", "outlook-calendar"] as const) {
      const app = getApp(id)
      expect(app, id).toBeDefined()

      const create = app!.methods.find((method) => method.id === `${id}-create-event`)
      const calendar = create?.fields.find((field) => field.key === "calendar")
      const start = create?.fields.find((field) => field.key === "start")
      const until = create?.fields.find((field) => field.key === "until")
      const description = create?.fields.find((field) => field.key === "description")

      expect(calendar?.control ?? "input", id).toBe("input")
      expect(start?.help, id).toMatch(/start/i)
      expect(until?.key, id).toBe("until")
      expect(until?.help, id).toMatch(/end/i)
      expect(description?.control, id).toBe("textarea")

      const update = app!.methods.find((method) => method.id === `${id}-update-event`)
      expect(update?.fields.map((field) => field.key), id).toEqual(
        expect.arrayContaining(["start", "until", "description"])
      )
      expect(update?.fields.find((field) => field.key === "description")?.control, id).toBe("textarea")
    }
  })

  it("polishes Sheets/Docs/Drive/Notion/Airtable field controls", () => {
    const sheets = getApp("google-sheets")
    const createRow = sheets?.methods.find((method) => method.id === "spreadsheet-create-row")
    const updateRow = sheets?.methods.find((method) => method.id === "spreadsheet")
    const sheet = createRow?.fields.find((field) => field.key === "sheet")
    expect(sheet?.control ?? "input").toBe("input")
    expect(sheet?.label).toBe("Sheet ID")
    expect(sheet?.help).toMatch(/resource select later/i)
    expect(createRow?.fields.find((field) => field.key === "values")?.control).toBe("textarea")
    expect(updateRow?.fields.find((field) => field.key === "values")?.control).toBe("textarea")

    const drive = getApp("google-drive")
    const folder = drive?.methods
      .flatMap((method) => method.fields)
      .find((field) => field.key === "folder")
    expect(folder?.control ?? "input").toBe("input")
    expect(folder?.help).toMatch(/resource select later/i)

    const docs = getApp("google-docs")
    expect(docs?.methods.find((method) => method.id === "google-docs-create")?.fields.find((field) => field.key === "content")?.control).toBe(
      "textarea"
    )

    const notion = getApp("notion")
    const createPage = notion?.methods.find((method) => method.id === "notion")
    const page = createPage?.fields.find((field) => field.key === "page")
    expect(page?.control ?? "input").toBe("input")
    expect(page?.help).toMatch(/resource select later/i)
    expect(createPage?.fields.find((field) => field.key === "properties")).toMatchObject({
      control: "code",
      language: "json",
    })
    expect(notion?.methods.find((method) => method.id === "notion-update-page")?.fields.find((field) => field.key === "content")?.control).toBe(
      "textarea"
    )
    const createItem = notion?.methods.find((method) => method.id === "notion-create-database-item")
    expect(createItem?.fields.find((field) => field.key === "database")?.label).toBe("Database ID")
    expect(createItem?.fields.find((field) => field.key === "properties")?.control).toBe("code")

    const airtable = getApp("airtable")
    const create = airtable?.methods.find((method) => method.id === "airtable")
    const find = airtable?.methods.find((method) => method.id === "airtable-find-records")
    expect(create?.fields.find((field) => field.key === "base")?.label).toBe("Base ID")
    expect(create?.fields.find((field) => field.key === "base")?.help).toMatch(/resource select later/i)
    expect(create?.fields.find((field) => field.key === "table")?.label).toBe("Table ID")
    expect(create?.fields.find((field) => field.key === "table")?.help).toMatch(/resource select later/i)
    expect(create?.fields.find((field) => field.key === "fields")).toMatchObject({
      control: "code",
      language: "json",
    })
    expect(find?.fields.find((field) => field.key === "formula")?.control).toBe("textarea")
  })

  it("groups connectors into named categories", () => {
    expect(listConnectorCategories()).toEqual(
      expect.arrayContaining(["Google", "Microsoft", "Communication", "CRM", "AI"])
    )
  })
})
