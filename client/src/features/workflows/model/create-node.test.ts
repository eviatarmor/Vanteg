import { describe, expect, it } from "vitest"

import { createVantegNode } from "./create-node"

describe("createVantegNode", () => {
  it("builds a vanteg node from a catalog id", () => {
    const node = createVantegNode("webhook", { x: 12, y: 24 })

    expect(node.type).toBe("vanteg")
    expect(node.position).toEqual({ x: 12, y: 24 })
    expect(node.data.catalogId).toBe("webhook")
    expect(node.data.label).toBe("Webhook")
    expect(node.data.notes).toBe("")
    expect(node.data.config).toEqual({ method: "POST" })
    expect(node.data.outVars.map((item) => item.key)).toContain("body")
  })

  it("defaults boolean fields from placeholder", () => {
    const slack = createVantegNode("slack", { x: 0, y: 0 })
    expect(slack.data.config.unfurlLinks).toBe("true")
  })
})
