import { describe, expect, it } from "vitest"

import { TICKET_STATUSES } from "./families.ts"
import { isSecretSetupKey } from "./io-schema.ts"
import { listFeaturedMethods } from "./registry.ts"

const GENERIC_ONLY = new Set(["payload", "result"])

describe("featured method I/O contracts", () => {
  it("declares a domain output schema for every featured method", () => {
    const methods = listFeaturedMethods()
    expect(methods.length).toBeGreaterThan(50)
    for (const method of methods) {
      const outputs = method.outputs ?? []
      expect(outputs.length, `${method.id} outputs`).toBeGreaterThan(0)
      const keys = outputs.map((field) => field.key)
      expect(new Set(keys).size, `${method.id} unique output keys`).toBe(keys.length)
      for (const field of outputs) {
        expect(field.key, `${method.id} output key`).toBeTruthy()
        expect(field.label, `${method.id}.${field.key} label`).toBeTruthy()
        expect(field.type, `${method.id}.${field.key} type`).toBeTruthy()
        expect(isSecretSetupKey(field.key), `${method.id} secret output ${field.key}`).toBe(
          false
        )
      }
      const setupSecrets = method.fields.filter(
        (field) => field.secret || field.sensitive || isSecretSetupKey(field.key)
      )
      for (const secret of setupSecrets) {
        expect(keys, `${method.id} leaked setup secret ${secret.key}`).not.toContain(
          secret.key
        )
      }
      const onlyGeneric = keys.every((key) => GENERIC_ONLY.has(key) || key === "ok")
      expect(onlyGeneric, `${method.id} undifferentiated payload/result`).toBe(false)
    }
  })

  it("does not reuse Zendesk statuses for Intercom, Help Scout, or Front", () => {
    expect(TICKET_STATUSES.zendesk.map((item) => item.value)).toEqual(
      expect.arrayContaining(["new", "open", "solved"])
    )
    expect(TICKET_STATUSES.intercom.map((item) => item.value)).toEqual([
      "open",
      "snoozed",
      "closed",
    ])
    expect(TICKET_STATUSES["help-scout"]?.map((item) => item.value)).toEqual([
      "active",
      "pending",
      "closed",
      "spam",
    ])
    expect(TICKET_STATUSES.front.map((item) => item.value)).toEqual([
      "open",
      "archived",
      "trashed",
      "spam",
    ])

    const methods = listFeaturedMethods()
    const intercomStatus = methods
      .find((method) => method.id === "intercom-update-ticket-status")
      ?.fields.find((field) => field.key === "status")
    expect(intercomStatus?.options?.map((option) => option.value)).toEqual([
      "open",
      "snoozed",
      "closed",
    ])
    expect(intercomStatus?.options?.map((option) => option.value)).not.toContain("solved")

    const zendeskStatus = methods
      .find((method) => method.id === "zendesk-update-ticket-status")
      ?.fields.find((field) => field.key === "status")
    expect(zendeskStatus?.options?.map((option) => option.value)).toContain("solved")
  })

  it("covers CRM, payments, calendar, forms, and ticket families", () => {
    const ids = listFeaturedMethods().map((method) => method.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "hubspot-create-contact",
        "salesforce-create-deal",
        "pipedrive-find-contact",
        "zoho-crm-new-company",
        "attio-update-contact",
        "stripe-create-charge",
        "paypal-invoice-paid",
        "square-issue-refund",
        "google-calendar-create-event",
        "outlook-calendar-new-event",
        "typeform-new-submission",
        "google-forms-get-form",
        "surveymonkey-notify-respondent",
        "zendesk-create-ticket",
        "intercom-add-reply",
        "help-scout-ticket-status-changed",
        "front-assign-ticket",
      ])
    )
  })
})
