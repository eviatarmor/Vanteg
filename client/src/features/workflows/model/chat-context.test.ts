import { describe, expect, it } from "vitest"

import { buildSystemPrompt } from "@/features/assistant/model/chat-context"

import { toChatContext } from "./chat-context"
import { createDraft, resetWorkflows } from "./store"

describe("chat context", () => {
  it("summarizes workflow steps for the assistant", () => {
    resetWorkflows()
    const workflow = createDraft()
    const context = toChatContext(workflow)

    expect(context.name).toBe("Untitled workflow")
    expect(context.steps[0]?.catalogId).toBe("manual")
    expect(
      buildSystemPrompt({
        path: `/workflows/${workflow.id}`,
        pageTitle: "Workflows",
        workflow: context,
      })
    ).toContain("Manual")
    expect(
      buildSystemPrompt({
        path: `/workflows/${workflow.id}`,
        pageTitle: "Workflows",
        workflow: context,
      })
    ).toContain("Vanteg")
  })

  it("appends clearly delimited referenced context with kind and label", () => {
    const prompt = buildSystemPrompt(
      {
        path: "/agents",
        pageTitle: "Agents",
      },
      "supervised",
      [
        {
          kind: "agent",
          id: "agent-1",
          label: "Research Agent",
          context: "Instructions: Prefer cited sources.",
        },
        {
          kind: "table",
          id: "table-1",
          label: "Customers",
          context: "Columns: name, email\nSample rows: Ada, ada@example.com",
        },
      ]
    )

    expect(prompt).toContain("Referenced context")
    expect(prompt).toMatch(/<<<\s*agent:\s*Research Agent\s*>>>/)
    expect(prompt).toContain("Instructions: Prefer cited sources.")
    expect(prompt).toMatch(/<<<\s*table:\s*Customers\s*>>>/)
    expect(prompt).toContain("Columns: name, email")
  })

  it("omits the referenced-context section when there are no references", () => {
    const prompt = buildSystemPrompt(
      { path: "/", pageTitle: "Home" },
      "supervised",
      []
    )
    expect(prompt).not.toContain("Referenced context")
  })
})
