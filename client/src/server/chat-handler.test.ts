import { beforeEach, describe, expect, it, vi } from "vitest"

type StreamTextCall = {
  model: { modelId: string }
  system: string
  providerOptions?: { xai: { reasoningEffort: string } }
}

const streamTextMock = vi.hoisted(() =>
  vi.fn((options: StreamTextCall) => ({
    stream: new ReadableStream({
      start(controller) {
        controller.close()
      },
    }),
    modelId: options.model.modelId,
  }))
)

const toUIMessageStreamMock = vi.hoisted(() =>
  vi.fn(
    () =>
      new ReadableStream({
        start(controller) {
          controller.close()
        },
      })
  )
)

const createXaiMock = vi.hoisted(() => vi.fn())

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>()
  return {
    ...actual,
    streamText: streamTextMock,
    toUIMessageStream: toUIMessageStreamMock,
  }
})

vi.mock("@ai-sdk/xai", () => ({
  createXai: (options: { apiKey?: string }) => {
    createXaiMock(options)
    return (modelId: string) => ({ modelId })
  },
}))

import { handleChatRequest, localAssistantReply } from "./chat-handler"

function chatRequest(body: unknown) {
  return new Request("http://vanteg.local/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("chat handler", () => {
  beforeEach(() => {
    streamTextMock.mockClear()
    toUIMessageStreamMock.mockClear()
    createXaiMock.mockClear()
  })

  it("describes the workflow when no API key is set", async () => {
    const request = chatRequest({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "Explain this workflow" }],
        },
      ],
      workflow: {
        id: "wf-1",
        name: "Lead alerts",
        steps: [{ label: "Manual", catalogId: "manual" }],
      },
    })

    const response = await handleChatRequest(request)
    const text = await response.text()

    expect(response.headers.get("content-type")).toContain("text/event-stream")
    expect(text).toContain("Lead alerts")
    expect(text).toContain("Manual")
    expect(streamTextMock).not.toHaveBeenCalled()
  })

  it("suggests a next step from the local reply", () => {
    expect(
      localAssistantReply("Suggest the next step", {
        path: "/workflows/wf-1",
        pageTitle: "Workflows",
        workflow: {
          id: "wf-1",
          name: "Lead alerts",
          steps: [{ label: "Webhook", catalogId: "webhook" }],
        },
      })
    ).toContain("HTTP Request")
  })

  it("rejects malformed JSON and invalid options with 400", async () => {
    const invalidJson = new Request("http://vanteg.local/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    })
    const invalidJsonResponse = await handleChatRequest(invalidJson)
    expect(invalidJsonResponse.status).toBe(400)
    expect(await invalidJsonResponse.text()).toMatch(/JSON/i)

    const unknownModel = await handleChatRequest(
      chatRequest({ model: "mystery-1", messages: [] })
    )
    expect(unknownModel.status).toBe(400)
    expect(await unknownModel.text()).toMatch(/unknown model/i)

    const openai = await handleChatRequest(
      chatRequest({ model: "gpt-6-astra", messages: [] })
    )
    expect(openai.status).toBe(400)
    expect(await openai.text()).toMatch(/Grok/i)

    const badAccess = await handleChatRequest(
      chatRequest({ access: "root", messages: [] })
    )
    expect(badAccess.status).toBe(400)

    const badEffort = await handleChatRequest(
      chatRequest({ effort: "max", messages: [] })
    )
    expect(badEffort.status).toBe(400)

    const badMessage = await handleChatRequest(
      chatRequest({ messages: [null] })
    )
    expect(badMessage.status).toBe(400)
    expect(await badMessage.text()).toMatch(/messages\[0\]/i)
  })

  it("passes the selected xAI model, effort, and access prompt to the provider", async () => {
    const request = chatRequest({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "Summarize this page" }],
        },
      ],
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
      context: { path: "/", pageTitle: "Home" },
    })

    const response = await handleChatRequest(request, { apiKey: "test-key" })
    expect(response.status).toBe(200)
    expect(createXaiMock).toHaveBeenCalledWith({ apiKey: "test-key" })
    expect(streamTextMock).toHaveBeenCalledTimes(1)
    expect(streamTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: { modelId: "grok-4.5" },
        providerOptions: { xai: { reasoningEffort: "high" } },
        system: expect.stringMatching(/read only/i),
      })
    )
    const streamed = streamTextMock.mock.calls[0]?.[0]
    expect(streamed?.system).not.toMatch(/tool approval|enforced/i)
  })
})
