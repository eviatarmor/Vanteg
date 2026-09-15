import type { ReactNode } from "react"
import {
  Copy,
  GitBranch,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plug,
  Trash2,
  Zap,
} from "lucide-react"

import {
  Cascader,
  type CascaderNode,
} from "@workspace/ui/components/cascader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import {
  getNodeType,
  listCommonIntegrations,
  listCommonTriggers,
  listLogicGates,
} from "../model/node-catalog"
import type { WorkflowNodeType } from "../model/types"
import { NodeIcon } from "./node-icons"

const MORE_VALUE = "__more__"
const OTHERS_VALUE = "__others__"

function toCascaderItem(node: WorkflowNodeType): CascaderNode {
  return {
    value: node.id,
    label: node.label,
    icon: <NodeIcon catalogId={node.id} />,
  }
}

function paneAddItems(): CascaderNode[] {
  return [
    {
      value: "trigger",
      label: "Trigger",
      icon: <Zap />,
      children: listCommonTriggers().map(toCascaderItem),
    },
    {
      value: "logic",
      label: "Logic",
      icon: <GitBranch />,
      children: listLogicGates().map(toCascaderItem),
    },
    {
      value: "connectors",
      label: "Connectors",
      icon: <Plug />,
      children: [
        ...listCommonIntegrations().map(toCascaderItem),
        { value: MORE_VALUE, label: "More", icon: <MoreHorizontal /> },
      ],
    },
    { value: OTHERS_VALUE, label: "Others", icon: <LayoutGrid /> },
  ]
}

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
      <DropdownMenuContent align="start" className="min-w-44">
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
  if (!open) {
    return null
  }

  function choose(value: string) {
    if (value === MORE_VALUE || value === OTHERS_VALUE) {
      onMore()
      onClose()
      return
    }
    const node = getNodeType(value)
    if (node) {
      onAdd(node)
    }
    onClose()
  }

  return (
    <Cascader
      open
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      items={paneAddItems()}
      onValueChange={choose}
      aria-label="Add a step"
    >
      <span
        aria-hidden
        className="pointer-events-none fixed size-px overflow-hidden opacity-0"
        style={{ left: x, top: y }}
      />
    </Cascader>
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
