import { describe, expect, it } from "vitest"

import { parseChatRequestBody } from "./request"

const userMessage = {
  id: "1",
  role: "user",
  parts: [{ type: "text", text: "Hello" }],
}

describe("parseChatRequestBody", () => {
  it("defaults model, access, and effort when omitted", () => {
    const parsed = parseChatRequestBody({ messages: [userMessage] })
    expect(parsed).toEqual({
      ok: true,
      value: {
        messages: [userMessage],
        context: undefined,
        model: "grok-4.6",
        access: "supervised",
        effort: "medium",
        references: [],
      },
    })
  })

  it("rejects unknown models, non-xAI providers, and malformed options", () => {
    expect(parseChatRequestBody({ model: "mystery-1" }).ok).toBe(false)
    expect(parseChatRequestBody({ model: "gpt-6-astra" })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/Grok/i),
    })
    expect(parseChatRequestBody({ access: "root" })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/access must be/i),
    })
    expect(parseChatRequestBody({ effort: "max" })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/effort must be/i),
    })
    expect(parseChatRequestBody("nope")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/JSON object/i),
    })
  })

  it("rejects malformed messages without dropping valid file and text parts", () => {
    expect(parseChatRequestBody({ messages: [null] })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/messages\[0\]/i),
    })
    expect(
      parseChatRequestBody({
        messages: [{ id: "1", role: "user" }],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/parts must be an array/i),
    })
    expect(
      parseChatRequestBody({
        messages: [{ id: "1", role: "user", parts: [null] }],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/parts\[0\]/i),
    })

    const withFile = parseChatRequestBody({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [
            { type: "text", text: "look at this" },
            {
              type: "file",
              url: "data:text/plain,hello",
              mediaType: "text/plain",
              filename: "brief.txt",
            },
          ],
        },
      ],
    })
    expect(withFile.ok).toBe(true)
    if (withFile.ok) {
      expect(withFile.value.messages[0]?.parts).toHaveLength(2)
    }
  })

  it("accepts grok-4.5 with explicit access and effort", () => {
    const parsed = parseChatRequestBody({
      messages: [userMessage],
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })
    expect(parsed).toMatchObject({
      ok: true,
      value: {
        model: "grok-4.5",
        access: "read-only",
        effort: "high",
      },
    })
  })

  it("defaults references to an empty array when omitted", () => {
    const parsed = parseChatRequestBody({ messages: [userMessage] })
    expect(parsed).toMatchObject({
      ok: true,
      value: { references: [] },
    })
  })

  it("reads assistantReferences when the SDK also sends an empty references array", () => {
    const parsed = parseChatRequestBody({
      messages: [userMessage],
      references: [],
      assistantReferences: [
        {
          kind: "agent",
          id: "agent-1",
          label: "Research Agent",
          context: "Instructions: Prefer cited sources.",
        },
      ],
    })
    expect(parsed).toMatchObject({
      ok: true,
      value: {
        references: [
          {
            kind: "agent",
            id: "agent-1",
            label: "Research Agent",
            context: "Instructions: Prefer cited sources.",
          },
        ],
      },
    })
  })

  it("accepts valid references and keeps only wire fields", () => {
    const parsed = parseChatRequestBody({
      messages: [userMessage],
      references: [
        {
          kind: "agent",
          id: "agent-1",
          label: "Research Agent",
          description: "Finds answers",
          context: "Instructions: Prefer cited sources.",
        },
        {
          kind: "table",
          id: "table-1",
          label: "Customers",
          context: "Columns: name, email",
        },
      ],
    })
    expect(parsed).toEqual({
      ok: true,
      value: {
        messages: [userMessage],
        context: undefined,
        model: "grok-4.6",
        access: "supervised",
        effort: "medium",
        references: [
          {
            kind: "agent",
            id: "agent-1",
            label: "Research Agent",
            description: "Finds answers",
            context: "Instructions: Prefer cited sources.",
          },
          {
            kind: "table",
            id: "table-1",
            label: "Customers",
            context: "Columns: name, email",
          },
        ],
      },
    })
  })

  it("rejects unknown kinds, malformed entries, and secret-bearing fields", () => {
    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: "nope",
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/references must be an array/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [null],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/references\[0\].*object/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            kind: "secret",
            id: "sec-1",
            label: "Prod secrets",
            context: "value=abc",
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/known reference kind/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            kind: "agent",
            id: "agent-1",
            label: "Research Agent",
            context: "ok",
            secrets: [{ name: "API_KEY", value: "sk-test" }],
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/unsupported fields/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            kind: "agent",
            id: 12,
            label: "Research Agent",
            context: "ok",
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/references\[0\]\.id must be a string/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            kind: "agent",
            id: "agent-1",
            label: "Research Agent",
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/references\[0\]\.context must be a string/i),
    })
  })

  it("rejects more than 12 references and oversized identity or context fields", () => {
    const base = {
      kind: "workflow" as const,
      id: "wf",
      label: "WF",
      context: "status: draft",
    }
    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: Array.from({ length: 13 }, (_, index) => ({
          ...base,
          id: `wf-${index}`,
        })),
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/at most 12 references/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            ...base,
            id: "x".repeat(201),
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/id must be at most 200 characters/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            ...base,
            label: "y".repeat(201),
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/label must be at most 200 characters/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            ...base,
            description: "z".repeat(201),
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/description must be at most 200 characters/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            ...base,
            context: "c".repeat(8001),
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/context must be at most 8000 characters/i),
    })

    expect(
      parseChatRequestBody({
        messages: [userMessage],
        references: [
          {
            kind: "agent",
            id: "a1",
            label: "A1",
            context: "a".repeat(8000),
          },
          {
            kind: "agent",
            id: "a2",
            label: "A2",
            context: "b".repeat(8000),
          },
          {
            kind: "agent",
            id: "a3",
            label: "A3",
            context: "c".repeat(8000),
          },
          {
            kind: "agent",
            id: "a4",
            label: "A4",
            context: "d".repeat(8000),
          },
          {
            kind: "agent",
            id: "a5",
            label: "A5",
            context: "e".repeat(1),
          },
        ],
      })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/32000 character/i),
    })
  })
})
