import { describe, expect, it } from "vitest"

import { createFreezeNode } from "./create-node"
import { mapUpstreamOutputs } from "./node-io"

describe("node in/out", () => {
  it("gives webhook nodes output variables and slack nodes input variables", () => {
    const webhook = createFreezeNode("webhook", { x: 0, y: 0 })
    const slack = createFreezeNode("slack", { x: 80, y: 0 })

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
    const webhook = createFreezeNode("webhook", { x: 0, y: 0 })
    const slack = createFreezeNode("slack", { x: 80, y: 0 })
    const wired = mapUpstreamOutputs(webhook, slack)

    expect(wired.inVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["body", "channel", "message"])
    )
    expect(wired.inVars.find((item) => item.key === "body")?.value).toBe(
      "{{Webhook.body}}"
    )
  })
})
