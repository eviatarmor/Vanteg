import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import type { CellOpts } from "@/types/data-grid"

import {
  addTableColumn,
  addTableRow,
  deleteTableColumn,
  deleteTableRows,
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
  if (column.variant === "url") {
    return { variant: "url" }
  }
  if (column.variant === "long-text") {
    return { variant: "long-text" }
  }
  if (column.variant === "secret") {
    return { variant: "secret" }
  }
  return { variant: "short-text" }
}

export function TableGrid({ table }: { table: DatabaseTable }) {
  const [addColumnOpen, setAddColumnOpen] = useState(false)

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
      onColumnAdd={() => setAddColumnOpen(true)}
      onColumnDelete={(columnId) => deleteTableColumn(table.id, columnId)}
    >
      <AddColumnDialog
        open={addColumnOpen}
        onOpenChange={setAddColumnOpen}
        onAdd={(input) => {
          addTableColumn(table.id, input)
        }}
      />
    </FillDataGrid>
  )
}
