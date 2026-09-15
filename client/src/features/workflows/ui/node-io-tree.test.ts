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
    expect(body?.icon).toBe("folder")
    expect(body?.hint).toBe("object")
    expect(body?.children?.find((child) => child.label === "id")?.hint).toBe("string")
    expect(body?.children?.find((child) => child.label === "data")?.hint).toBe("object")
    const method = tree[0]?.children?.find((child) => child.label === "method")
    expect(method?.icon).toBe("variable")
    expect(method?.hint).toBe("string")
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
    expect(body?.icon).toBe("folder")
    expect(body?.hint).toBe("object")
  })

  it("labels payload as an object and rss items as an array", () => {
    const manual = createVantegNode("manual", { x: 0, y: 0 })
    const payload = outExplorerNodes(manual)[0]?.children?.find(
      (child) => child.label === "payload"
    )
    expect(payload?.hint).toBe("object")
    expect(payload?.icon).toBe("folder")
    expect(payload?.children?.map((child) => child.label)).toEqual(["id", "data"])
    expect(payload?.children?.find((child) => child.label === "id")?.hint).toBe("string")
    expect(payload?.children?.find((child) => child.label === "data")?.hint).toBe("object")

    const rss = createVantegNode("rss", { x: 0, y: 0 })
    const items = outExplorerNodes(rss)[0]?.children?.find((child) => child.label === "items")
    expect(items?.hint).toBe("array")
    expect(items?.icon).toBe("folder")
    expect(items?.children?.[0]?.label).toBe("item")
    expect(items?.children?.[0]?.hint).toBe("object")
  })

  it("masks secret leaves with secret icon and leaves non-secrets unchanged", () => {
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
    expect(status?.hint).toBe("number")

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

    const secretKey = children.find((c) => c.label === "secretKey")
    expect(secretKey?.icon).toBe("secret")
    expect(secretKey?.hint).toBe(maskSecretLast("aws-secret"))

    const nextToken = children.find((c) => c.label === "nextToken")
    expect(nextToken?.icon).toBe("variable")
    expect(nextToken?.hint).toBe("string")

    const slack = createVantegNode("slack", { x: 80, y: 0 })
    const inbound = inExplorerNodes(slack.id, [http, slack], [
      { id: "e1", source: http.id, target: slack.id },
    ])
    const inToken = inbound[0]?.children?.find((c) => c.label === "token")
    expect(inToken?.icon).toBe("secret")
    expect(inToken?.hint).toBe(maskSecretLast("super-secret-token"))

    http.data.outVars = [
      { id: "5", key: "token", value: '{{HTTP Request.token}}', secret: true },
    ]
    const maskedPath = outExplorerNodes(http)[0]?.children?.find((c) => c.label === "token")
    expect(maskedPath?.hint).toBe(SECRET_MASK)
  })
})
