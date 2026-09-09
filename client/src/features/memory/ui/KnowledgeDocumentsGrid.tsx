import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { FillDataGrid } from "@/features/data/ui/FillDataGrid"

import { formatBytes } from "../model/files"
import { applyKnowledgeGridRows, removeKnowledgeDocuments } from "../model/store"
import type { KnowledgeDocument } from "../model/types"

interface KnowledgeGridRow {
  id: string
  name: string
  size: string
  uploadedAt: string
}

function toRow(document: KnowledgeDocument): KnowledgeGridRow {
  return {
    id: document.id,
    name: document.name,
    size: formatBytes(document.size),
    uploadedAt: new Date(document.uploadedAt).toISOString(),
  }
}

export function KnowledgeDocumentsGrid({
  baseId,
  documents,
}: {
  baseId: string
  documents: KnowledgeDocument[]
}) {
  const rows = useMemo(() => documents.map(toRow), [documents])
  const columns = useMemo<ColumnDef<KnowledgeGridRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        minSize: 180,
        size: 260,
        meta: { label: "Name", cell: { variant: "short-text" }, readOnly: true },
      },
      {
        id: "size",
        accessorKey: "size",
        header: "Size",
        minSize: 100,
        size: 120,
        meta: { label: "Size", cell: { variant: "short-text" }, readOnly: true },
      },
      {
        id: "uploadedAt",
        accessorKey: "uploadedAt",
        header: "Uploaded At",
        minSize: 160,
        size: 220,
        meta: { label: "Uploaded At", cell: { variant: "short-text" }, readOnly: true },
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
        applyKnowledgeGridRows(
          baseId,
          next.map((row) => ({ id: row.id, name: row.name }))
        )
      }}
      onRowsDelete={(deleted) => {
        removeKnowledgeDocuments(deleted.map((row) => row.id))
      }}
    />
  )
}
