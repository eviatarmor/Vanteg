import { describe, expect, it } from "vitest"

import {
  expressionRefs,
  missingExpressionRefs,
  parseWorkflowExpression,
  serializeWorkflowExpression,
} from "./expression"

describe("workflow expression chips", () => {
  it("round-trips mixed text and {{Node.path}} chips", () => {
    const value = "Hello {{Webhook.body.email}} from {{HTTP Request.status}}"
    const segments = parseWorkflowExpression(value)
    expect(serializeWorkflowExpression(segments)).toBe(value)
    expect(expressionRefs(value)).toEqual(["Webhook.body.email", "HTTP Request.status"])
  })

  it("flags missing upstream references", () => {
    const available = ["Webhook.body", "Webhook.body.email"]
    expect(missingExpressionRefs("{{Webhook.body.email}}", available)).toEqual([])
    expect(missingExpressionRefs("{{Webhook.secret}}", available)).toEqual(["Webhook.secret"])
  })
})
