import { Check, FlaskConical, History, Loader2, Play, Rocket } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { startMockRun } from "../model/run-store"
import { getWorkflow, saveWorkflow, useWorkflows } from "../model/store"
import { workflowStatusLabel } from "../model/status-labels"
import type { WorkflowStatus } from "../model/types"

export type WorkflowSaveState = "idle" | "saving" | "saved"

const statusBadgeClass: Record<WorkflowStatus, string> = {
  draft: "border-transparent bg-muted text-muted-foreground",
  dev: "border-transparent bg-amber-200/90 text-amber-950",
  prod: "border-transparent bg-emerald-200/90 text-emerald-950",
}

export function WorkflowRunBar({
  workflowId,
  workflowName,
  saveState = "idle",
  onOpenHistory,
}: {
  workflowId: string
  workflowName: string
  saveState?: WorkflowSaveState
  onOpenHistory?: () => void
}) {
  useWorkflows()
  const workflow = getWorkflow(workflowId)
  const status = workflow?.status ?? "draft"
  const isPublished = status === "prod"

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1 shadow-sm">
      <Badge
        variant="secondary"
        className={statusBadgeClass[status]}
        title={workflowStatusLabel[status]}
      >
        {workflowStatusLabel[status]}
      </Badge>
      <span
        className="flex min-w-16 items-center gap-1 px-1 text-xs text-muted-foreground"
        aria-live="polite"
        data-testid="workflow-save-status"
      >
        {saveState === "saving" ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Saving…
          </>
        ) : null}
        {saveState === "saved" ? (
          <>
            <Check className="size-3.5 text-emerald-600" aria-hidden />
            Saved
          </>
        ) : null}
        {saveState === "idle" ? <span className="sr-only">Save idle</span> : null}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toast.message(`Tested ${workflowName}`)}
      >
        <FlaskConical />
        Test
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          startMockRun({ workflowId, workflowName, triggerLabel: "Manual" })
          toast.success(`Running ${workflowName}`)
        }}
      >
        <Play />
        Run
      </Button>
      {onOpenHistory ? (
        <Button type="button" variant="outline" size="sm" onClick={onOpenHistory}>
          <History />
          History
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant={isPublished ? "outline" : "default"}
        onClick={() => {
          saveWorkflow(workflowId, { status: "prod" })
          toast.success(
            isPublished
              ? `Re-published ${workflowName}`
              : `Published ${workflowName}`
          )
        }}
      >
        <Rocket />
        {isPublished ? "Published" : "Publish"}
      </Button>
    </div>
  )
}
