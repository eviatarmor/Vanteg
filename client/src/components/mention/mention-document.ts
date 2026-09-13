import type { MentionQuery } from "./mention-query"
import { findMentionQuery } from "./mention-query"
import type { MentionItem, MentionKindMeta, MentionSegment } from "./types"

export function mentionKey(item: Pick<MentionItem, "kind" | "id">): string {
  return `${item.kind}:${item.id}`
}

export function mentionItemValue(item: Pick<MentionItem, "kind" | "id">): string {
  return mentionKey(item)
}

export function mentionOptionId(item: Pick<MentionItem, "kind" | "id">): string {
  return `mention-option-${mentionItemValue(item)}`
}

export function emptyMentionDocument(): MentionSegment[] {
  return [{ type: "text", text: "" }]
}

export function normalizeMentionDocument(
  segments: MentionSegment[]
): MentionSegment[] {
  const normalized: MentionSegment[] = []
  for (const segment of segments) {
    if (segment.type === "text") {
      const last = normalized[normalized.length - 1]
      if (last?.type === "text") {
        last.text += segment.text
        continue
      }
      normalized.push({ type: "text", text: segment.text })
      continue
    }
    normalized.push(segment)
  }
  if (normalized.length === 0) {
    return emptyMentionDocument()
  }
  if (normalized[0]?.type === "mention") {
    normalized.unshift({ type: "text", text: "" })
  }
  if (normalized[normalized.length - 1]?.type === "mention") {
    normalized.push({ type: "text", text: "" })
  }
  return normalized
}

export function serializeMentionDocument(segments: MentionSegment[]): string {
  return segments
    .map((segment) =>
      segment.type === "text" ? segment.text : segment.item.label
    )
    .join("")
}

export function uniqueMentionItems(segments: MentionSegment[]): MentionItem[] {
  const seen = new Set<string>()
  const items: MentionItem[] = []
  for (const segment of segments) {
    if (segment.type !== "mention") {
      continue
    }
    const key = mentionKey(segment.item)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    items.push(segment.item)
  }
  return items
}

export function insertMention(
  segments: MentionSegment[],
  segmentIndex: number,
  query: MentionQuery,
  item: MentionItem,
  uid: string
): MentionSegment[] {
  const segment = segments[segmentIndex]
  if (!segment || segment.type !== "text") {
    return segments
  }
  const before = segment.text.slice(0, query.start)
  const after = segment.text.slice(query.end)
  return normalizeMentionDocument([
    ...segments.slice(0, segmentIndex),
    { type: "text", text: before },
    { type: "mention", item, uid },
    { type: "text", text: after },
    ...segments.slice(segmentIndex + 1),
  ])
}

export function removeMention(
  segments: MentionSegment[],
  uid: string
): MentionSegment[] {
  return normalizeMentionDocument(
    segments.filter(
      (segment) => segment.type !== "mention" || segment.uid !== uid
    )
  )
}

export function insertTextAtCaret(
  segments: MentionSegment[],
  caret: { segmentIndex: number; offset: number },
  text: string
): { segments: MentionSegment[]; caret: { segmentIndex: number; offset: number } } {
  const segment = segments[caret.segmentIndex]
  if (!segment || segment.type !== "text" || !text) {
    return { segments, caret }
  }
  const nextText =
    segment.text.slice(0, caret.offset) + text + segment.text.slice(caret.offset)
  const next = segments.map((entry, index) =>
    index === caret.segmentIndex ? { type: "text" as const, text: nextText } : entry
  )
  return {
    segments: normalizeMentionDocument(next),
    caret: {
      segmentIndex: caret.segmentIndex,
      offset: caret.offset + text.length,
    },
  }
}

export function deleteAtCaret(
  segments: MentionSegment[],
  caret: { segmentIndex: number; offset: number }
): { segments: MentionSegment[]; caret: { segmentIndex: number; offset: number } } {
  const segment = segments[caret.segmentIndex]
  if (!segment || segment.type !== "text") {
    return { segments, caret }
  }
  if (caret.offset > 0) {
    const nextText =
      segment.text.slice(0, caret.offset - 1) + segment.text.slice(caret.offset)
    const next = segments.map((entry, index) =>
      index === caret.segmentIndex ? { type: "text" as const, text: nextText } : entry
    )
    return {
      segments: normalizeMentionDocument(next),
      caret: { segmentIndex: caret.segmentIndex, offset: caret.offset - 1 },
    }
  }
  if (caret.segmentIndex === 0) {
    return { segments, caret }
  }
  const previous = segments[caret.segmentIndex - 1]
  if (previous?.type === "mention") {
    const next = removeMention(segments, previous.uid)
    const index = Math.max(caret.segmentIndex - 2, 0)
    const at = next[index]
    return {
      segments: next,
      caret: {
        segmentIndex: index,
        offset: at?.type === "text" ? at.text.length : 0,
      },
    }
  }
  return { segments, caret }
}

export function findMentionQueryInDocument(
  segments: MentionSegment[],
  caret: { segmentIndex: number; offset: number }
): (MentionQuery & { segmentIndex: number }) | null {
  const segment = segments[caret.segmentIndex]
  if (!segment || segment.type !== "text") {
    return null
  }
  const query = findMentionQuery(segment.text, caret.offset)
  if (!query) {
    return null
  }
  return { ...query, segmentIndex: caret.segmentIndex }
}

function mentionItemMatches(item: MentionItem, search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (!needle) {
    return true
  }
  if (item.label.toLowerCase().includes(needle)) {
    return true
  }
  return Boolean(item.description?.toLowerCase().includes(needle))
}

export function filterMentionItems(
  items: MentionItem[],
  search: string
): MentionItem[] {
  return items.filter((item) => mentionItemMatches(item, search))
}

export function groupedMentionItems(
  items: MentionItem[],
  kinds: MentionKindMeta[]
): Array<MentionKindMeta & { items: MentionItem[] }> {
  return kinds
    .map((kind) => ({
      ...kind,
      items: items.filter((item) => item.kind === kind.kind),
    }))
    .filter((group) => group.items.length > 0)
}

export function flattenGroupedMentionItems(
  items: MentionItem[],
  kinds: MentionKindMeta[]
): MentionItem[] {
  return groupedMentionItems(items, kinds).flatMap((group) => group.items)
}
