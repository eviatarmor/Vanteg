import { Badge } from "@workspace/ui/components/badge"

import {
  formatRunDuration,
  formatRunStartedAt,
} from "../model/run-store"
import type { RunStatus, WorkflowRun } from "../model/run-types"

const statusVariant: Record<RunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failed: "destructive",
  running: "secondary",
}

export function WorkflowRunList({
  runs,
  selectedId,
  onSelect,
}: {
  runs: WorkflowRun[]
  selectedId?: string | null
  onSelect: (runId: string) => void
}) {
  return (
    <ul className="grid gap-2" aria-label="Workflow runs">
      {runs.map((run) => {
        const selected = run.id === selectedId
        return (
          <li key={run.id}>
            <button
              type="button"
              aria-pressed={selected}
              className={
                selected
                  ? "w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 text-left shadow-sm"
                  : "w-full rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-muted/40"
              }
              onClick={() => onSelect(run.id)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{run.workflowName}</p>
                <Badge variant={statusVariant[run.status]} className="capitalize">
                  {run.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {run.triggerLabel} · {formatRunStartedAt(run.startedAt)} ·{" "}
                {formatRunDuration(run.durationMs, run.status)}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
