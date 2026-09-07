import { beforeEach, describe, expect, it } from "vitest"

import {
  addKnowledgeDocument,
  createKnowledgeBase,
  createMemory,
  createMemoryBase,
  getMemorySnapshot,
  resetMemoryStore,
  selectMemoryBase,
} from "./store"

describe("memory store", () => {
  beforeEach(() => {
    resetMemoryStore()
  })

  it("seeds shared workspace memories", () => {
    const snapshot = getMemorySnapshot()
    expect(snapshot.memories.some((memory) => memory.content.includes("Darren"))).toBe(
      true
    )
    expect(snapshot.bases.map((base) => base.name)).toContain("Workspace")
    expect(snapshot.knowledgeBases.map((base) => base.name)).toContain("Product")
  })

  it("adds a memory to the selected base", () => {
    selectMemoryBase("base-support")
    const memory = createMemory("Always greet by name.")
    expect(memory?.baseId).toBe("base-support")
    expect(getMemorySnapshot().memories[0]?.content).toBe("Always greet by name.")
  })

  it("creates a memory base and knowledge base", () => {
    const memoryBase = createMemoryBase("Sales")
    const knowledgeBase = createKnowledgeBase("Contracts")
    expect(getMemorySnapshot().selectedMemoryBaseId).toBe(memoryBase?.id)
    expect(getMemorySnapshot().selectedKnowledgeBaseId).toBe(knowledgeBase?.id)
  })

  it("stores an uploaded knowledge document", () => {
    addKnowledgeDocument({
      id: "doc-test",
      knowledgeBaseId: "kb-product",
      name: "guide.md",
      size: 12,
      type: "text/markdown",
      text: "hello retrieval",
      uploadedAt: 1,
    })
    expect(
      getMemorySnapshot().documents.some((document) => document.name === "guide.md")
    ).toBe(true)
  })
})
