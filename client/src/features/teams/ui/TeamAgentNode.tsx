import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import { cn } from "@workspace/ui/lib/utils"

import { getAgent } from "@/features/agents/model/store"
import { AgentIcon } from "@/features/agents/ui/AgentIcon"

import type { TeamNode } from "../model/types"

export const TeamAgentNode = memo(function TeamAgentNode({
  data,
  selected,
}: NodeProps<TeamNode>) {
  const agent = getAgent(data.agentId)

  return (
    <div
      className={cn(
        "min-w-52 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm",
        selected && "ring-2 ring-sidebar-primary"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2.5 !border-2 !border-background !bg-foreground"
      />
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AgentIcon id={agent?.icon ?? "bot"} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {data.role}
          </p>
          <p className="truncate text-sm font-medium">{agent?.name ?? "Missing agent"}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2.5 !border-2 !border-background !bg-foreground"
      />
    </div>
  )
})
