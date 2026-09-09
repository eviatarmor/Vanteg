import { render, screen } from "@testing-library/react"
import type { Cell, TableMeta } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"

import { DataGridCellWrapper } from "./data-grid-cell-wrapper"
import type { DataGridCellProps } from "@/types/data-grid"

function wrapperProps(readOnly: boolean): DataGridCellProps<{ id: string }> {
  return {
    cell: { column: { id: "createdAt", columnDef: {} }, row: { id: "row-1", original: {} } } as unknown as Cell<
      { id: string },
      unknown
    >,
    tableMeta: {} as TableMeta<{ id: string }>,
    rowIndex: 0,
    columnId: "createdAt",
    rowHeight: "short",
    isEditing: false,
    isFocused: false,
    isSelected: false,
    isSearchMatch: false,
    isActiveSearchMatch: false,
    readOnly,
  }
}

describe("DataGridCellWrapper", () => {
  it("grays out readonly cells", () => {
    const { rerender } = render(<DataGridCellWrapper {...wrapperProps(true)}>locked</DataGridCellWrapper>)

    expect(screen.getByRole("button")).toHaveAttribute("data-readonly")
    expect(screen.getByRole("button")).toHaveClass("text-muted-foreground")

    rerender(<DataGridCellWrapper {...wrapperProps(false)}>editable</DataGridCellWrapper>)

    expect(screen.getByRole("button")).not.toHaveAttribute("data-readonly")
    expect(screen.getByRole("button")).not.toHaveClass("text-muted-foreground")
  })
})
