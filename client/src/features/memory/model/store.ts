import { useSyncExternalStore } from "react"

import type {
  KnowledgeBase,
  KnowledgeDocument,
  MemoryBase,
  MemoryEntry,
  MemorySnapshot,
} from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function slugName(name: string): string {
  return name.trim() || "Untitled"
}

function createSeed(): MemorySnapshot {
  return {
    bases: [
      {
        id: "base-workspace",
        name: "Workspace",
        description: "Shared facts every agent can use.",
      },
      {
        id: "base-support",
        name: "Support",
        description: "Customer-support policies and tone.",
      },
    ],
    memories: [
      {
        id: "mem-owner",
        baseId: "base-workspace",
        content: "Darren is the workspace owner.",
        createdAt: Date.parse("2026-04-01T12:00:00Z"),
      },
      {
        id: "mem-model",
        baseId: "base-workspace",
        content: "Prefer Grok models for assistant replies.",
        createdAt: Date.parse("2026-04-02T09:00:00Z"),
      },
      {
        id: "mem-refund",
        baseId: "base-support",
        content: "Refunds under $50 can be approved without escalation.",
        createdAt: Date.parse("2026-04-03T15:30:00Z"),
      },
    ],
    knowledgeBases: [
      {
        id: "kb-product",
        name: "Product",
        description: "Product guides used for retrieval.",
      },
      {
        id: "kb-policies",
        name: "Policies",
        description: "Internal policy documents.",
      },
    ],
    documents: [
      {
        id: "doc-overview",
        knowledgeBaseId: "kb-product",
        name: "vanteg-overview.md",
        size: 214,
        type: "text/markdown",
        text: "# Vanteg\n\nVanteg is a workspace for workflows, data, and agents.\nAgents can share memory bases and retrieve uploaded knowledge files.",
        uploadedAt: Date.parse("2026-04-04T10:00:00Z"),
      },
      {
        id: "doc-pricing",
        knowledgeBaseId: "kb-product",
        name: "pricing.md",
        size: 96,
        type: "text/markdown",
        text: "Starter is free for two seats. Team includes shared memory bases and knowledge retrieval.",
        uploadedAt: Date.parse("2026-04-04T10:05:00Z"),
      },
    ],
    selectedMemoryBaseId: "base-workspace",
    selectedKnowledgeBaseId: "kb-product",
  }
}

let snapshot: MemorySnapshot = createSeed()

