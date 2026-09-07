import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { FillDataGrid } from "@/features/data/ui/FillDataGrid"

import { addMemoryRow, deleteMemories, updateMemoryRows } from "../model/store"
import type { MemoryEntry } from "../model/types"

interface MemoryGridRow {
  id: string
  content: string
  createdAt: string
}

function toRow(memory: MemoryEntry): MemoryGridRow {
  return {
    id: memory.id,
    content: memory.content,
    createdAt: new Date(memory.createdAt).toISOString(),
  }
}

export function MemoryEntriesGrid({
  baseId,
  memories,
}: {
  baseId: string
  memories: MemoryEntry[]
}) {
  const rows = useMemo(() => memories.map(toRow), [memories])
  const columns = useMemo<ColumnDef<MemoryGridRow>[]>(
    () => [
      {
        id: "content",
        accessorKey: "content",
        header: "Content",
        minSize: 240,
        size: 420,
        meta: { label: "Content", cell: { variant: "long-text" } },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created At",
        minSize: 160,
        size: 220,
        meta: { label: "Created At", cell: { variant: "short-text" }, readOnly: true },
      },
    ],
    []
  )

  return (
    <FillDataGrid
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      onDataChange={(next) => {
        updateMemoryRows(
          baseId,
          next.map((row) => ({ id: row.id, content: row.content }))
        )
      }}
      onRowAdd={() => {
        addMemoryRow(baseId)
      }}
      onRowsDelete={(deleted) => {
        deleteMemories(deleted.map((row) => row.id))
      }}
    />
  )
}
