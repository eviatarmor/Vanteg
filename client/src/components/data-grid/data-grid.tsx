"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { DataGridColumnHeader } from "@/components/data-grid/data-grid-column-header";
import { DataGridContextMenu } from "@/components/data-grid/data-grid-context-menu";
import { DataGridPasteDialog } from "@/components/data-grid/data-grid-paste-dialog";
import { DataGridRow } from "@/components/data-grid/data-grid-row";
import { DataGridSearch } from "@/components/data-grid/data-grid-search";
import { useAsRef } from "@/hooks/use-as-ref";
import type { useDataGrid } from "@/hooks/use-data-grid";
import {
  flexRender,
  getColumnBorderVisibility,
  getColumnPinningStyle,
  getColumnWidthStyle,
} from "@/lib/data-grid";
import { cn } from "@workspace/ui/lib/utils";
import type { Direction } from "@/types/data-grid";

const EMPTY_CELL_SELECTION_SET = new Set<string>();
const COLUMN_DND_MIME = "application/x-vanteg-column";
const ADD_COLUMN_DROP_ID = "__add-column__";

type ColumnDropIndicator = {
  overId: string;
  edge: "start" | "end";
};

function dropEdgeFromPoint(event: React.DragEvent): "start" | "end" {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX > rect.left + rect.width / 2 ? "end" : "start";
}

function insertTargetId(
  overId: string,
  edge: "start" | "end",
  columnIds: readonly string[],
): string | null {
  if (overId === ADD_COLUMN_DROP_ID) {
    return null;
  }
  if (edge === "start") {
    return overId;
  }
  const index = columnIds.indexOf(overId);
  return index >= 0 ? (columnIds[index + 1] ?? null) : null;
}

function dropIndicatorClass(indicator: ColumnDropIndicator | null, overId: string) {
  if (indicator?.overId !== overId) {
    return undefined;
  }
  return indicator.edge === "start"
    ? "shadow-[inset_2px_0_0_0_var(--color-primary)]"
    : "shadow-[inset_-2px_0_0_0_var(--color-primary)]";
}

interface DataGridProps<TData>
  extends Omit<ReturnType<typeof useDataGrid<TData>>, "dir">,
    Omit<React.ComponentProps<"div">, "contextMenu"> {
  dir?: Direction;
  height?: number;
  stretchColumns?: boolean;
  onColumnAdd?: () => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnMove?: (columnId: string, targetColumnId: string | null) => void;
  onColumnShift?: (columnId: string, direction: -1 | 1) => void;
  flush?: boolean;
}

