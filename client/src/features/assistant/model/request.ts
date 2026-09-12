import type { UIMessage } from "ai"

import { getAgentModel, type AgentModel } from "../../agents/model/types"

import type { AssistantChatContext, WorkflowChatContext } from "./types"
import {
  defaultAssistantSettings,
  isAgentModelValue,
  isAssistantAccessMode,
  isAssistantEffort,
  isXaiAssistantModel,
  modelSupportsEffort,
  type AssistantSettings,
} from "./settings"

export interface ParsedChatRequest extends AssistantSettings {
  messages: UIMessage[]
  context?: AssistantChatContext
}

export type ParseChatRequestResult =
  { ok: true; value: ParsedChatRequest } | { ok: false; error: string }

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function parseContext(
  body: Record<string, unknown>
): AssistantChatContext | undefined {
  const context = asRecord(body.context)
  if (context && typeof context.path === "string") {
    const workflow = asRecord(context.workflow)
    return {
      path: context.path,
      pageTitle:
        typeof context.pageTitle === "string" ? context.pageTitle : "this page",
      workflow: parseWorkflow(workflow),
    }
  }
  const workflow = parseWorkflow(asRecord(body.workflow))
  if (!workflow) {
    return undefined
  }
  return {
    path: "/workflows",
    pageTitle: "Workflows",
    workflow,
  }
}

function parseWorkflow(
  value: Record<string, unknown> | null
): WorkflowChatContext | undefined {
  if (
    !value ||
    typeof value.id !== "string" ||
    typeof value.name !== "string"
  ) {
    return undefined
  }
  if (!Array.isArray(value.steps)) {
    return { id: value.id, name: value.name, steps: [] }
  }
  const steps = value.steps.flatMap((step) => {
    const record = asRecord(step)
    if (
      !record ||
      typeof record.label !== "string" ||
      typeof record.catalogId !== "string"
    ) {
      return []
    }
    return [{ label: record.label, catalogId: record.catalogId }]
  })
  return { id: value.id, name: value.name, steps }
}

function unsupportedModelError(model: AgentModel): string {
  const provider = getAgentModel(model)
  return `Ask Vanteg currently chats with Grok. Select Grok 4.6 or Grok 4.5 instead of ${provider.label}.`
}

function parseMessages(
  value: unknown
): { ok: true; messages: UIMessage[] } | { ok: false; error: string } {
  if (value === undefined) {
    return { ok: true, messages: [] }
  }
  if (!Array.isArray(value)) {
    return { ok: false, error: "messages must be an array." }
  }
  const messages: UIMessage[] = []
  for (const [index, entry] of value.entries()) {
    const parsed = parseMessage(entry, index)
    if (!parsed.ok) {
      return parsed
    }
    messages.push(parsed.message)
  }
  return { ok: true, messages }
}

function parseMessage(
  value: unknown,
  index: number
): { ok: true; message: UIMessage } | { ok: false; error: string } {
  const record = asRecord(value)
  if (!record) {
    return {
      ok: false,
      error: `messages[${index}] must be a message object.`,
    }
  }
  if (typeof record.id !== "string" || record.id.length === 0) {
    return { ok: false, error: `messages[${index}].id must be a string.` }
  }
  if (typeof record.role !== "string" || record.role.length === 0) {
    return { ok: false, error: `messages[${index}].role must be a string.` }
  }
  if (!Array.isArray(record.parts)) {
    return {
      ok: false,
      error: `messages[${index}].parts must be an array.`,
    }
  }
  for (const [partIndex, part] of record.parts.entries()) {
    const parsedPart = parseMessagePart(part, index, partIndex)
    if (!parsedPart.ok) {
      return parsedPart
    }
  }
  return { ok: true, message: record as unknown as UIMessage }
}

function parseMessagePart(
  value: unknown,
  messageIndex: number,
  partIndex: number
): { ok: true } | { ok: false; error: string } {
  const record = asRecord(value)
  if (!record || typeof record.type !== "string" || record.type.length === 0) {
    return {
      ok: false,
      error: `messages[${messageIndex}].parts[${partIndex}] must be an object with a type.`,
    }
  }
  if (record.type === "text" && typeof record.text !== "string") {
    return {
      ok: false,
      error: `messages[${messageIndex}].parts[${partIndex}].text must be a string.`,
    }
  }
  if (record.type === "file" && typeof record.url !== "string") {
    return {
      ok: false,
      error: `messages[${messageIndex}].parts[${partIndex}].url must be a string.`,
    }
  }
  return { ok: true }
}

export function parseChatRequestBody(body: unknown): ParseChatRequestResult {
  const record = asRecord(body)
  if (!record) {
    return { ok: false, error: "Request body must be a JSON object." }
  }

  const parsedMessages = parseMessages(record.messages)
  if (!parsedMessages.ok) {
    return parsedMessages
  }
  const messages = parsedMessages.messages

  const defaults = defaultAssistantSettings()
  if (record.model !== undefined && !isAgentModelValue(record.model)) {
    return {
      ok: false,
      error: "Unknown model. Choose a model from the assistant catalog.",
    }
  }
  if (record.access !== undefined && !isAssistantAccessMode(record.access)) {
    return {
      ok: false,
      error: "access must be read-only, supervised, or full-access.",
    }
  }
  if (record.effort !== undefined && !isAssistantEffort(record.effort)) {
    return { ok: false, error: "effort must be low, medium, or high." }
  }

  const model = isAgentModelValue(record.model) ? record.model : defaults.model
  if (!isXaiAssistantModel(model)) {
    return { ok: false, error: unsupportedModelError(model) }
  }

  const access = isAssistantAccessMode(record.access)
    ? record.access
    : defaults.access
  const effort = isAssistantEffort(record.effort)
    ? record.effort
    : defaults.effort

  if (record.effort !== undefined && !modelSupportsEffort(model)) {
    return {
      ok: false,
      error: `${getAgentModel(model).label} does not accept an effort setting.`,
    }
  }

  return {
    ok: true,
    value: {
      messages,
      context: parseContext(record),
      model,
      access,
      effort,
    },
  }
}

export function assistantRequestErrorResponse(message: string): Response {
  return new Response(message, {
    status: 400,
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}