export function subscribeMemory(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getMemorySnapshot(): MemorySnapshot {
  return snapshot
}

export function useMemoryStore(): MemorySnapshot {
  return useSyncExternalStore(subscribeMemory, getMemorySnapshot, getMemorySnapshot)
}

export function resetMemoryStore(): void {
  snapshot = createSeed()
  emit()
}

export function selectMemoryBase(id: string): void {
  if (!snapshot.bases.some((base) => base.id === id)) {
    return
  }
  snapshot = { ...snapshot, selectedMemoryBaseId: id }
  emit()
}

export function selectKnowledgeBase(id: string): void {
  if (!snapshot.knowledgeBases.some((base) => base.id === id)) {
    return
  }
  snapshot = { ...snapshot, selectedKnowledgeBaseId: id }
  emit()
}

export function createMemoryBase(name: string): MemoryBase | undefined {
  const trimmed = slugName(name)
  const base: MemoryBase = {
    id: crypto.randomUUID(),
    name: trimmed,
    description: "",
  }
  snapshot = {
    ...snapshot,
    bases: [...snapshot.bases, base],
    selectedMemoryBaseId: base.id,
  }
  emit()
  return base
}

export function createMemory(content: string, baseId = snapshot.selectedMemoryBaseId): MemoryEntry | undefined {
  const trimmed = content.trim()
  if (!trimmed) {
    return undefined
  }
  const base = snapshot.bases.find((item) => item.id === baseId) ?? snapshot.bases[0]
  if (!base) {
    return undefined
  }
  const memory: MemoryEntry = {
    id: crypto.randomUUID(),
    baseId: base.id,
    content: trimmed,
    createdAt: Date.now(),
  }
  snapshot = { ...snapshot, memories: [memory, ...snapshot.memories] }
  emit()
  return memory
}

export function addMemoryRow(baseId = snapshot.selectedMemoryBaseId): MemoryEntry | undefined {
  const base = snapshot.bases.find((item) => item.id === baseId) ?? snapshot.bases[0]
  if (!base) {
    return undefined
  }
  const memory: MemoryEntry = {
    id: crypto.randomUUID(),
    baseId: base.id,
    content: "",
    createdAt: Date.now(),
  }
  snapshot = { ...snapshot, memories: [...snapshot.memories, memory] }
  emit()
  return memory
}

export function updateMemoryRows(
  baseId: string,
  rows: Array<{ id: string; content: string }>
): void {
  const previous = new Map(
    snapshot.memories.filter((memory) => memory.baseId === baseId).map((memory) => [memory.id, memory])
  )
  const nextForBase: MemoryEntry[] = rows.map((row) => {
    const prev = previous.get(row.id)
    return {
      id: row.id,
      baseId,
      content: row.content,
      createdAt: prev?.createdAt ?? Date.now(),
    }
  })
  snapshot = {
    ...snapshot,
    memories: [
      ...snapshot.memories.filter((memory) => memory.baseId !== baseId),
      ...nextForBase,
    ],
  }
  emit()
}

export function deleteMemories(ids: readonly string[]): void {
  const idSet = new Set(ids)
  if (idSet.size === 0) {
    return
  }
  snapshot = {
    ...snapshot,
    memories: snapshot.memories.filter((memory) => !idSet.has(memory.id)),
  }
  emit()
}

export function createKnowledgeBase(name: string): KnowledgeBase | undefined {
  const trimmed = slugName(name)
  const base: KnowledgeBase = {
    id: crypto.randomUUID(),
    name: trimmed,
    description: "",
  }
  snapshot = {
    ...snapshot,
    knowledgeBases: [...snapshot.knowledgeBases, base],
    selectedKnowledgeBaseId: base.id,
  }
  emit()
  return base
}

export function addKnowledgeDocument(document: KnowledgeDocument): void {
  snapshot = { ...snapshot, documents: [document, ...snapshot.documents] }
  emit()
}

export function removeKnowledgeDocument(id: string): void {
  removeKnowledgeDocuments([id])
}

export function removeKnowledgeDocuments(ids: readonly string[]): void {
  const idSet = new Set(ids)
  if (idSet.size === 0) {
    return
  }
  snapshot = {
    ...snapshot,
    documents: snapshot.documents.filter((document) => !idSet.has(document.id)),
  }
  emit()
}

export function applyKnowledgeGridRows(
  baseId: string,
  rows: Array<{ id: string; name: string }>
): void {
  const names = new Map(rows.map((row) => [row.id, row.name]))
  snapshot = {
    ...snapshot,
    documents: snapshot.documents.map((document) => {
      if (document.knowledgeBaseId !== baseId) {
        return document
      }
      const name = names.get(document.id)
      return name === undefined || name === document.name
        ? document
        : { ...document, name }
    }),
  }
  emit()
}

export function memoriesForBase(baseId: string): MemoryEntry[] {
  return snapshot.memories.filter((memory) => memory.baseId === baseId)
}

export function documentsForBase(baseId: string): KnowledgeDocument[] {
  return snapshot.documents.filter((document) => document.knowledgeBaseId === baseId)
}

export function findMemoryBase(id: string): MemoryBase | undefined {
  return snapshot.bases.find((base) => base.id === id)
}

export function findKnowledgeBase(id: string): KnowledgeBase | undefined {
  return snapshot.knowledgeBases.find((base) => base.id === id)
}
