"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"

export type CascaderNode = {
  value: string
  label: string
  children?: CascaderNode[]
}

function findPath(items: CascaderNode[], value: string): CascaderNode[] {
  for (const item of items) {
    if (item.value === value) {
      return [item]
    }
    if (item.children?.length) {
      const nested = findPath(item.children, value)
      if (nested.length > 0) {
        return [item, ...nested]
      }
    }
  }
  return []
}

function parentOf(items: CascaderNode[], value: string): CascaderNode | null {
  const path = findPath(items, value)
  if (path.length < 2) {
    return null
  }
  return path[path.length - 2] ?? null
}

function itemClassName(active: boolean) {
  return cn(
    "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-left text-sm outline-hidden select-none",
    active
      ? "bg-accent text-accent-foreground"
      : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
  )
}

function CascaderColumn({
  items,
  value,
  activeValue,
  labelledBy,
  onHover,
  onSelect,
}: {
  items: CascaderNode[]
  value?: string
  activeValue?: string
  labelledBy?: string
  onHover: (item: CascaderNode) => void
  onSelect: (item: CascaderNode) => void
}) {
  return (
    <div
      role="listbox"
      aria-labelledby={labelledBy}
      className="flex min-w-36 flex-col p-1"
    >
      {items.map((item) => {
        const selected = item.value === value
        const expanded = item.value === activeValue
        const hasChildren = Boolean(item.children?.length)
        return (
          <button
            key={item.value}
            type="button"
            role="option"
            aria-selected={selected}
            aria-haspopup={hasChildren ? "listbox" : undefined}
            aria-expanded={hasChildren ? expanded : undefined}
            className={itemClassName(expanded || selected)}
            onMouseEnter={() => onHover(item)}
            onFocus={() => onHover(item)}
            onClick={() => onSelect(item)}
          >
            <span className="flex-1 truncate">{item.label}</span>
            {hasChildren ? (
              <ChevronRightIcon className="absolute right-2 size-4 text-muted-foreground" />
            ) : selected ? (
              <CheckIcon className="absolute right-2 size-4" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function Cascader({
  items,
  value,
  onValueChange,
  placeholder = "Select",
  id,
  className,
  "aria-label": ariaLabel,
}: {
  items: CascaderNode[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  id?: string
  className?: string
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)
  const path = value ? findPath(items, value) : []
  const selected = path.at(-1)
  const defaultBranch = value ? parentOf(items, value) : null
  const [branch, setBranch] = React.useState<CascaderNode | null>(defaultBranch)

  React.useEffect(() => {
    if (open) {
      setBranch(value ? parentOf(items, value) : null)
    }
  }, [open, value, items])

  function hoverItem(item: CascaderNode) {
    setBranch(item.children?.length ? item : null)
  }

  function selectItem(item: CascaderNode) {
    if (item.children?.length) {
      setBranch(item)
      return
    }
    onValueChange(item.value)
    setOpen(false)
  }

  const label = path.map((item) => item.label).join(" / ")

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-card py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? label : placeholder}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="flex w-auto flex-row gap-0 p-0"
      >
        <CascaderColumn
          items={items}
          value={value}
          activeValue={branch?.value}
          labelledBy={id}
          onHover={hoverItem}
          onSelect={selectItem}
        />
        {branch?.children?.length ? (
          <div className="border-l border-border">
            <CascaderColumn
              items={branch.children}
              value={value}
              onHover={() => undefined}
              onSelect={selectItem}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
