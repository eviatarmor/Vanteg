import type { MentionItem, MentionSegment } from "@/components/mention/types"
import { normalizeMentionDocument } from "@/components/mention/mention-document"

const EXPR = /\{\{([^}]+)\}\}/g

export function parseWorkflowExpression(value: string): MentionSegment[] {
  if (!value) {
    return [{ type: "text", text: "" }]
  }
  const segments: MentionSegment[] = []
  let last = 0
  for (const match of value.matchAll(EXPR)) {
    const index = match.index ?? 0
    if (index > last) {
      segments.push({ type: "text", text: value.slice(last, index) })
    }
    const path = match[1]?.trim() ?? ""
    segments.push({
      type: "mention",
      uid: `expr:${index}:${path}`,
      item: {
        kind: "output",
        id: path,
        label: path,
      },
    })
    last = index + match[0].length
  }
  if (last < value.length) {
    segments.push({ type: "text", text: value.slice(last) })
  }
  return normalizeMentionDocument(segments)
}

export function serializeWorkflowExpression(segments: MentionSegment[]): string {
  return segments
    .map((segment) =>
      segment.type === "text" ? segment.text : `{{${segment.item.id || segment.item.label}}}`
    )
    .join("")
}

export function expressionRefs(value: string): string[] {
  const refs: string[] = []
  for (const match of value.matchAll(EXPR)) {
    const path = match[1]?.trim()
    if (path) {
      refs.push(path)
    }
  }
  return refs
}

export function isAvailableExpressionRef(
  ref: string,
  available: Iterable<string>
): boolean {
  const set = available instanceof Set ? available : new Set(available)
  if (set.has(ref)) {
    return true
  }
  for (const path of set) {
    if (ref === path || ref.startsWith(`${path}.`)) {
      return true
    }
  }
  return false
}

export function missingExpressionRefs(
  value: string,
  available: Iterable<string>
): string[] {
  return expressionRefs(value).filter((ref) => !isAvailableExpressionRef(ref, available))
}

export function outputMentionItem(path: string, description?: string): MentionItem {
  return {
    kind: "output",
    id: path,
    label: path,
    description,
  }
}
