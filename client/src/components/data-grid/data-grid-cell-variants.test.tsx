import { render } from "@testing-library/react"
import type { Cell, TableMeta } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"

import { DateTimeCell, TimeCell } from "./data-grid-cell-variants"
import type { DataGridCellProps } from "@/types/data-grid"

function cellProps<TData>(
  value: string,
  variant: "time" | "datetime",
): DataGridCellProps<TData> {
  const columnId = "startsAt"
  return {
    cell: {
      getValue: () => value,
      column: {
        id: columnId,
        columnDef: {
          meta: { cell: { variant } },
        },
      },
      row: {
        id: "row-1",
        original: { [columnId]: value },
      },
    } as unknown as Cell<TData, unknown>,
    tableMeta: {} as TableMeta<TData>,
    rowIndex: 0,
    columnId,
    rowHeight: "short",
    isEditing: true,
    isFocused: true,
    isSelected: false,
    isSearchMatch: false,
    isActiveSearchMatch: false,
    readOnly: false,
  }
}

describe("time cells", () => {
  it("opens a time picker instead of the segmented input form", () => {
    render(<TimeCell {...cellProps("", "time")} />)

    expect(document.querySelector('[data-slot="time-picker-panel"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="time-picker-input-group"]')).not.toBeInTheDocument()
  })

  it("edits datetime with a calendar and inline time columns", () => {
    render(<DateTimeCell {...cellProps("", "datetime")} />)

    expect(document.querySelector('[data-slot="grid-cell-editor"], [data-grid-cell-editor]')).toBeTruthy()
    expect(document.querySelector('[data-slot="time-picker-panel"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="time-picker-input-group"]')).not.toBeInTheDocument()
  })
})
