import { useCallback, useState, type ReactNode } from "react"
import { Braces, Database, Folder, Lock, Table2 } from "lucide-react"

import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
  FileTreeIcon,
  FileTreeName,
} from "@/components/ai-elements/file-tree"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { cn } from "@workspace/ui/lib/utils"

export type ExplorerIcon =
  "database" | "schema" | "table" | "folder" | "variable" | "secret"

export interface ExplorerNode {
  id: string
  label: string
  icon: ExplorerIcon
  hint?: string
  children?: ExplorerNode[]
}

const leafIcons: Record<ExplorerIcon, typeof Database> = {
  database: Database,
  schema: Folder,
  table: Table2,
  folder: Folder,
  variable: Braces,
  secret: Lock,
}

function findNode(nodes: ExplorerNode[], id: string): ExplorerNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const nested = findNode(node.children, id)
      if (nested) {
        return nested
      }
    }
  }
  return undefined
}

function TreeNodes({
  nodes,
  selectedId,
  expanded,
}: {
  nodes: ExplorerNode[]
  selectedId?: string
  expanded: Set<string>
}) {
  return (
    <>
      {nodes.map((node) => {
        const children = node.children ?? []
        const hasChildren = children.length > 0
        if (hasChildren) {
          return (
            <FileTreeFolder
              key={node.id}
              path={node.id}
              name={node.label}
              aria-label={node.label}
              aria-selected={selectedId === node.id}
              aria-expanded={expanded.has(node.id)}
            >
              <TreeNodes
                nodes={children}
                selectedId={selectedId}
                expanded={expanded}
              />
            </FileTreeFolder>
          )
        }
        const Icon = leafIcons[node.icon]
        return (
          <FileTreeFile
            key={node.id}
            path={node.id}
            name={node.label}
            aria-label={node.label}
            aria-selected={selectedId === node.id}
            icon={<Icon className="size-4 text-muted-foreground" />}
          >
            <span className="size-4 shrink-0" />
            <FileTreeIcon>
              {node.icon === "folder" ? (
                <Folder className="size-4 text-muted-foreground" />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
            </FileTreeIcon>
            <FileTreeName>{node.label}</FileTreeName>
            {node.hint ? (
              <span className="ml-auto max-w-[45%] truncate font-mono text-xs text-muted-foreground">
                {node.hint}
              </span>
            ) : null}
          </FileTreeFile>
        )
      })}
    </>
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

  const handleSelect = useCallback(
    (path: string) => {
      const node = findNode(nodes, path)
      if (node?.children && node.children.length > 0) {
        setExpanded((current) => {
          const next = new Set(current)
          if (next.has(path)) {
            next.delete(path)
          } else {
            next.add(path)
          }
          return next
        })
        return
      }
      if (!readOnly) {
        onSelect?.(path)
      }
    },
    [nodes, onSelect, readOnly]
  )

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col", className)}>
      {header}
      <ScrollFade className="min-h-0 min-w-0 flex-1" viewportClassName="py-1">
        <FileTree
          data-slot="file-tree"
          aria-label={ariaLabel}
          aria-readonly={readOnly || undefined}
          className="rounded-none border-0 bg-transparent font-sans"
          expanded={expanded}
          onExpandedChange={setExpanded}
          selectedPath={selectedId}
          onSelect={handleSelect}
        >
          <TreeNodes
            nodes={nodes}
            selectedId={selectedId}
            expanded={expanded}
          />
        </FileTree>
      </ScrollFade>
    </div>
  )
}
