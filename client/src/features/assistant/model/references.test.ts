import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAgents, saveAgent } from "@/features/agents/model/store"
import { resetDataStore, updateTableRows } from "@/features/data/model/store"
import type { DatabaseRow } from "@/features/data/model/types"
import {
  connectConnector,
  resetIntegrationsStore,
} from "@/features/integrations/model/store"
import {
  createMemory,
  resetMemoryStore,
} from "@/features/memory/model/store"
import { resetTeams } from "@/features/teams/model/store"
import {
  createDraft,
  resetWorkflows,
  saveWorkflow,
} from "@/features/workflows/model/store"

import {
  referenceKey,
  useAssistantReferenceCatalog,
} from "./references"
import type { AssistantReference } from "./types"

describe("referenceKey", () => {
  it("uses kind:id as the duplicate key", () => {
    expect(
      referenceKey({ kind: "agent", id: "agent-support" })
    ).toBe("agent:agent-support")
    expect(
      referenceKey({ kind: "table", id: "table-users" })
    ).toBe("table:table-users")
  })
})

describe("useAssistantReferenceCatalog", () => {
  beforeEach(() => {
    resetAgents()
    resetTeams()
    resetWorkflows()
    resetDataStore()
    resetMemoryStore()
    resetIntegrationsStore()
  })

  function catalog(): AssistantReference[] {
    const { result } = renderHook(() => useAssistantReferenceCatalog())
    return result.current
  }

  it("includes every requested catalog group", async () => {
    act(() => {
      createDraft()
    })
    await act(async () => {
      await connectConnector("google-sheets")
    })

    const refs = catalog()
    const kinds = new Set(refs.map((ref) => ref.kind))

    expect(kinds).toEqual(
      new Set([
        "agent",
        "team",
        "workflow",
        "table",
        "variable-group",
        "memory",
        "knowledge",
        "connector",
      ])
    )
    expect(refs.some((ref) => ref.kind === "agent" && ref.id === "agent-support")).toBe(
      true
    )
    expect(refs.some((ref) => ref.kind === "team" && ref.id === "team-swe")).toBe(true)
    expect(refs.some((ref) => ref.kind === "table" && ref.id === "table-users")).toBe(
      true
    )
    expect(
      refs.some((ref) => ref.kind === "variable-group" && ref.id === "vars-global")
    ).toBe(true)
    expect(refs.some((ref) => ref.kind === "memory" && ref.id === "base-workspace")).toBe(
      true
    )
    expect(refs.some((ref) => ref.kind === "knowledge" && ref.id === "kb-product")).toBe(
      true
    )
    expect(refs.some((ref) => ref.kind === "connector")).toBe(true)
  })

  it("keeps catalog keys unique by kind:id", async () => {
    act(() => {
      createDraft()
    })
    await act(async () => {
      await connectConnector("google-sheets")
    })

    const refs = catalog()
    const keys = refs.map(referenceKey)
    expect(keys).toEqual([...new Set(keys)])
  })

  it("returns icon-free records with agent instructions and team members", () => {
    const refs = catalog()
    const agent = refs.find(
      (ref) => ref.kind === "agent" && ref.id === "agent-support"
    )
    const team = refs.find((ref) => ref.kind === "team" && ref.id === "team-swe")

    expect(agent).toMatchObject({
      kind: "agent",
      id: "agent-support",
      label: "Support copilot",
    })
    expect(agent).not.toHaveProperty("icon")
    expect(agent?.context).toContain("Be concise and kind")
    expect(team?.context).toMatch(/Lead SWE agent|Lead SWE/i)
    expect(team?.context).toMatch(/Senior SWE/i)
  })

  it("includes workflow status and steps", () => {
    let workflowId = ""
    act(() => {
      const draft = createDraft()
      workflowId = draft.id
      saveWorkflow(draft.id, { name: "Onboard user", status: "dev" })
    })

    const workflow = catalog().find(
      (ref) => ref.kind === "workflow" && ref.id === workflowId
    )
    expect(workflow?.label).toBe("Onboard user")
    expect(workflow?.context).toMatch(/dev/i)
    expect(workflow?.context.length).toBeGreaterThan(0)
  })

  it("includes table schema, columns, and at most 20 rows", () => {
    const extraRows: DatabaseRow[] = Array.from({ length: 25 }, (_, index) => ({
      id: `user-extra-${index}`,
      name: `User ${index}`,
      email: `user${index}@vanteg.dev`,
      role: "member",
      active: true,
      createdAt: "2026-03-01T12:00:00.000Z",
      updatedAt: "2026-04-01T12:00:00.000Z",
    }))

    act(() => {
      updateTableRows("table-users", [
        {
          id: "user-ada",
          name: "Ada Lovelace",
          email: "ada@vanteg.dev",
          role: "admin",
          active: true,
          createdAt: "2026-03-01T12:00:00.000Z",
          updatedAt: "2026-04-01T12:00:00.000Z",
        },
        ...extraRows,
      ])
    })

    const table = catalog().find(
      (ref) => ref.kind === "table" && ref.id === "table-users"
    )
    expect(table?.context).toMatch(/Name|Email|Role/i)
    expect(table?.context).toContain("Ada Lovelace")
    const rowMentions = (table?.context.match(/user-extra-|User \d+/g) ?? []).length
    expect(rowMentions).toBeLessThanOrEqual(40)
    expect(table?.context).not.toContain("User 24")
  })

  it("includes non-secret variables and omits secret groups and credential fields", async () => {
    await act(async () => {
      await connectConnector("stripe", { apiKey: "sk_test_vanteg_secret" })
    })

    const refs = catalog()
    const serialized = JSON.stringify(refs)

    expect(
      refs.some((ref) => ref.kind === "variable-group" && ref.context.includes("APP_NAME"))
    ).toBe(true)
    expect(refs.some((ref) => ref.id.startsWith("secrets-"))).toBe(false)
    expect(serialized).not.toContain("JWT_SECRET")
    expect(serialized).not.toContain("dev-jwt-secret")
    expect(serialized).not.toContain("STRIPE_SECRET_KEY")
    expect(serialized).not.toContain("sk_test_vanteg")
    expect(serialized).not.toContain("XAI_API_KEY")
    expect(serialized).not.toContain("sk_test_vanteg_secret")
    expect(serialized).not.toMatch(/"apiKey"/)
  })

  it("includes bounded memory entries and knowledge document content", () => {
    act(() => {
      createMemory("Refunds under $50 can be approved without escalation.")
    })

    const refs = catalog()
    const memory = refs.find(
      (ref) => ref.kind === "memory" && ref.id === "base-workspace"
    )
    const knowledge = refs.find(
      (ref) => ref.kind === "knowledge" && ref.id === "kb-product"
    )

    expect(memory?.context).toMatch(/Darren is the workspace owner/i)
    expect(knowledge?.context).toMatch(/vanteg-overview\.md/i)
    expect(knowledge?.context).toMatch(/Vanteg is a workspace/i)
  })

  it("caps each context at 8000 characters", () => {
    const huge = "x".repeat(12_000)
    act(() => {
      saveAgent("agent-support", { instructions: huge })
      createMemory(huge)
    })

    const refs = catalog()
    for (const ref of refs) {
      expect(ref.context.length).toBeLessThanOrEqual(8_000)
    }
  })

  it("includes configured connector identity and non-secret sheet data", async () => {
    await act(async () => {
      await connectConnector("google-sheets")
    })

    const connector = catalog().find((ref) => ref.kind === "connector")
    expect(connector?.label.length).toBeGreaterThan(0)
    expect(connector?.context).toMatch(/google-sheets|Google Sheets/i)
    expect(connector?.context).not.toMatch(/clientSecret|accessToken|refreshToken/i)
  })
})
