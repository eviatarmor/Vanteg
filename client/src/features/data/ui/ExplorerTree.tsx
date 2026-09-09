import { useCallback, useState, type KeyboardEvent, type ReactNode } from "react"
import {
  Braces,
  ChevronRight,
  Database,
  Folder,
  FolderOpen,
  Lock,
  Table2,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { cn } from "@workspace/ui/lib/utils"

export type ExplorerIcon =
  | "database"
  | "schema"
  | "table"
  | "folder"
  | "variable"
  | "secret"

export interface ExplorerNode {
  id: string
  label: string
  icon: ExplorerIcon
  hint?: string
  children?: ExplorerNode[]
}

const icons: Record<ExplorerIcon, { closed: typeof Database; open?: typeof Database }> = {
  database: { closed: Database },
  schema: { closed: Folder, open: FolderOpen },
  table: { closed: Table2 },
  folder: { closed: Folder, open: FolderOpen },
  variable: { closed: Braces },
  secret: { closed: Lock },
}

function NodeIcon({
  icon,
  open,
}: {
  icon: ExplorerIcon
  open: boolean
}) {
  const pair = icons[icon]
  const Icon = open && pair.open ? pair.open : pair.closed
  return <Icon className="size-4 shrink-0 text-muted-foreground" />
}

function TreeItem({
  node,
  depth,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  node: ExplorerNode
  depth: number
  selectedId?: string
  expanded: Set<string>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}) {
  const children = node.children ?? []
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedId === node.id

  const select = useCallback(() => {
    if (hasChildren) {
      onToggle(node.id)
      return
    }
    onSelect(node.id)
  }, [hasChildren, node.id, onSelect, onToggle])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        if (hasChildren) {
          onToggle(node.id)
          return
        }
        onSelect(node.id)
      }
      if (hasChildren && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        event.preventDefault()
        const shouldExpand = event.key === "ArrowRight"
        if (shouldExpand !== isExpanded) {
          onToggle(node.id)
        }
      }
    },
    [hasChildren, isExpanded, node.id, onSelect, onToggle]
  )

  const row = (
    <div
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      tabIndex={0}
      onClick={select}
      onKeyDown={onKeyDown}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-left text-sm outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/50",
        isSelected && "bg-muted font-medium"
      )}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      {hasChildren ? (
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            aria-hidden="true"
            tabIndex={-1}
            className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted"
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
            />
          </button>
        </CollapsibleTrigger>
      ) : (
        <span className="size-4 shrink-0" />
      )}
      <NodeIcon icon={node.icon} open={isExpanded} />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
      {node.hint ? (
        <span className="max-w-[45%] truncate font-mono text-xs text-muted-foreground">
          {node.hint}
        </span>
      ) : null}
    </div>
  )

  if (!hasChildren) {
    return row
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={() => onToggle(node.id)}>
      {row}
      <CollapsibleContent>
        <div role="group">
          {children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ExplorerTree({
  nodes,
  selectedId,
  onSelect,
  defaultExpanded,
  readOnly = false,
  "aria-label": ariaLabel,
  header,
  className,
}: {
  nodes: ExplorerNode[]
  selectedId?: string
  onSelect?: (id: string) => void
  defaultExpanded?: Iterable<string>
  readOnly?: boolean
  "aria-label": string
  header?: ReactNode
  className?: string
}) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded))

  const onToggle = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col", className)}>
      {header}
      <ScrollFade
        role="tree"
        aria-label={ariaLabel}
        aria-readonly={readOnly || undefined}
        className="min-h-0 min-w-0 flex-1"
        viewportClassName="py-1"
      >
        {nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            onSelect={onSelect ?? (() => {})}
            onToggle={onToggle}
          />
        ))}
      </ScrollFade>
    </div>
  )
}
