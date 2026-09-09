import { NavLink } from "react-router"

import { cn } from "@workspace/ui/lib/utils"

import type { Team } from "../model/types"

export function TeamList({
  teams,
  selectedId,
}: {
  teams: Team[]
  selectedId?: string
}) {
  if (teams.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">No teams yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use New team to create your first graph.
        </p>
      </div>
    )
  }

  return (
    <nav aria-label="Teams" className="grid min-w-0 gap-1 p-2">
      {teams.map((team) => (
        <NavLink
          key={team.id}
          to={`/teams/${team.id}`}
          title={team.description || team.name}
          className={cn(
            "min-w-0 overflow-hidden rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/70",
            selectedId === team.id && "bg-muted font-medium"
          )}
        >
          <span className="block truncate">{team.name}</span>
          {team.description ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
              {team.description}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
