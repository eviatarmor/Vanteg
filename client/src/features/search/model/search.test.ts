import { beforeEach, describe, expect, it } from "vitest"

import { resetInbox } from "@/features/inbox/model/store"

import { createVantegNode } from "@/features/workflows/model/create-node"
import type { Workflow } from "@/features/workflows/model/types"

import { searchWorkspace } from "./search"

function workflow(name: string, status: Workflow["status"] = "draft"): Workflow {
  return {
    id: "wf-1",
    name,
    status,
    nodes: [createVantegNode("manual", { x: 0, y: 0 })],
    edges: [],
    updatedAt: 1,
  }
}

describe("searchWorkspace", () => {
  beforeEach(() => {
    resetInbox()
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

  it("returns pages, inbox, and a short workflow list when the query is empty", () => {
    const hits = searchWorkspace("", [workflow("Untitled workflow")])

    expect(hits.some((hit) => hit.group === "Pages")).toBe(true)
    expect(hits.some((hit) => hit.group === "Inbox")).toBe(true)
    expect(hits.some((hit) => hit.title === "Untitled workflow")).toBe(true)
    expect(hits.every((hit) => hit.group !== "Data")).toBe(true)
  })
})
