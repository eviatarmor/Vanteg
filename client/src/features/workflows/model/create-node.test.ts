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

  it("defaults If/Filter operators and Delay unit from select placeholders", () => {
    expect(createVantegNode("if", { x: 0, y: 0 }).data.config.operator).toBe("eq")
    expect(createVantegNode("filter", { x: 0, y: 0 }).data.config.operator).toBe("gt")
    expect(createVantegNode("delay", { x: 0, y: 0 }).data.config.unit).toBe("minutes")
  })

  it("defaults Code language and Merge mode from select placeholders", () => {
    expect(createVantegNode("code", { x: 0, y: 0 }).data.config.language).toBe("javascript")
    expect(createVantegNode("merge", { x: 0, y: 0 }).data.config.mode).toBe("append")
  })

  it("defaults Notification severity, File operation, and webhook status from selects", () => {
    expect(createVantegNode("notification", { x: 0, y: 0 }).data.config.severity).toBe("info")
    expect(createVantegNode("file", { x: 0, y: 0 }).data.config.operation).toBe("read")
    expect(createVantegNode("respond-webhook", { x: 0, y: 0 }).data.config.status).toBe("200")
  })
})
