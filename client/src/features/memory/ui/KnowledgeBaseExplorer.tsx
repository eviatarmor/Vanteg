import { useRef, useState, type DragEvent } from "react"
import { BookOpen, Upload } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { ExplorerTree, type ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { ExplorerSkeleton, ResourceError } from "@/features/load-state/ResourceStatus"

import { readKnowledgeFile } from "../model/files"
import {
  addKnowledgeDocument,
  retryMemoryLoad,
  selectKnowledgeBase,
  useMemoryStore,
} from "../model/store"

import { KnowledgeDocumentsGrid } from "./KnowledgeDocumentsGrid"

export function KnowledgeBaseExplorer({ onCreate }: { onCreate?: () => void }) {
  const snapshot = useMemoryStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  if (snapshot.loadState === "loading") {
    return <ExplorerSkeleton label="Loading knowledge bases" />
  }

  if (snapshot.loadState === "error") {
    return (
      <ResourceError
        title="Could not load knowledge bases"
        message={snapshot.loadError ?? "Something went wrong while loading knowledge."}
        onRetry={() => retryMemoryLoad()}
      />
    )
  }

  if (snapshot.knowledgeBases.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No knowledge bases yet"
        description="Create a knowledge base, then upload files for retrieval."
        actionLabel="New knowledge base"
        onCreate={onCreate}
        className="min-h-0 flex-1"
      />
    )
  }

  const selected =
    snapshot.knowledgeBases.find((base) => base.id === snapshot.selectedKnowledgeBaseId) ??
    snapshot.knowledgeBases[0]
  const documents = selected
    ? snapshot.documents.filter((document) => document.knowledgeBaseId === selected.id)
    : []

  const nodes: ExplorerNode[] = snapshot.knowledgeBases.map((base) => ({
    id: base.id,
    label: base.name,
    icon: "folder",
  }))

  async function ingest(files: FileList | File[]) {
    if (!selected) {
      return
    }
    for (const file of Array.from(files)) {
      const document = await readKnowledgeFile(selected.id, file)
      addKnowledgeDocument(document)
    }
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files.length > 0) {
      void ingest(event.dataTransfer.files)
    }
  }

  return (
    <ResizableSidebar
      id="knowledge-bases"
      sidebar={
        <ExplorerTree
          aria-label="Knowledge bases"
          className="min-h-0 min-w-0 flex-1"
          header={
            <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Knowledge bases
            </div>
          }
          nodes={nodes}
          selectedId={selected?.id}
          onSelect={selectKnowledgeBase}
        />
      }
    >
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b px-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium">{selected.name}</h2>
              </div>
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload />
                Upload files
              </Button>
              <input
                ref={inputRef}
                id="knowledge-upload"
                className="sr-only"
                type="file"
                multiple
                aria-label="Knowledge files"
                accept=".txt,.md,.markdown,.csv,.json,.html,.xml,.yml,.yaml,.pdf,.doc,.docx"
                onChange={(event) => {
                  if (event.target.files) {
                    void ingest(event.target.files)
                    event.target.value = ""
                  }
                }}
              />
            </header>
            <div
              className={cn("flex min-h-0 flex-1 flex-col", dragging && "bg-muted/40")}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {documents.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No files yet"
                  description="Drop files here or upload to index them for retrieval. Text files are indexed; other types are stored."
                  actionLabel="Upload files"
                  onCreate={() => inputRef.current?.click()}
                  className="min-h-0 flex-1"
                />
              ) : (
                <KnowledgeDocumentsGrid
                  key={selected.id}
                  baseId={selected.id}
                  documents={documents}
                />
              )}
            </div>
          </>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Select a knowledge base"
            description="Choose a base from the tree to upload files for retrieval."
            className="min-h-0 flex-1"
          />
        )}
      </section>
    </ResizableSidebar>
  )
}
