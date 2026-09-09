import { beforeEach, describe, expect, it } from "vitest"

import {
  createAgent,
  deleteAgent,
  getAgent,
  getAgentSnapshot,
  resetAgents,
  saveAgent,
  toggleAgentAssignment,
} from "./store"

describe("agent store", () => {
  beforeEach(() => {
    resetAgents()
  })

  it("seeds agents that share memory bases", () => {
    const support = getAgentSnapshot().find((agent) => agent.id === "agent-support")
    expect(support?.memoryBaseIds).toContain("base-support")
    expect(support?.knowledgeBaseIds).toContain("kb-product")
    expect(support?.capabilityIds).toContain("web_search")
  })

  it("creates an agent with workspace memory by default", () => {
    const agent = createAgent("Ops")
    expect(agent.name).toBe("Ops")
    expect(agent.memoryBaseIds).toEqual(["base-workspace"])
    expect(agent.capabilityIds).toContain("file_retrieval")
  })

  it("toggles assigned knowledge bases", () => {
    toggleAgentAssignment("agent-research", "knowledgeBaseIds", "kb-policies", true)
    expect(getAgent("agent-research")?.knowledgeBaseIds).toContain("kb-policies")
    toggleAgentAssignment("agent-research", "knowledgeBaseIds", "kb-policies", false)
    expect(getAgent("agent-research")?.knowledgeBaseIds).not.toContain("kb-policies")
  })

  it("saves capability chips and deletes agents", () => {
    saveAgent("agent-research", {
      capabilityIds: ["web_search", "browser", "image_gen"],
    })
    expect(getAgent("agent-research")?.capabilityIds).toEqual([
      "web_search",
      "browser",
      "image_gen",
    ])

    expect(deleteAgent("agent-research")).toBe(true)
    expect(getAgent("agent-research")).toBeUndefined()
    expect(deleteAgent("agent-research")).toBe(false)
  })
})
