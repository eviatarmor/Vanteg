import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AssistantMessageParts } from "./AssistantMessageParts"

describe("AssistantMessageParts", () => {
  it("renders the named AI Elements from representative parts", () => {
    render(
      <AssistantMessageParts
        parts={[
          {
            type: "chain-of-thought",
            steps: [
              { label: "Search docs", status: "complete" },
              { label: "Draft answer", status: "active" },
            ],
          },
          { type: "checkpoint", label: "Restore checkpoint" },
          {
            type: "confirmation",
            request: "Delete /tmp/example.txt?",
            state: "approval-requested",
            approval: { id: "approval-1" },
          },
          {
            type: "context",
            usedTokens: 1200,
            maxTokens: 8000,
            modelId: "grok-4.6",
          },
          {
            type: "inline-citation",
            text: "Vanteg workflows",
            sources: ["https://docs.vanteg.app/workflows"],
          },
          {
            type: "plan",
            title: "Ship the connector",
            description: "Connect Google then test.",
            content: "1. OAuth 2. Add a step",
          },
          { type: "reasoning", text: "The user asked about connectors." },
          {
            type: "sources",
            sources: [
              { href: "https://docs.vanteg.app", title: "Vanteg docs" },
              { href: "https://ai-sdk.dev", title: "AI SDK" },
            ],
          },
          {
            type: "task",
            title: "Inspect workflow",
            items: ["Check trigger", "Check action"],
          },
          {
            type: "tool",
            name: "list_tables",
            state: "output-available",
            input: { schema: "public" },
            output: { tables: ["users"] },
          },
        ]}
      />
    )

    expect(screen.getByText("Chain of Thought")).toBeInTheDocument()
    expect(screen.getByText("Search docs")).toBeInTheDocument()
    expect(screen.getByText("Restore checkpoint")).toBeInTheDocument()
    expect(screen.getByText("Delete /tmp/example.txt?")).toBeInTheDocument()
    expect(
      screen.getByRole("img", { name: "Model context usage" })
    ).toBeInTheDocument()
    expect(screen.getByText("Vanteg workflows")).toBeInTheDocument()
    expect(screen.getByText("Ship the connector")).toBeInTheDocument()
    expect(
      screen.getByText("The user asked about connectors.")
    ).toBeInTheDocument()
    expect(screen.getByText("Used 2 sources")).toBeInTheDocument()
    expect(screen.getByText("Inspect workflow")).toBeInTheDocument()
    expect(screen.getByText("list_tables")).toBeInTheDocument()
  })
})
