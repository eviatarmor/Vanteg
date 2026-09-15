import { describe, expect, it } from "vitest"

import { isUnaryOperator, migrateLegacyCondition, parseConditionGroup } from "./conditions"

describe("condition builder model", () => {
  it("hides Value 2 for unary operators", () => {
    expect(isUnaryOperator("exists")).toBe(true)
    expect(isUnaryOperator("empty")).toBe(true)
    expect(isUnaryOperator("past")).toBe(true)
    expect(isUnaryOperator("eq")).toBe(false)
    expect(isUnaryOperator("between")).toBe(false)
  })

  it("migrates legacy condition plus operator rows", () => {
    const json = migrateLegacyCondition({ condition: "{{Webhook.body}}", operator: "empty" })
    const group = parseConditionGroup(json)
    expect(group.rules[0]?.left).toBe("{{Webhook.body}}")
    expect(group.rules[0]?.operator).toBe("empty")
    expect(isUnaryOperator(group.rules[0]!.operator)).toBe(true)
  })
})
