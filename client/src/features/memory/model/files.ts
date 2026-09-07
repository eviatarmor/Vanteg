import type { KnowledgeDocument } from "./types"

const textName = /\.(txt|md|markdown|csv|json|html|xml|yml|yaml)$/i
const textType = /^(text\/|application\/(json|xml|yaml|x-yaml|csv))/i

export function canIndexFile(file: Pick<File, "name" | "type">): boolean {
  return textType.test(file.type) || textName.test(file.name)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function readKnowledgeFile(
  knowledgeBaseId: string,
  file: File
): Promise<KnowledgeDocument> {
  const text = canIndexFile(file) ? await file.text() : null
  return {
    id: crypto.randomUUID(),
    knowledgeBaseId,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    text,
    uploadedAt: Date.now(),
  }
}
