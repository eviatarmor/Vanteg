import { describe, expect, it } from "vitest"

import { agentIcons, getAgentIcon } from "./icons"

describe("agent icons", () => {
  it("includes support, research, and engineering marks", () => {
    expect(agentIcons.map((icon) => icon.id)).toEqual(
      expect.arrayContaining(["bot", "headset", "search", "code", "briefcase", "shield"])
    )
    expect(getAgentIcon("headset")?.label).toBe("Support")
    expect(getAgentIcon("missing")?.id).toBe("bot")
  })
})
