"use client";

import type {
  ColumnSort,
  Header,
  SortDirection,
  SortingState,
  Table,
} from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeOffIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { getColumnVariant } from "@/lib/data-grid";
import { cn } from "@workspace/ui/lib/utils";

interface DataGridColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  header: Header<TData, TValue>;
  table: Table<TData>;
  onColumnDelete?: (columnId: string) => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnShift?: (columnId: string, direction: -1 | 1) => void;
}

export function DataGridColumnHeader<TData, TValue>({
  header,
  table,
  className,
  onPointerDown,
  onColumnDelete,
  onColumnEdit,
  onColumnShift,
  ...props
}: DataGridColumnHeaderProps<TData, TValue>) {
  const column = header.column;
  const label = column.columnDef.meta?.label
    ? column.columnDef.meta.label
    : typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id;

  const isAnyColumnResizing =
    table.getState().columnSizingInfo.isResizingColumn;

  const cellVariant = column.columnDef.meta?.cell;
  const columnVariant = getColumnVariant(cellVariant?.variant);

  const pinnedPosition = column.getIsPinned();
  const isPinnedLeft = pinnedPosition === "left";
  const isPinnedRight = pinnedPosition === "right";

  const onSortingChange = React.useCallback(
    (direction: SortDirection) => {
      table.setSorting((prev: SortingState) => {
        const existingSortIndex = prev.findIndex(
          (sort) => sort.id === column.id,
        );
        const newSort: ColumnSort = {
          id: column.id,
          desc: direction === "desc",
        };

        if (existingSortIndex >= 0) {
          const updated = [...prev];
          updated[existingSortIndex] = newSort;
          return updated;
        } else {
          return [...prev, newSort];
        }
      });
    },
    [column.id, table],
  );

  const onSortRemove = React.useCallback(() => {
    table.setSorting((prev: SortingState) =>
      prev.filter((sort) => sort.id !== column.id),
    );
  }, [column.id, table]);

  const onLeftPin = React.useCallback(() => {
    column.pin("left");
  }, [column]);

  const onRightPin = React.useCallback(() => {
    column.pin("right");
  }, [column]);

  const onUnpin = React.useCallback(() => {
    column.pin(false);
  }, [column]);

  const visibleColumns = table.getVisibleLeafColumns();
  const columnIndex = visibleColumns.findIndex((item) => item.id === column.id);
  const canMoveLeft = columnIndex > 0;
  const canMoveRight =
    columnIndex >= 0 && columnIndex < visibleColumns.length - 1;

  const onTriggerPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;

      if (event.button !== 0) {
        return;
      }
      table.options.meta?.onColumnClick?.(column.id);
    },
    [table.options.meta, column.id, onPointerDown],
  );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 px-2 py-0 text-sm hover:bg-accent/40 data-[state=open]:bg-accent/40 [&_svg]:size-4",
            isAnyColumnResizing && "pointer-events-none",
            props.draggable && "cursor-grab active:cursor-grabbing",
            className,
          )}
          onPointerDown={onTriggerPointerDown}
          {...props}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {columnVariant && (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <columnVariant.icon className="size-3.5 shrink-0 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{columnVariant.label}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <span className="truncate">{label}</span>
          </div>
          <ChevronDownIcon className="shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-60">
          {column.getCanSort() && (
            <>
              <DropdownMenuCheckboxItem
                className="relative ltr:pr-8 ltr:pl-2 rtl:pr-2 rtl:pl-8 [&>span:first-child]:ltr:right-2 [&>span:first-child]:ltr:left-auto [&>span:first-child]:rtl:right-auto [&>span:first-child]:rtl:left-2 [&_svg]:text-muted-foreground"
                checked={column.getIsSorted() === "asc"}
                onSelect={() => onSortingChange("asc")}
              >
                <ChevronUpIcon />
                Sort asc
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="relative ltr:pr-8 ltr:pl-2 rtl:pr-2 rtl:pl-8 [&>span:first-child]:ltr:right-2 [&>span:first-child]:ltr:left-auto [&>span:first-child]:rtl:right-auto [&>span:first-child]:rtl:left-2 [&_svg]:text-muted-foreground"
                checked={column.getIsSorted() === "desc"}
                onSelect={() => onSortingChange("desc")}
              >
                <ChevronDownIcon />
                Sort desc
              </DropdownMenuCheckboxItem>
              {column.getIsSorted() && (
                <DropdownMenuItem onSelect={onSortRemove}>
                  <XIcon />
                  Remove sort
                </DropdownMenuItem>
              )}
            </>
          )}
          {column.getCanPin() && (
            <>
              {column.getCanSort() && <DropdownMenuSeparator />}

              {isPinnedLeft ? (
                <DropdownMenuItem
                  className="[&_svg]:text-muted-foreground"
                  onSelect={onUnpin}
                >
                  <PinOffIcon />
                  Unpin from left
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="[&_svg]:text-muted-foreground"
                  onSelect={onLeftPin}
                >
                  <PinIcon />
                  Pin to left
                </DropdownMenuItem>
              )}
              {isPinnedRight ? (
                <DropdownMenuItem
                  className="[&_svg]:text-muted-foreground"
                  onSelect={onUnpin}
                >
                  <PinOffIcon />
                  Unpin from right
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="[&_svg]:text-muted-foreground"
                  onSelect={onRightPin}
                >
                  <PinIcon />
                  Pin to right
                </DropdownMenuItem>
              )}
            </>
          )}
          {onColumnShift ? (
            <>
              {(column.getCanSort() || column.getCanPin()) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground"
                disabled={!canMoveLeft}
                onSelect={() => onColumnShift(column.id, -1)}
              >
                <ArrowLeftIcon />
                Move left
              </DropdownMenuItem>
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground"
                disabled={!canMoveRight}
                onSelect={() => onColumnShift(column.id, 1)}
              >
                <ArrowRightIcon />
                Move right
              </DropdownMenuItem>
            </>
          ) : null}
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground"
                onSelect={() => column.toggleVisibility(false)}
              >
                <EyeOffIcon />
                Hide column
              </DropdownMenuItem>
            </>
          )}
          {onColumnEdit || onColumnDelete ? (
            <>
              <DropdownMenuSeparator />
              {onColumnEdit ? (
                <DropdownMenuItem
                  className="[&_svg]:text-muted-foreground"
                  onSelect={() => onColumnEdit(column.id)}
                >
                  <PencilIcon />
                  Edit column
                </DropdownMenuItem>
              ) : null}
              {onColumnDelete ? (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onColumnDelete(column.id)}
                >
                  <Trash2Icon />
                  Delete column
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {header.column.getCanResize() && (
        <DataGridColumnResizer header={header} table={table} label={label} />
      )}
    </>
  );
}

const DataGridColumnResizer = React.memo(
  DataGridColumnResizerImpl,
  (prev, next) => {
    const prevColumn = prev.header.column;
    const nextColumn = next.header.column;

    if (
      prevColumn.getIsResizing() !== nextColumn.getIsResizing() ||
      prevColumn.getSize() !== nextColumn.getSize()
    ) {
      return false;
    }

    if (prev.label !== next.label) return false;

    return true;
  },
) as typeof DataGridColumnResizerImpl;

interface DataGridColumnResizerProps<TData, TValue>
  extends DataGridColumnHeaderProps<TData, TValue> {
  label: string;
}

function DataGridColumnResizerImpl<TData, TValue>({
  header,
  table,
  label,
}: DataGridColumnResizerProps<TData, TValue>) {
  const defaultColumnDef = table._getDefaultColumnDef();

  const onDoubleClick = React.useCallback(() => {
    header.column.resetSize();
  }, [header.column]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuenow={header.column.getSize()}
      aria-valuemin={defaultColumnDef.minSize}
      aria-valuemax={defaultColumnDef.maxSize}
      tabIndex={0}
      className={cn(
        "absolute -end-px top-0 z-50 h-full w-0.5 cursor-ew-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:start-1/2 after:h-full after:w-[18px] after:-translate-x-1/2 after:content-[''] hover:bg-primary focus:bg-primary focus:outline-none",
        header.column.getIsResizing()
          ? "bg-primary"
          : "opacity-0 hover:opacity-100",
      )}
      draggable={false}
      onDoubleClick={onDoubleClick}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
    />
  );
}
