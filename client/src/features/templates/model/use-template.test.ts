import { beforeEach, describe, expect, it } from "vitest"

import { getAgent, resetAgents } from "@/features/agents/model/store"
import { getTeam, resetTeams } from "@/features/teams/model/store"
import { getWorkflow, resetWorkflows } from "@/features/workflows/model/store"

import { getSubTemplate } from "./catalog"
import { clearRecentTemplateIds, readRecentTemplateIds } from "./recent"
import { useTemplate } from "./use-template"

describe("useTemplate", () => {
  beforeEach(() => {
    resetAgents()
    resetWorkflows()
    resetTeams()
    clearRecentTemplateIds()
  })

  it("creates an agent stub and routes to /agents/:id", () => {
    const template = getSubTemplate("legal-quote-assistant")!
    const result = useTemplate(template)

    expect(result.kind).toBe("assistant")
    expect(result.path).toBe(`/agents/${result.id}`)
    const agent = getAgent(result.id)
    expect(agent?.name).toBe(template.title)
    expect(agent?.description).toBe(template.description)
    expect(agent?.instructions).toContain("engagement")
    expect(readRecentTemplateIds()).toContain(template.id)
  })

  it("creates a draft workflow graph and routes to the editor", () => {
    const template = getSubTemplate("legal-onboard-workflow")!
    const result = useTemplate(template)

    expect(result.kind).toBe("workflow")
    expect(result.path).toBe(`/workflows/${result.id}`)
    const workflow = getWorkflow(result.id)
    expect(workflow?.name).toBe(template.title)
    expect(workflow?.status).toBe("draft")
    expect(workflow?.nodes.length).toBeGreaterThanOrEqual(2)
    expect(workflow?.edges.length).toBe(workflow!.nodes.length - 1)
  })

  it("creates a team stub and routes to /teams/:id", () => {
    const template = getSubTemplate("legal-intake-team")!
    const result = useTemplate(template)

    expect(result.kind).toBe("team")
    expect(result.path).toBe(`/teams/${result.id}`)
    const team = getTeam(result.id)
    expect(team?.name).toBe(template.title)
    expect(team?.description).toBe(template.description)
  })
})
