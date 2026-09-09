import { useEffect, useRef, useState, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGrid } from "@/components/data-grid/data-grid"
import { useDataGrid } from "@/hooks/use-data-grid"
import { DirectionProvider } from "@workspace/ui/components/direction"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

export function FillDataGrid<TData>({
  data,
  columns,
  getRowId,
  onDataChange,
  onRowAdd,
  onRowsDelete,
  onColumnAdd,
  onColumnDelete,
  onColumnEdit,
  onColumnMove,
  onColumnShift,
  children,
}: {
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowId: (row: TData) => string
  onDataChange?: (rows: TData[]) => void
  onRowAdd?: () => void
  onRowsDelete?: (rows: TData[]) => void
  onColumnAdd?: () => void
  onColumnDelete?: (columnId: string) => void
  onColumnEdit?: (columnId: string) => void
  onColumnMove?: (columnId: string, targetColumnId: string | null) => void
  onColumnShift?: (columnId: string, direction: -1 | 1) => void
  children?: ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(480)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }
    const update = () => {
      const next = Math.max(240, Math.floor(element.clientHeight))
      setHeight((current) => (current === next ? current : next))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const { table: gridTable, ...dataGridProps } = useDataGrid({
    data,
    columns,
    getRowId,
    onDataChange,
    onRowAdd: onRowAdd
      ? () => {
          onRowAdd()
          return null
        }
      : undefined,
    onRowsDelete: onRowsDelete
      ? (rows) => {
          onRowsDelete(rows)
        }
      : undefined,
    autoFocus: false,
  })

  return (
    <div ref={containerRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <TooltipProvider>
        <DirectionProvider dir="ltr">
          <DataGrid
            table={gridTable}
            {...dataGridProps}
            height={height}
            stretchColumns
            flush
            className="h-full"
            onColumnAdd={onColumnAdd}
            onColumnDelete={onColumnDelete}
            onColumnEdit={onColumnEdit}
            onColumnMove={onColumnMove}
            onColumnShift={onColumnShift}
          />
        </DirectionProvider>
      </TooltipProvider>
      {children}
    </div>
  )
}