export function DataGrid<TData>({
  dataGridRef,
  headerRef,
  rowMapRef,
  footerRef,
  dir = "ltr",
  table,
  tableMeta,
  virtualTotalSize,
  virtualItems,
  measureElement,
  columns,
  columnSizeVars,
  searchState,
  searchMatchesByRow,
  activeSearchMatch,
  cellSelectionMap,
  focusedCell,
  editingCell,
  rowHeight,
  contextMenu,
  pasteDialog,
  onRowAdd: onRowAddProp,
  onColumnAdd: onColumnAddProp,
  onColumnDelete: onColumnDeleteProp,
  onColumnEdit: onColumnEditProp,
  onColumnMove: onColumnMoveProp,
  onColumnShift: onColumnShiftProp,
  height = 600,
  stretchColumns = false,
  adjustLayout = false,
  flush = false,
  className,
  ...props
}: DataGridProps<TData>) {
  const rows = table.getRowModel().rows;
  const readOnly = tableMeta?.readOnly ?? false;
  const columnVisibility = table.getState().columnVisibility;
  const columnPinning = table.getState().columnPinning;

  const onRowAddRef = useAsRef(onRowAddProp);
  const onColumnAddRef = useAsRef(onColumnAddProp);
  const onColumnMoveRef = useAsRef(onColumnMoveProp);
  const [dropIndicator, setDropIndicator] =
    React.useState<ColumnDropIndicator | null>(null);
  const draggingColumnIdRef = React.useRef<string | null>(null);
  const leafColumnIds = React.useMemo(
    () => table.getVisibleLeafColumns().map((column) => column.id),
    [table, columns],
  );
  const columnOrderKey = leafColumnIds.join("|");
  const canReorderColumns = Boolean(onColumnMoveProp);

  const onRowAdd = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onRowAddRef.current?.(event);
    },
    [onRowAddRef],
  );

  const onDataGridContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const onColumnAdd = React.useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.preventDefault();
      onColumnAddRef.current?.();
    },
    [onColumnAddRef],
  );

  const onColumnDragStart = React.useCallback(
    (event: React.DragEvent, columnId: string) => {
      if (!onColumnMoveRef.current) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData(COLUMN_DND_MIME, columnId);
      event.dataTransfer.setData("text/plain", columnId);
      event.dataTransfer.effectAllowed = "move";
      draggingColumnIdRef.current = columnId;
      event.currentTarget
        .closest("[data-slot='grid-header-cell']")
        ?.setAttribute("data-dragging", "true");
    },
    [onColumnMoveRef],
  );

  const clearColumnDragging = React.useCallback(() => {
    draggingColumnIdRef.current = null;
    dataGridRef.current
      ?.querySelectorAll("[data-slot='grid-header-cell'][data-dragging]")
      .forEach((node) => {
        node.removeAttribute("data-dragging");
      });
    setDropIndicator(null);
  }, [dataGridRef]);

  const onColumnDragEnd = React.useCallback(() => {
    clearColumnDragging();
  }, [clearColumnDragging]);

  const onColumnDragOver = React.useCallback(
    (event: React.DragEvent, overId: string) => {
      if (!onColumnMoveRef.current || !draggingColumnIdRef.current) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const edge =
        overId === ADD_COLUMN_DROP_ID ? "start" : dropEdgeFromPoint(event);
      setDropIndicator((current) =>
        current?.overId === overId && current.edge === edge
          ? current
          : { overId, edge },
      );
    },
    [onColumnMoveRef],
  );

  const onColumnDrop = React.useCallback(
    (event: React.DragEvent, overId: string) => {
      event.preventDefault();
      const fromId =
        draggingColumnIdRef.current ||
        event.dataTransfer.getData(COLUMN_DND_MIME) ||
        event.dataTransfer.getData("text/plain");
      const edge =
        overId === ADD_COLUMN_DROP_ID ? "start" : dropEdgeFromPoint(event);
      const targetId = insertTargetId(overId, edge, leafColumnIds);
      if (fromId && fromId !== targetId) {
        onColumnMoveRef.current?.(fromId, targetId);
      }
      clearColumnDragging();
    },
    [clearColumnDragging, leafColumnIds, onColumnMoveRef],
  );

  const onFooterCellKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onRowAddRef.current) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowAddRef.current();
      }
    },
    [onRowAddRef],
  );

  return (
    <div
      data-slot="grid-wrapper"
      dir={dir}
      {...props}
      className={cn("relative flex w-full flex-col", className)}
    >
      {searchState && <DataGridSearch {...searchState} />}
      <DataGridContextMenu
        tableMeta={tableMeta}
        columns={columns}
        contextMenu={contextMenu}
      />
      <DataGridPasteDialog tableMeta={tableMeta} pasteDialog={pasteDialog} />
      <div
        role="grid"
        aria-label="Data grid"
        aria-rowcount={rows.length + (onRowAddProp ? 1 : 0)}
        aria-colcount={columns.length + (onColumnAddProp ? 1 : 0)}
        data-slot="grid"
        tabIndex={0}
        ref={dataGridRef}
        className={cn(
          "relative grid select-none overflow-auto focus:outline-none",
          !readOnly && onRowAddProp
            ? "grid-rows-[auto_minmax(0,1fr)_auto]"
            : "grid-rows-[auto_minmax(0,1fr)]",
          flush ? "h-full rounded-none border-0" : "rounded-md border",
        )}
        style={{
          ...columnSizeVars,
          height: `${height}px`,
          maxHeight: `${height}px`,
        }}
        onContextMenu={onDataGridContextMenu}
      >
        <div
          role="rowgroup"
          data-slot="grid-header"
          ref={headerRef}
          className="sticky top-0 z-10 grid min-w-full w-max border-b bg-background"
        >
          {table.getHeaderGroups().map((headerGroup, rowIndex) => (
            <div
              key={headerGroup.id}
              role="row"
              aria-rowindex={rowIndex + 1}
              data-slot="grid-header-row"
              tabIndex={-1}
              className="flex h-9 w-max min-w-full"
            >
              {headerGroup.headers.map((header, colIndex) => {
                const sorting = table.getState().sorting;
                const currentSort = sorting.find(
                  (sort) => sort.id === header.column.id,
                );
                const isSortable = header.column.getCanSort();

                const nextHeader = headerGroup.headers[colIndex + 1];
                const isLastColumn =
                  colIndex === headerGroup.headers.length - 1;

                const { showEndBorder, showStartBorder } =
                  getColumnBorderVisibility({
                    column: header.column,
                    nextColumn: nextHeader?.column,
                    isLastColumn,
                  });

                return (
                  <div
                    key={header.id}
                    role="columnheader"
                    aria-colindex={colIndex + 1}
                    aria-sort={
                      currentSort?.desc === false
                        ? "ascending"
                        : currentSort?.desc === true
                          ? "descending"
                          : isSortable
                            ? "none"
                            : undefined
                    }
                    data-slot="grid-header-cell"
                    tabIndex={-1}
                    className={cn(
                      "relative shrink-0 data-[dragging=true]:opacity-50",
                      {
                        grow:
                          stretchColumns &&
                          !onColumnAddProp &&
                          header.column.id !== "select",
                        "border-e":
                          showEndBorder && header.column.id !== "select",
                        "border-s":
                          showStartBorder && header.column.id !== "select",
                      },
                      dropIndicatorClass(dropIndicator, header.column.id),
                    )}
                    style={{
                      ...getColumnPinningStyle({ column: header.column, dir }),
                      ...getColumnWidthStyle(
                        `--header-${header.id}-size`,
                        header.getSize(),
                      ),
                    }}
                    onDragOver={
                      canReorderColumns
                        ? (event) => onColumnDragOver(event, header.column.id)
                        : undefined
                    }
                    onDrop={
                      canReorderColumns
                        ? (event) => onColumnDrop(event, header.column.id)
                        : undefined
                    }
                    onDragLeave={() => {
                      setDropIndicator((current) =>
                        current?.overId === header.column.id ? null : current,
                      );
                    }}
                  >
                    {header.isPlaceholder ? null : typeof header.column
                        .columnDef.header === "function" ? (
                      <div className="size-full px-3 py-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    ) : (
                      <DataGridColumnHeader
                        header={header}
                        table={table}
                        draggable={canReorderColumns}
                        onDragStart={(event) =>
                          onColumnDragStart(event, header.column.id)
                        }
                        onDragEnd={onColumnDragEnd}
                        onColumnShift={onColumnShiftProp}
                        onColumnEdit={
                          readOnly || header.column.columnDef.meta?.readOnly
                            ? undefined
                            : onColumnEditProp
                        }
                        onColumnDelete={
                          readOnly || header.column.columnDef.meta?.readOnly
                            ? undefined
                            : onColumnDeleteProp
                        }
                      />
                    )}
                  </div>
                );
              })}
              {!readOnly && onColumnAddProp ? (
                <div
                  role="columnheader"
                  aria-colindex={headerGroup.headers.length + 1}
                  data-slot="grid-add-column"
                  className={cn(
                    "flex h-9 min-w-40 shrink-0 border-s bg-muted/30",
                    stretchColumns && "grow",
                    dropIndicatorClass(dropIndicator, ADD_COLUMN_DROP_ID),
                  )}
                  onDragOver={
                    canReorderColumns
                      ? (event) => onColumnDragOver(event, ADD_COLUMN_DROP_ID)
                      : undefined
                  }
                  onDrop={
                    canReorderColumns
                      ? (event) => onColumnDrop(event, ADD_COLUMN_DROP_ID)
                      : undefined
                  }
                  onDragLeave={() => {
                    setDropIndicator((current) =>
                      current?.overId === ADD_COLUMN_DROP_ID ? null : current,
                    );
                  }}
                >
                  <button
                    type="button"
                    className="flex h-9 w-full items-center gap-2 px-3 text-muted-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                    onClick={onColumnAdd}
                  >
                    <Plus className="size-3.5" />
                    <span className="text-sm">Add column</span>
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div
          role="rowgroup"
          data-slot="grid-body"
          className="relative grid min-w-full w-max"
          style={{
            height: `${virtualTotalSize}px`,
            contain: "layout paint",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index];
            if (!row) return null;

            const cellSelectionKeys =
              cellSelectionMap?.get(virtualItem.index) ??
              EMPTY_CELL_SELECTION_SET;

            const searchMatchColumns =
              searchMatchesByRow?.get(virtualItem.index) ?? null;
            const isActiveSearchRow =
              activeSearchMatch?.rowIndex === virtualItem.index;

            return (
              <DataGridRow
                key={row.id}
                row={row}
                tableMeta={tableMeta}
                rowMapRef={rowMapRef}
                virtualItem={virtualItem}
                measureElement={measureElement}
                rowHeight={rowHeight}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                focusedCell={focusedCell}
                editingCell={editingCell}
                cellSelectionKeys={cellSelectionKeys}
                searchMatchColumns={searchMatchColumns}
                activeSearchMatch={isActiveSearchRow ? activeSearchMatch : null}
                dir={dir}
                adjustLayout={adjustLayout}
                stretchColumns={stretchColumns}
                readOnly={readOnly}
                showAddColumn={Boolean(onColumnAddProp)}
                columnOrderKey={columnOrderKey}
              />
            );
          })}
        </div>
        {!readOnly && onRowAddProp && (
          <div
            role="rowgroup"
            data-slot="grid-footer"
            ref={footerRef}
            className="sticky bottom-0 z-10 grid min-w-full w-max border-t bg-background"
          >
            <div
              role="row"
              aria-rowindex={rows.length + 2}
              data-slot="grid-add-row"
              tabIndex={-1}
              className="flex w-max min-w-full"
            >
              <div
                role="gridcell"
                tabIndex={0}
                className={cn(
                  "relative flex h-9 items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                  !onColumnAddProp && "grow",
                )}
                style={{
                  width: table.getTotalSize(),
                  minWidth: table.getTotalSize(),
                }}
                onClick={onRowAdd}
                onKeyDown={onFooterCellKeyDown}
              >
                <div className="sticky start-0 flex items-center gap-2 px-3 text-muted-foreground">
                  <Plus className="size-3.5" />
                  <span className="text-sm">Add row</span>
                </div>
              </div>
              {onColumnAddProp ? (
                <div
                  role="gridcell"
                  data-slot="grid-add-column-footer"
                  className={cn(
                    "min-w-40 shrink-0 border-s bg-muted/30",
                    stretchColumns && "grow",
                  )}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
