import { describe, expect, it } from "vitest"

import { createVantegNode } from "../model/create-node"
import { inExplorerNodes, outExplorerNodes } from "./node-io-tree"

describe("node io explorer trees", () => {
  it("groups outgoing variables under this node", () => {
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    const tree = outExplorerNodes(webhook)

    expect(tree).toHaveLength(1)
    expect(tree[0]?.label).toBe("Webhook")
    expect(tree[0]?.icon).toBe("folder")
    const body = tree[0]?.children?.find((child) => child.label === "body")
    expect(body?.icon).toBe("variable")
    expect(body?.hint).toBe("{{Webhook.body}}")
  })

  it("groups incoming variables under previous nodes", () => {
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    const slack = createVantegNode("slack", { x: 80, y: 0 })
    const tree = inExplorerNodes(slack.id, [webhook, slack], [
      { id: "e1", source: webhook.id, target: slack.id },
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0]?.label).toBe("Webhook")
    expect(tree[0]?.icon).toBe("folder")
    const body = tree[0]?.children?.find((child) => child.label === "body")
    expect(body?.icon).toBe("variable")
    expect(body?.hint).toBe("{{Webhook.body}}")
  })
})
