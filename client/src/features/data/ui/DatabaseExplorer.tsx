import { Table2 } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"

import { findTable, listExpandedDatabaseIds, selectDatabaseNode, useDataStore } from "../model/store"
import type { ExplorerNode } from "./ExplorerTree"
import { ExplorerTree } from "./ExplorerTree"
import { TableGrid } from "./TableGrid"

export function DatabaseExplorer() {
  const snapshot = useDataStore()
  const selected = snapshot.selectedTableId
    ? findTable(snapshot.databases, snapshot.selectedTableId)
    : undefined

  const nodes: ExplorerNode[] = snapshot.databases.map((database) => ({
    id: database.id,
    label: database.name,
    icon: "database",
    children: database.schemas.map((schema) => ({
      id: schema.id,
      label: schema.name,
      icon: "schema",
      children: schema.tables.map((table) => ({
        id: table.id,
        label: table.name,
        icon: "table",
      })),
    })),
  }))

  return (
    <ResizableSidebar
      id="data-database"
      sidebar={
        <ExplorerTree
          aria-label="Databases"
          className="min-h-0 min-w-0 flex-1"
          header={
            <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Databases
            </div>
          }
          nodes={nodes}
          selectedId={snapshot.selectedTableId ?? undefined}
          defaultExpanded={listExpandedDatabaseIds(snapshot.databases)}
          onSelect={selectDatabaseNode}
        />
      }
    >
      {selected ? (
        <>
          <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 text-sm text-muted-foreground">
            <span>{selected.database.name}</span>
            <span>/</span>
            <span>{selected.schema.name}</span>
            <span>/</span>
            <span className="font-medium text-foreground">{selected.table.name}</span>
          </header>
          <TableGrid key={selected.table.id} table={selected.table} />
        </>
      ) : (
        <EmptyState
          icon={Table2}
          title="Select a table"
          description="Choose a table from the tree to inspect its rows."
          className="min-h-0 flex-1"
        />
      )}
    </ResizableSidebar>
  )
}
