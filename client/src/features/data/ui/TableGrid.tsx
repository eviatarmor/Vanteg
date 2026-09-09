import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import type { CellOpts } from "@/types/data-grid"

import {
  addTableColumn,
  addTableRow,
  deleteTableColumn,
  deleteTableRows,
  reorderTableColumn,
  shiftTableColumn,
  updateTableColumn,
  updateTableRows,
} from "../model/store"
import type { DatabaseColumn, DatabaseRow, DatabaseTable } from "../model/types"
import { AddColumnDialog } from "./AddColumnDialog"
import { FillDataGrid } from "./FillDataGrid"

function cellOpts(column: DatabaseColumn): CellOpts {
  if (column.variant === "select") {
    return { variant: "select", options: column.options ?? [] }
  }
  if (column.variant === "number") {
    return { variant: "number" }
  }
  if (column.variant === "checkbox") {
    return { variant: "checkbox" }
  }
  if (column.variant === "date") {
    return { variant: "date" }
  }
  if (column.variant === "time") {
    return { variant: "time", showSeconds: column.showSeconds }
  }
  if (column.variant === "datetime") {
    return { variant: "datetime", showSeconds: column.showSeconds }
  }
  if (column.variant === "url") {
    return { variant: "url", regex: column.regex }
  }
  if (column.variant === "long-text") {
    return { variant: "long-text" }
  }
  if (column.variant === "secret") {
    return { variant: "secret" }
  }
  return { variant: "short-text", regex: column.regex }
}

export function TableGrid({ table }: { table: DatabaseTable }) {
  const [columnDialog, setColumnDialog] = useState<"add" | string | null>(null)
  const editingColumn =
    columnDialog && columnDialog !== "add"
      ? table.columns.find((column) => column.id === columnDialog)
      : undefined

  const columns = useMemo<ColumnDef<DatabaseRow>[]>(
    () =>
      table.columns.map((column) => ({
        id: column.id,
        accessorKey: column.id,
        header: column.name,
        minSize: column.system ? 180 : 120,
        size: column.system ? 220 : 180,
        meta: {
          label: column.name,
          cell: cellOpts(column),
          readOnly: Boolean(column.system),
        },
      })),
    [table.columns]
  )

  return (
    <FillDataGrid
      data={table.rows}
      columns={columns}
      getRowId={(row) => row.id}
      onDataChange={(rows) => {
        updateTableRows(
          table.id,
          rows.map((row) => ({ ...row }))
        )
      }}
      onRowAdd={() => {
        addTableRow(table.id)
      }}
      onRowsDelete={(rows) => {
        deleteTableRows(
          table.id,
          rows.map((row) => row.id)
        )
      }}
      onColumnAdd={() => setColumnDialog("add")}
      onColumnEdit={(columnId) => setColumnDialog(columnId)}
      onColumnDelete={(columnId) => deleteTableColumn(table.id, columnId)}
      onColumnMove={(columnId, targetColumnId) => {
        reorderTableColumn(table.id, columnId, targetColumnId)
      }}
      onColumnShift={(columnId, direction) => {
        shiftTableColumn(table.id, columnId, direction)
      }}
    >
      <AddColumnDialog
        open={columnDialog !== null}
        column={editingColumn}
        onOpenChange={(open) => {
          if (!open) {
            setColumnDialog(null)
          }
        }}
        onAdd={(input) => {
          if (columnDialog && columnDialog !== "add") {
            updateTableColumn(table.id, columnDialog, input)
            return
          }
          addTableColumn(table.id, input)
        }}
      />
    </FillDataGrid>
  )
}
