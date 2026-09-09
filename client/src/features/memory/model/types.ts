export interface MemoryBase {
  id: string
  name: string
  description: string
}

export interface MemoryEntry {
  id: string
  baseId: string
  content: string
  createdAt: number
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
}

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  name: string
  size: number
  type: string
  text: string | null
  uploadedAt: number
}

export type MemoryLoadState = "loading" | "ready" | "error"

export interface MemorySnapshot {
  bases: MemoryBase[]
  memories: MemoryEntry[]
  knowledgeBases: KnowledgeBase[]
  documents: KnowledgeDocument[]
  selectedMemoryBaseId: string
  selectedKnowledgeBaseId: string
  loadState: MemoryLoadState
  loadError: string | null
}
