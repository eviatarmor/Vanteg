import { Bot, Plus } from "lucide-react"
import { NavLink } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import type { Agent } from "../model/types"
import { AgentIcon } from "./AgentIcon"

export function AgentList({
  agents,
  selectedId,
  onCreate,
}: {
  agents: Agent[]
  selectedId?: string
  onCreate?: () => void
}) {
  if (agents.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 px-3 py-8 text-center"
        data-testid="agents-empty-list"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Bot className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium">No agents yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create an agent to assign memory, knowledge, and tools.
          </p>
        </div>
        {onCreate ? (
          <Button type="button" size="sm" variant="outline" onClick={onCreate}>
            <Plus />
            New agent
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <nav aria-label="Agents" className="grid min-w-0 gap-1 p-2">
      {agents.map((agent) => (
        <NavLink
          key={agent.id}
          to={`/agents/${agent.id}`}
          title={agent.description || agent.name}
          className={cn(
            "min-w-0 overflow-hidden rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/70",
            selectedId === agent.id && "bg-muted font-medium"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AgentIcon id={agent.icon} className="size-3.5" />
            </span>
            <span className="min-w-0 truncate">{agent.name}</span>
          </span>
          {agent.description ? (
            <span className="mt-0.5 block truncate pl-9 text-xs font-normal text-muted-foreground">
              {agent.description}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
