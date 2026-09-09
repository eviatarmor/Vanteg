import { describe, expect, it } from "vitest"

import { SECRET_MASK, maskSecretLast } from "@/features/data/model/mask-secret"

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

  it("masks secret leaves with secret icon and leaves non-secrets unchanged", () => {
    const http = createVantegNode("http", { x: 0, y: 0 })
    http.data.outVars = [
      { id: "1", key: "status", value: "200" },
      { id: "2", key: "token", value: "super-secret-token", secret: true },
      { id: "3", key: "credentialId", value: "cred_live_abc123" },
      { id: "4", key: "apiKey", value: "sk-live-xyz" },
    ]

    const out = outExplorerNodes(http)
    const children = out[0]?.children ?? []

    const status = children.find((c) => c.label === "status")
    expect(status?.icon).toBe("variable")
    expect(status?.hint).toBe("{{HTTP Request.status}}")

    const token = children.find((c) => c.label === "token")
    expect(token?.icon).toBe("secret")
    expect(token?.hint).toBe(maskSecretLast("super-secret-token"))
    expect(token?.hint).not.toContain("super-secret-token")

    const cred = children.find((c) => c.label === "credentialId")
    expect(cred?.icon).toBe("secret")
    expect(cred?.hint).toBe(maskSecretLast("cred_live_abc123"))
    expect(cred?.hint).not.toBe("cred_live_abc123")

    const apiKey = children.find((c) => c.label === "apiKey")
    expect(apiKey?.icon).toBe("secret")
    expect(apiKey?.hint).toBe(maskSecretLast("sk-live-xyz"))

    const slack = createVantegNode("slack", { x: 80, y: 0 })
    const inbound = inExplorerNodes(slack.id, [http, slack], [
      { id: "e1", source: http.id, target: slack.id },
    ])
    const inToken = inbound[0]?.children?.find((c) => c.label === "token")
    expect(inToken?.icon).toBe("secret")
    expect(inToken?.hint).toBe(maskSecretLast("super-secret-token"))

    http.data.outVars = [
      { id: "5", key: "token", value: "{{HTTP Request.token}}", secret: true },
    ]
    const maskedPath = outExplorerNodes(http)[0]?.children?.find((c) => c.label === "token")
    expect(maskedPath?.hint).toBe(SECRET_MASK)
  })
})
