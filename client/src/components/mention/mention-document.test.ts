import { Bot, Workflow, type LucideIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import {
  emptyMentionDocument,
  filterMentionItems,
  flattenGroupedMentionItems,
  groupedMentionItems,
  insertMention,
  mentionItemValue,
  mentionKey,
  normalizeMentionDocument,
  removeMention,
  serializeMentionDocument,
  uniqueMentionItems,
} from "./mention-document"
import { findMentionQuery } from "./mention-query"
import type { MentionItem, MentionKindMeta, MentionSegment } from "./types"

const ops: MentionItem = { kind: "agent", id: "ops", label: "Ops" }
const sales: MentionItem = {
  kind: "agent",
  id: "sales",
  label: "Sales Agent",
  description: "Closes deals",
}
const flow: MentionItem = {
  kind: "workflow",
  id: "onboard",
  label: "Onboarding Flow",
}

const kinds: MentionKindMeta[] = [
  { kind: "agent", label: "Agents", icon: Bot as LucideIcon },
  { kind: "workflow", label: "Workflows", icon: Workflow as LucideIcon },
]

describe("mentionKey", () => {
  it("uses kind:id as the entity key", () => {
    expect(mentionKey(ops)).toBe("agent:ops")
    expect(mentionItemValue(ops)).toBe("agent:ops")
  })
})

describe("insertMention", () => {
  it("serializes labels in place after inserting at the caret", () => {
    const segments: MentionSegment[] = [{ type: "text", text: "Ask @ops please" }]
    const query = findMentionQuery("Ask @ops please", 8)
    expect(query).not.toBeNull()
    const next = insertMention(segments, 0, query!, ops, "uid-1")
    expect(serializeMentionDocument(next)).toBe("Ask Ops please")
    expect(next.map((segment) => segment.type)).toEqual([
      "text",
      "mention",
      "text",
    ])
  })

  it("inserts a chip at the start of the document", () => {
    const segments: MentionSegment[] = [{ type: "text", text: "@ops" }]
    const query = findMentionQuery("@ops", 4)!
    const next = insertMention(segments, 0, query, ops, "uid-1")
    expect(serializeMentionDocument(next)).toBe("Ops")
    expect(next[0]).toEqual({ type: "text", text: "" })
    expect(next[1]).toMatchObject({ type: "mention", uid: "uid-1", item: ops })
    expect(next[2]).toEqual({ type: "text", text: "" })
  })
})

describe("uniqueMentionItems", () => {
  it("keeps the first occurrence of each kind:id", () => {
    const segments: MentionSegment[] = [
      { type: "text", text: "A " },
      { type: "mention", item: ops, uid: "a" },
      { type: "text", text: " and " },
      { type: "mention", item: ops, uid: "b" },
      { type: "text", text: "" },
    ]
    expect(uniqueMentionItems(segments)).toEqual([ops])
  })

  it("preserves first-seen order across kinds", () => {
    const segments: MentionSegment[] = [
      { type: "text", text: "" },
      { type: "mention", item: flow, uid: "w" },
      { type: "text", text: " " },
      { type: "mention", item: ops, uid: "a" },
      { type: "text", text: "" },
    ]
    expect(uniqueMentionItems(segments).map((item) => item.id)).toEqual([
      "onboard",
      "ops",
    ])
  })
})

describe("removeMention", () => {
  it("joins neighboring text when a chip is removed", () => {
    const segments: MentionSegment[] = [
      { type: "text", text: "Ask " },
      { type: "mention", item: ops, uid: "uid-1" },
      { type: "text", text: " please" },
    ]
    expect(serializeMentionDocument(removeMention(segments, "uid-1"))).toBe(
      "Ask  please"
    )
  })
})

describe("normalizeMentionDocument", () => {
  it("returns a single empty text segment for an empty list", () => {
    expect(normalizeMentionDocument([])).toEqual(emptyMentionDocument())
    expect(emptyMentionDocument()).toEqual([{ type: "text", text: "" }])
  })
})

describe("filterMentionItems", () => {
  const items = [ops, sales, flow]

  it("returns all items when search is empty", () => {
    expect(filterMentionItems(items, "")).toEqual(items)
    expect(filterMentionItems(items, "   ")).toEqual(items)
  })

  it("filters by label and description", () => {
    expect(filterMentionItems(items, "sales")).toEqual([sales])
    expect(filterMentionItems(items, "deals")).toEqual([sales])
    expect(filterMentionItems(items, "onboard")).toEqual([flow])
  })
})

describe("groupedMentionItems", () => {
  it("groups in kind order and omits empty kinds", () => {
    const groups = groupedMentionItems([flow, ops], kinds)
    expect(groups.map((group) => group.kind)).toEqual(["agent", "workflow"])
    expect(groups[0]?.items).toEqual([ops])
    expect(groups[1]?.items).toEqual([flow])
  })

  it("flattens grouped items in kind order", () => {
    expect(
      flattenGroupedMentionItems([flow, ops, sales], kinds).map((item) => item.id)
    ).toEqual(["ops", "sales", "onboard"])
  })
})
