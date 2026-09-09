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
})
