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

  it("marks secret leaves with the secret icon and keeps the expression hint", () => {
    const http = createVantegNode("http", { x: 0, y: 0 })
    http.data.outVars = [
      { id: "1", key: "status", value: "200" },
      { id: "2", key: "token", value: "super-secret-token", secret: true },
      { id: "3", key: "credentialId", value: "cred_live_abc123" },
      { id: "4", key: "apiKey", value: "sk-live-xyz" },
      { id: "5", key: "secretKey", value: "aws-secret" },
      { id: "6", key: "nextToken", value: "page-2" },
    ]

    const out = outExplorerNodes(http)
    const children = out[0]?.children ?? []

    const status = children.find((c) => c.label === "status")
    expect(status?.icon).toBe("variable")
    expect(status?.hint).toBe("{{HTTP Request.status}}")

    const token = children.find((c) => c.label === "token")
    expect(token?.icon).toBe("secret")
    expect(token?.hint).toBe("{{HTTP Request.token}}")
    expect(token?.hint).not.toContain("super-secret-token")

    const cred = children.find((c) => c.label === "credentialId")
    expect(cred?.icon).toBe("variable")
    expect(cred?.hint).toBe("{{HTTP Request.credentialId}}")

    const apiKey = children.find((c) => c.label === "apiKey")
    expect(apiKey?.icon).toBe("secret")
    expect(apiKey?.hint).toBe("{{HTTP Request.apiKey}}")

    const secretKey = children.find((c) => c.label === "secretKey")
    expect(secretKey?.icon).toBe("secret")
    expect(secretKey?.hint).toBe("{{HTTP Request.secretKey}}")

    const nextToken = children.find((c) => c.label === "nextToken")
    expect(nextToken?.icon).toBe("variable")
    expect(nextToken?.hint).toBe("{{HTTP Request.nextToken}}")

    const slack = createVantegNode("slack", { x: 80, y: 0 })
    const inbound = inExplorerNodes(slack.id, [http, slack], [
      { id: "e1", source: http.id, target: slack.id },
    ])
    const inToken = inbound[0]?.children?.find((c) => c.label === "token")
    expect(inToken?.icon).toBe("secret")
    expect(inToken?.hint).toBe("{{HTTP Request.token}}")
  })
})
