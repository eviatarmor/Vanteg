import { Brain } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"

import { selectMemoryBase, useMemoryStore } from "../model/store"
import type { ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { ExplorerTree } from "@/features/data/ui/ExplorerTree"

import { MemoryEntriesGrid } from "./MemoryEntriesGrid"

export function MemoryBaseExplorer() {
  const snapshot = useMemoryStore()
  const selected =
    snapshot.bases.find((base) => base.id === snapshot.selectedMemoryBaseId) ??
    snapshot.bases[0]
  const memories = selected
    ? snapshot.memories.filter((memory) => memory.baseId === selected.id)
    : []

  const nodes: ExplorerNode[] = snapshot.bases.map((base) => ({
    id: base.id,
    label: base.name,
    icon: "folder",
  }))

  return (
    <ResizableSidebar
      id="memory-bases"
      sidebar={
        <ExplorerTree
          aria-label="Memory bases"
          className="min-h-0 min-w-0 flex-1"
          header={
            <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Memory bases
            </div>
          }
          nodes={nodes}
          selectedId={selected?.id}
          onSelect={selectMemoryBase}
        />
      }
    >
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <header className="flex h-10 shrink-0 items-center border-b px-4">
              <h2 className="truncate text-sm font-medium">{selected.name}</h2>
            </header>
            <MemoryEntriesGrid key={selected.id} baseId={selected.id} memories={memories} />
          </>
        ) : (
          <EmptyState
            icon={Brain}
            title="Select a memory base"
            description="Choose a base from the tree to view shared memories."
            className="min-h-0 flex-1"
          />
        )}
      </section>
    </ResizableSidebar>
  )
}
