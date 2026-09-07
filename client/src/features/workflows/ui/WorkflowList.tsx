import { useNavigate } from "react-router"

import type { Workflow } from "../model/types"

export function WorkflowList({ workflows }: { workflows: Workflow[] }) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-3">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          type="button"
          className="rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-muted/40"
          onClick={() => navigate(`/workflows/${workflow.id}`)}
        >
          <p className="font-medium">{workflow.name}</p>
          <p className="text-sm text-muted-foreground capitalize">{workflow.status}</p>
        </button>
      ))}
    </div>
  )
}
