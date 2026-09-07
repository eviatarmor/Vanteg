import { beforeEach, describe, expect, it } from "vitest"

import {
  createAgent,
  getAgent,
  getAgentSnapshot,
  resetAgents,
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
  })

  it("creates an agent with workspace memory by default", () => {
    const agent = createAgent("Ops")
    expect(agent.name).toBe("Ops")
    expect(agent.memoryBaseIds).toEqual(["base-workspace"])
  })

  it("toggles assigned knowledge bases", () => {
    toggleAgentAssignment("agent-research", "knowledgeBaseIds", "kb-policies", true)
    expect(getAgent("agent-research")?.knowledgeBaseIds).toContain("kb-policies")
    toggleAgentAssignment("agent-research", "knowledgeBaseIds", "kb-policies", false)
    expect(getAgent("agent-research")?.knowledgeBaseIds).not.toContain("kb-policies")
  })
})
