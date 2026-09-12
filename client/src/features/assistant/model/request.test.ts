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
})
