import { describe, expect, it } from "vitest"

import { createVantegNode } from "./create-node"
import {
  defaultNodeIo,
  isSecretIoKey,
  isSecretNodeVar,
  mapUpstreamOutputs,
  sanitizeIoVarValue,
} from "./node-io"

describe("node in/out", () => {
  it("gives webhook nodes output variables and slack nodes input variables", () => {
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    const slack = createVantegNode("slack", { x: 80, y: 0 })

    expect(webhook.data.inVars).toEqual([])
    expect(webhook.data.outVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["body", "method", "path"])
    )
    expect(slack.data.inVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["channel", "message"])
    )
    expect(slack.data.outVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["ts", "ok"])
    )
  })

  it("maps upstream out keys onto the next node's in variables", () => {
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    const slack = createVantegNode("slack", { x: 80, y: 0 })
    const wired = mapUpstreamOutputs(webhook, slack)

    expect(wired.inVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["body", "channel", "message"])
    )
    expect(wired.inVars.find((item) => item.key === "body")?.value).toBe(
      "{{Webhook.body}}"
    )
  })

  it("tags secret-sensitive keys and never pastes live tokens into defaults", () => {
    expect(isSecretIoKey("token")).toBe(true)
    expect(isSecretIoKey("apiKey")).toBe(true)
    expect(isSecretIoKey("clientSecret")).toBe(true)
    expect(isSecretIoKey("Authorization")).toBe(true)
    expect(isSecretIoKey("password")).toBe(true)
    expect(isSecretIoKey("secretKey")).toBe(true)
    expect(isSecretIoKey("awsSecretKey")).toBe(true)
    expect(isSecretIoKey("credentialId")).toBe(false)
    expect(isSecretIoKey("channel")).toBe(false)
    expect(isSecretIoKey("body")).toBe(false)
    expect(isSecretIoKey("nextToken")).toBe(false)
    expect(isSecretIoKey("pageToken")).toBe(false)

    expect(sanitizeIoVarValue(true, "sk-live")).toBe("")
    expect(sanitizeIoVarValue(true, "Bearer abc")).toBe("")
    expect(sanitizeIoVarValue(true, "Bearer sk-{{")).toBe("")
    expect(sanitizeIoVarValue(true, "{{HTTP Request.token}}")).toBe("{{HTTP Request.token}}")
    expect(sanitizeIoVarValue(false, "sk-live")).toBe("sk-live")

    const io = defaultNodeIo("http")
    expect(isSecretNodeVar({ key: "token", secret: true })).toBe(true)
    expect(isSecretNodeVar({ key: "status" })).toBe(false)
    expect(isSecretNodeVar({ key: "credentialId" })).toBe(false)

    const source = createVantegNode("http", { x: 0, y: 0 })
    source.data.outVars = [
      ...source.data.outVars,
      { id: "tok", key: "token", value: "", secret: true },
      { id: "cred", key: "credentialId", value: "" },
    ]
    expect(source.data.outVars.find((v) => v.key === "token")?.secret).toBe(true)

    const target = createVantegNode("slack", { x: 80, y: 0 })
    const wired = mapUpstreamOutputs(source, target)
    const tokenIn = wired.inVars.find((item) => item.key === "token")
    expect(tokenIn?.secret).toBe(true)
    expect(tokenIn?.value).toBe("{{HTTP Request.token}}")

    expect(io.outVars.find((item) => item.key === "status")?.secret).toBeUndefined()
  })
})
