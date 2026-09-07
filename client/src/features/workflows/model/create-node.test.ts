import { describe, expect, it } from "vitest"

import { createFreezeNode } from "./create-node"

describe("createFreezeNode", () => {
  it("builds a freeze node from a catalog id", () => {
    const node = createFreezeNode("webhook", { x: 12, y: 24 })

    expect(node.type).toBe("freeze")
    expect(node.position).toEqual({ x: 12, y: 24 })
    expect(node.data.catalogId).toBe("webhook")
    expect(node.data.label).toBe("Webhook")
    expect(node.data.notes).toBe("")
    expect(node.data.config).toEqual({ method: "POST" })
    expect(node.data.outVars.map((item) => item.key)).toContain("body")
  })
})
