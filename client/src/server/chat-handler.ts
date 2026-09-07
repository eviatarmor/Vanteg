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
import type {
  AssistantChatContext,
  WorkflowChatContext,
} from "../features/assistant/model/types"

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
  const body = (await request.json()) as {
    messages?: UIMessage[]
    context?: AssistantChatContext
    workflow?: WorkflowChatContext
  }
  const messages = body.messages ?? []
  const context: AssistantChatContext | undefined = body.context ??
    (body.workflow
      ? {
          path: "/workflows",
          pageTitle: "Workflows",
          workflow: body.workflow,
        }
      : undefined)
  const system = buildSystemPrompt(context)

  if (options.apiKey) {
    const xai = createXai({ apiKey: options.apiKey })
    const result = streamText({
      model: xai("grok-4.6"),
      system,
      messages: await convertToModelMessages(messages),
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
