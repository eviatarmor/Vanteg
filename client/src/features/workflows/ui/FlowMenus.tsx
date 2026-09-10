import type { ReactNode } from "react"
import { Copy, Pencil, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import {
  listCommonIntegrations,
  listCommonTriggers,
  listLogicGates,
} from "../model/node-catalog"
import type { WorkflowNodeType } from "../model/types"
import { NodeIcon } from "./node-icons"

function PositionedMenu({
  open,
  x,
  y,
  onClose,
  children,
}: {
  open: boolean
  x: number
  y: number
  onClose: () => void
  children: ReactNode
}) {
  if (!open) {
    return null
  }

  return (
    <DropdownMenu open onOpenChange={(next) => !next && onClose()}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed size-px overflow-hidden opacity-0"
          style={{ left: x, top: y }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PaneAddMenu({
  open,
  x,
  y,
  onClose,
  onAdd,
  onMore,
}: {
  open: boolean
  x: number
  y: number
  onClose: () => void
  onAdd: (nodeType: WorkflowNodeType) => void
  onMore: () => void
}) {
  function choose(nodeType: WorkflowNodeType) {
    onAdd(nodeType)
    onClose()
  }

  return (
    <PositionedMenu open={open} x={x} y={y} onClose={onClose}>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Triggers</DropdownMenuLabel>
        {listCommonTriggers().map((node) => (
          <DropdownMenuItem key={node.id} onSelect={() => choose(node)}>
            <NodeIcon catalogId={node.id} />
            {node.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Logic</DropdownMenuLabel>
        {listLogicGates().map((node) => (
          <DropdownMenuItem key={node.id} onSelect={() => choose(node)}>
            <NodeIcon catalogId={node.id} />
            {node.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Connectors</DropdownMenuLabel>
        {listCommonIntegrations().map((node) => (
          <DropdownMenuItem key={node.id} onSelect={() => choose(node)}>
            <NodeIcon catalogId={node.id} />
            {node.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => {
          onMore()
          onClose()
        }}
      >
        More
      </DropdownMenuItem>
    </PositionedMenu>
  )
}

export function NodeActionMenu({
  open,
  x,
  y,
  onClose,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  open: boolean
  x: number
  y: number
  onClose: () => void
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <PositionedMenu open={open} x={x} y={y} onClose={onClose}>
      <DropdownMenuItem
        onSelect={() => {
          onOpen()
          onClose()
        }}
      >
        <Pencil />
        Open
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          onDuplicate()
          onClose()
        }}
      >
        <Copy />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onSelect={() => {
          onDelete()
          onClose()
        }}
      >
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </PositionedMenu>
  )
}
