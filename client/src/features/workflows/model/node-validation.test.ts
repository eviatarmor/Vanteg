import { describe, expect, it } from "vitest"

import { createVantegNode } from "./create-node"
import { getNodeType } from "./node-catalog"
import { validateNodeSetup } from "./node-validation"
import type { Workflow } from "./types"

describe("node setup validation", () => {
  it("requires a unique webhook path", () => {
    const first = createVantegNode("webhook", { x: 0, y: 0 })
    const second = createVantegNode("webhook", { x: 40, y: 0 })
    first.data.config.path = "/hooks/a"
    second.data.config.path = "/hooks/a"
    const workflow: Workflow = {
      id: "wf",
      name: "Test",
      status: "draft",
      nodes: [first, second],
      edges: [],
      updatedAt: 0,
    }
    const errors = validateNodeSetup(second, getNodeType("webhook"), workflow)
    expect(errors.some((error) => error.message.toLowerCase().includes("unique"))).toBe(true)
  })

  it("requires integer ranges on schedule minute", () => {
    const node = createVantegNode("schedule", { x: 0, y: 0 })
    node.data.config.intervalType = "days"
    node.data.config.minute = "99"
    const errors = validateNodeSetup(node, getNodeType("schedule"))
    expect(errors.some((error) => error.key === "minute")).toBe(true)
  })
})
