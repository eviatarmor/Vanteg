import { createXai } from "@ai-sdk/xai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"

import { buildSystemPrompt } from "../features/assistant/model/chat-context"
import {
  assistantRequestErrorResponse,
  parseChatRequestBody,
} from "../features/assistant/model/request"
import { modelSupportsEffort } from "../features/assistant/model/settings"
import type { AssistantChatContext } from "../features/assistant/model/types"

function lastUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message?.role !== "user") {
      continue
    }
    return message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("")
  }
  return ""
}

export function localAssistantReply(
  prompt: string,
  context?: AssistantChatContext
): string {
  const workflow = context?.workflow
  const page = context?.pageTitle ?? "this page"
  const name = workflow?.name ?? page
  const steps = workflow?.steps ?? []
  const stepSummary =
    steps.length === 0
      ? workflow
        ? "It has no steps yet."
        : `You are on ${page}.`
      : `It has ${steps.length} step${steps.length === 1 ? "" : "s"}: ${steps
          .map((step) => step.label)
          .join(", ")}.`

  if (/next step/i.test(prompt)) {
    return `${name}. ${stepSummary} A solid next step is an action that uses the trigger payload, such as HTTP Request or Send email.`
  }
  if (/missing|connection/i.test(prompt)) {
    return `${name}. ${stepSummary} Check that every action has an incoming connection and that If branches cover both true and false.`
  }
  return `${name}. ${stepSummary} Ask me about this page, a workflow, data, or what to do next.`
}

export async function handleChatRequest(
  request: Request,
  options: { apiKey?: string } = {}
): Promise<Response> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return assistantRequestErrorResponse("Request body must be JSON.")
  }

  const parsed = parseChatRequestBody(raw)
  if (!parsed.ok) {
    return assistantRequestErrorResponse(parsed.error)
  }

  const { messages, context, model, access, effort } = parsed.value
  const system = buildSystemPrompt(context, access)

  if (options.apiKey) {
    const xai = createXai({ apiKey: options.apiKey })
    const result = streamText({
      model: xai(model),
      system,
      messages: await convertToModelMessages(messages),
      ...(modelSupportsEffort(model)
        ? {
            providerOptions: {
              xai: { reasoningEffort: effort },
            },
          }
        : {}),
    })
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    })
  }

  const reply = localAssistantReply(lastUserText(messages), context)
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: "text-start", id: "text-1" })
      writer.write({ type: "text-delta", id: "text-1", delta: reply })
      writer.write({ type: "text-end", id: "text-1" })
    },
  })
  return createUIMessageStreamResponse({ stream })
}
