import { describe, expect, it } from "vitest"

import { agentCapabilities, isAgentCapabilityId } from "./capabilities"

describe("agent capabilities", () => {
  it("ships a stable set of tool chips", () => {
    expect(agentCapabilities.map((item) => item.id)).toEqual([
      "web_search",
      "code_interpreter",
      "file_retrieval",
      "memory_write",
      "browser",
      "image_gen",
    ])
    for (const capability of agentCapabilities) {
      expect(capability.label.length).toBeGreaterThan(0)
      expect(capability.description.length).toBeGreaterThan(0)
    }
  })

  it("narrows capability ids", () => {
    expect(isAgentCapabilityId("web_search")).toBe(true)
    expect(isAgentCapabilityId("unknown")).toBe(false)
  })
})
