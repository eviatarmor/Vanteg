import { beforeEach, describe, expect, it } from "vitest"

import { resetAgents } from "@/features/agents/model/store"
import { resetInbox } from "@/features/inbox/model/store"

import { createVantegNode } from "@/features/workflows/model/create-node"
import type { Workflow } from "@/features/workflows/model/types"

import { searchWorkspace } from "./search"

function workflow(
  name: string,
  status: Workflow["status"] = "draft",
  updatedAt = 1
): Workflow {
  return {
    id: `wf-${name}`,
    name,
    status,
    nodes: [createVantegNode("manual", { x: 0, y: 0 })],
    edges: [],
    updatedAt,
  }
}

describe("searchWorkspace", () => {
  beforeEach(() => {
    resetInbox()
    resetAgents()
  })

  it("finds workflows by name and step label", () => {
    const named = searchWorkspace("intake", [workflow("Form intake")])
    const stepped = searchWorkspace("manual", [workflow("Form intake")])

    expect(named.some((hit) => hit.title === "Form intake")).toBe(true)
    expect(stepped.some((hit) => hit.title === "Form intake")).toBe(true)
  })

  it("finds inbox items", () => {
    const hits = searchWorkspace("credential", [])

    expect(hits.some((hit) => hit.group === "Inbox" && /credential/i.test(hit.title))).toBe(
      true
    )
  })

  it("finds data and integration tabs", () => {
    const hits = searchWorkspace("api", [])

    expect(hits.some((hit) => hit.title === "API Keys")).toBe(true)
    expect(hits.find((hit) => hit.title === "API Keys")?.path).toBe("/api-keys")
  })

  it("finds memory bases and agents", () => {
    const memoryHits = searchWorkspace("workspace", [])
    const agentHits = searchWorkspace("copilot", [])

    expect(memoryHits.some((hit) => hit.group === "Memory" && hit.title === "Workspace")).toBe(
      true
    )
    expect(agentHits.some((hit) => hit.title === "Support copilot")).toBe(true)
  })

  it("finds teams", () => {
    const hits = searchWorkspace("software", [])
    expect(hits.some((hit) => hit.group === "Teams" && hit.title === "Software engineering")).toBe(
      true
    )
  })

  it("finds pages", () => {
    const hits = searchWorkspace("inbox", [])

    expect(hits.some((hit) => hit.title === "Inbox" && hit.group === "Pages")).toBe(true)
  })

  it("filters action list by create and jump queries", () => {
    const createHits = searchWorkspace("create workflow", [])
    const agentHits = searchWorkspace("create agent", [])
    const teamHits = searchWorkspace("create team", [])
    const integrations = searchWorkspace("integrations", [])
    const templates = searchWorkspace("templates", [])
    const assistant = searchWorkspace("assistant", [])
    const settings = searchWorkspace("settings", [])
    const data = searchWorkspace("jump to data", [])

    expect(createHits.some((hit) => hit.command === "create-workflow")).toBe(true)
    expect(agentHits.some((hit) => hit.command === "create-agent")).toBe(true)
    expect(teamHits.some((hit) => hit.command === "create-team")).toBe(true)
    expect(integrations.some((hit) => hit.path === "/integrations")).toBe(true)
    expect(templates.some((hit) => hit.path === "/templates")).toBe(true)
    expect(
      searchWorkspace("templates", []).filter(
        (hit) => hit.group === "Pages" && hit.path === "/templates"
      )
    ).toHaveLength(1)
    expect(assistant.some((hit) => hit.command === "open-assistant")).toBe(true)
    expect(settings.some((hit) => hit.path === "/settings")).toBe(true)
    expect(data.some((hit) => hit.title === "Go to Data" && hit.path === "/data")).toBe(true)
  })

  it("returns actions, recent items, pages, and inbox when the query is empty", () => {
    const hits = searchWorkspace("", [
      workflow("Older workflow", "draft", 1),
      workflow("Newer workflow", "draft", 10),
    ])

    expect(hits.some((hit) => hit.group === "Actions" && hit.command === "create-workflow")).toBe(
      true
    )
    expect(hits.some((hit) => hit.group === "Pages")).toBe(true)
    expect(hits.some((hit) => hit.group === "Inbox")).toBe(true)
    expect(hits.some((hit) => hit.title === "Newer workflow")).toBe(true)
    expect(hits.some((hit) => hit.group === "Agents")).toBe(true)
    expect(hits.every((hit) => hit.group !== "Data")).toBe(true)

    const recentWorkflows = hits.filter((hit) => hit.group === "Workflows")
    expect(recentWorkflows[0]?.title).toBe("Newer workflow")
  })
})
