import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import { cn } from "@workspace/ui/lib/utils"

import { getNodeType } from "../model/node-catalog"
import { getNodePorts, portColorValue } from "../model/node-ports"
import type { FreezeNode as FreezeNodeType, NodePort } from "../model/types"
import { NodeIcon } from "./node-icons"

const kindClass: Record<string, string> = {
  trigger: "border-teal-700/40 bg-teal-50 text-teal-950",
  action: "border-sky-700/40 bg-sky-50 text-sky-950",
  logic: "border-amber-700/40 bg-amber-50 text-amber-950",
}

function portOffset(index: number, count: number): string {
  return `${((index + 1) / (count + 1)) * 100}%`
}

function Ports({
  ports,
  position,
}: {
  ports: NodePort[]
  position: Position
}) {
  return (
    <>
      {ports.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type={port.type}
          position={position}
          aria-label={port.label}
          className="!size-2.5 !border-2 !border-white"
          style={{
            background: portColorValue[port.color],
            left: portOffset(index, ports.length),
          }}
        />
      ))}
    </>
  )
}

export const FreezeNode = memo(function FreezeNode({
  data,
  selected,
}: NodeProps<FreezeNodeType>) {
  const catalog = getNodeType(data.catalogId)
  const kind = catalog?.kind ?? "action"
  const ports = getNodePorts(data.catalogId)
  const targets = ports.filter((port) => port.type === "target")
  const sources = ports.filter((port) => port.type === "source")

  return (
    <div
      className={cn(
        "min-w-48 rounded-xl border px-3 py-2 shadow-sm",
        kindClass[kind],
        selected && "ring-2 ring-sidebar-primary"
      )}
    >
      {targets.length > 0 ? (
        <Ports ports={targets} position={Position.Top} />
      ) : null}
      <div className="flex items-center gap-2">
        <NodeIcon catalogId={data.catalogId} className="size-4 shrink-0 opacity-80" />
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-wide uppercase opacity-70">
            {catalog?.kind ?? "node"}
          </p>
          <p className="truncate text-sm font-medium">{data.label}</p>
        </div>
      </div>
      {sources.length > 1 ? (
        <div className="mt-1 flex justify-between gap-1 px-1">
          {sources.map((port) => (
            <span
              key={port.id}
              className="min-w-0 flex-1 truncate text-center text-[9px] font-medium uppercase opacity-70"
            >
              {port.label}
            </span>
          ))}
        </div>
      ) : null}
      {sources.length > 0 ? (
        <Ports ports={sources} position={Position.Bottom} />
      ) : null}
    </div>
  )
})

export const workflowNodeTypes = { freeze: FreezeNode }
