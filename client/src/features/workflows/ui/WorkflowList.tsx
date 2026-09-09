import { useNavigate } from "react-router"

import { Badge } from "@workspace/ui/components/badge"

import { workflowStatusLabel } from "../model/status-labels"
import type { Workflow } from "../model/types"

export function WorkflowList({ workflows }: { workflows: Workflow[] }) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-3" role="list" aria-label="Workflows">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          type="button"
          role="listitem"
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-muted/40"
          onClick={() => navigate(`/workflows/${workflow.id}`)}
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{workflow.name}</p>
            <p className="text-sm text-muted-foreground">
              {workflowStatusLabel[workflow.status]}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {workflowStatusLabel[workflow.status]}
          </Badge>
        </button>
      ))}
    </div>
  )
}
