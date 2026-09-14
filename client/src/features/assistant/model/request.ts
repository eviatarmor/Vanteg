import type { UIMessage } from "ai"

import { getAgentModel, type AgentModel } from "../../agents/model/types"

import {
  defaultAssistantSettings,
  isAgentModelValue,
  isAssistantAccessMode,
  isAssistantEffort,
  isXaiAssistantModel,
  modelSupportsEffort,
  type AssistantSettings,
} from "./settings"
import type {
  AssistantChatContext,
  AssistantReference,
  AssistantReferenceKind,
  WorkflowChatContext,
} from "./types"

export const MAX_CHAT_REFERENCES = 12
export const MAX_REFERENCE_IDENTITY_LENGTH = 200
export const MAX_REFERENCE_CONTEXT_LENGTH = 8_000
export const MAX_REFERENCE_CONTEXT_TOTAL = 32_000

const REFERENCE_KINDS = new Set<AssistantReferenceKind>([
  "agent",
  "team",
  "workflow",
  "table",
  "variable-group",
  "memory",
  "knowledge",
  "connector",
])

const REFERENCE_WIRE_KEYS = new Set([
  "kind",
  "id",
  "label",
  "description",
  "context",
])

export interface ParsedChatRequest extends AssistantSettings {
  messages: UIMessage[]
  context?: AssistantChatContext
  references: AssistantReference[]
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

function isReferenceKind(value: unknown): value is AssistantReferenceKind {
  return (
    typeof value === "string" &&
    REFERENCE_KINDS.has(value as AssistantReferenceKind)
  )
}

function parseIdentityField(
  value: unknown,
  field: "id" | "label" | "description",
  index: number
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return {
      ok: false,
      error: `references[${index}].${field} must be a string.`,
    }
  }
  if (value.length > MAX_REFERENCE_IDENTITY_LENGTH) {
    return {
      ok: false,
      error: `references[${index}].${field} must be at most ${MAX_REFERENCE_IDENTITY_LENGTH} characters.`,
    }
  }
  return { ok: true, value }
}

function parseReference(
  value: unknown,
  index: number
): { ok: true; value: AssistantReference } | { ok: false; error: string } {
  const record = asRecord(value)
  if (!record) {
    return {
      ok: false,
      error: `references[${index}] must be an object.`,
    }
  }

  for (const key of Object.keys(record)) {
    if (!REFERENCE_WIRE_KEYS.has(key)) {
      return {
        ok: false,
        error: `references[${index}] contains unsupported fields.`,
      }
    }
  }

  if (!isReferenceKind(record.kind)) {
    return {
      ok: false,
      error: `references[${index}].kind must be a known reference kind.`,
    }
  }

  const id = parseIdentityField(record.id, "id", index)
  if (!id.ok) {
    return id
  }
  const label = parseIdentityField(record.label, "label", index)
  if (!label.ok) {
    return label
  }

  let description: string | undefined
  if (record.description !== undefined) {
    const parsedDescription = parseIdentityField(
      record.description,
      "description",
      index
    )
    if (!parsedDescription.ok) {
      return parsedDescription
    }
    description = parsedDescription.value
  }

  if (typeof record.context !== "string") {
    return {
      ok: false,
      error: `references[${index}].context must be a string.`,
    }
  }
  if (record.context.length > MAX_REFERENCE_CONTEXT_LENGTH) {
    return {
      ok: false,
      error: `references[${index}].context must be at most ${MAX_REFERENCE_CONTEXT_LENGTH} characters.`,
    }
  }

  const reference: AssistantReference = {
    kind: record.kind,
    id: id.value,
    label: label.value,
    context: record.context,
  }
  if (description !== undefined) {
    reference.description = description
  }
  return { ok: true, value: reference }
}

function parseReferences(
  value: unknown
):
  | { ok: true; references: AssistantReference[] }
  | { ok: false; error: string } {
  if (value === undefined) {
    return { ok: true, references: [] }
  }
  if (!Array.isArray(value)) {
    return { ok: false, error: "references must be an array." }
  }
  if (value.length > MAX_CHAT_REFERENCES) {
    return {
      ok: false,
      error: `At most ${MAX_CHAT_REFERENCES} references are allowed.`,
    }
  }

  const references: AssistantReference[] = []
  let totalContext = 0
  for (const [index, entry] of value.entries()) {
    const parsed = parseReference(entry, index)
    if (!parsed.ok) {
      return parsed
    }
    totalContext += parsed.value.context.length
    if (totalContext > MAX_REFERENCE_CONTEXT_TOTAL) {
      return {
        ok: false,
        error: `Referenced context exceeds the ${MAX_REFERENCE_CONTEXT_TOTAL} character limit.`,
      }
    }
    references.push(parsed.value)
  }
  return { ok: true, references }
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

  const parsedReferences = parseReferences(
    record.assistantReferences !== undefined
      ? record.assistantReferences
      : record.references
  )
  if (!parsedReferences.ok) {
    return parsedReferences
  }

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
      references: parsedReferences.references,
    },
  }
}

export function assistantRequestErrorResponse(message: string): Response {
  return new Response(message, {
    status: 400,
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}
