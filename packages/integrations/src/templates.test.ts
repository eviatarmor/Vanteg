import { describe, expect, it } from "vitest"

import { getConnector } from "./registry.ts"
import { templates } from "./templates.ts"

function fieldById(fields: { id: string }[], id: string) {
  return fields.find((field) => field.id === id)
}

describe("shared connector templates field controls", () => {
  it("uses long-text message and clearer channel labels on chat", () => {
    const channel = fieldById(templates.chat.in, "channel")
    const text = fieldById(templates.chat.in, "text")
    expect(channel?.name).toMatch(/channel id or name/i)
    expect(channel?.description).toMatch(/channel/i)
    expect(text?.variant).toBe("long-text")
    expect(fieldById(templates.chat.data, "text")?.variant).toBe("long-text")
    expect(fieldById(templates.chat.data, "channel")?.name).toMatch(/channel id or name/i)
  })

  it("keeps email body as long-text and adds to/from validation hints", () => {
    expect(fieldById(templates.email.in, "body")?.variant).toBe("long-text")
    expect(fieldById(templates.email.data, "body")?.variant).toBe("long-text")
    expect(fieldById(templates.email.in, "from")?.description).toMatch(/email/i)
    expect(fieldById(templates.email.in, "to")?.description).toMatch(/email/i)
    expect(fieldById(templates.email.data, "to")?.description).toMatch(/email/i)
  })

  it("uses long-text for issue body and comment", () => {
    expect(fieldById(templates.issue.data, "body")?.variant).toBe("long-text")
    const comment = fieldById(templates.issue.data, "comment")
    expect(comment?.variant).toBe("long-text")
    expect(comment?.description).toMatch(/comment/i)
  })

  it("exposes AI model as a select with static options and long-text prompt", () => {
    const model = fieldById(templates.ai.in, "model")
    expect(model?.variant).toBe("select")
    expect(model?.options?.map((option) => option.value)).toEqual(
      expect.arrayContaining(["gpt-4o", "gpt-4o-mini", "claude-sonnet-4"])
    )
    expect(fieldById(templates.ai.data, "prompt")?.variant).toBe("long-text")
  })

  it("exposes payment currency as a select", () => {
    const inCurrency = fieldById(templates.payment.in, "currency")
    const dataCurrency = fieldById(templates.payment.data, "currency")
    expect(inCurrency?.variant).toBe("select")
    expect(dataCurrency?.variant).toBe("select")
    expect(inCurrency?.options?.map((option) => option.value)).toEqual(
      expect.arrayContaining(["usd", "eur", "gbp", "aud", "cad"])
    )
    expect(inCurrency?.defaultValue).toBe("usd")
  })

  it("propagates polished template fields to long-tail connectors", () => {
    const telegram = getConnector("telegram")
    expect(telegram?.inFields.find((field) => field.id === "text")?.variant).toBe("long-text")
    expect(telegram?.inFields.find((field) => field.id === "channel")?.name).toMatch(
      /channel id or name/i
    )

    const gmail = getConnector("gmail")
    expect(gmail?.dataFields.find((field) => field.id === "body")?.variant).toBe("long-text")
    expect(gmail?.inFields.find((field) => field.id === "to")?.description).toMatch(/email/i)

    const linear = getConnector("linear")
    expect(linear?.dataFields.find((field) => field.id === "body")?.variant).toBe("long-text")
    expect(linear?.dataFields.find((field) => field.id === "comment")?.variant).toBe("long-text")

    const openai = getConnector("openai")
    expect(openai?.inFields.find((field) => field.id === "model")?.variant).toBe("select")
    expect(openai?.dataFields.find((field) => field.id === "prompt")?.variant).toBe("long-text")

    const stripe = getConnector("stripe")
    expect(stripe?.inFields.find((field) => field.id === "currency")?.variant).toBe("select")
    expect(stripe?.dataFields.find((field) => field.id === "currency")?.variant).toBe("select")
  })
})
