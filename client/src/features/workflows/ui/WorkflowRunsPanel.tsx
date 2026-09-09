import { History, LoaderCircle } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/features/empty-state/EmptyState"

import {
  getWorkflowRun,
  listWorkflowRuns,
  retryWorkflowRunsLoad,
  startMockRun,
  useRunsLoadState,
  useWorkflowRuns,
} from "../model/run-store"
import { WorkflowRunDetail } from "./WorkflowRunDetail"
import { WorkflowRunList } from "./WorkflowRunList"

export function WorkflowRunsPanel({
  workflowId,
  workflowName,
  showRunNow = false,
}: {
  workflowId?: string
  workflowName?: string
  showRunNow?: boolean
}) {
  const allRuns = useWorkflowRuns()
  const loadState = useRunsLoadState()
  const runs = useMemo(
    () => listWorkflowRuns(workflowId),
    [workflowId, allRuns]
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? getWorkflowRun(selectedId) : undefined
  const active = selected && runs.some((run) => run.id === selected.id) ? selected : runs[0]

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[16rem] items-center justify-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-4 animate-spin" />
        Loading runs…
      </div>
    )
  }

  if (loadState === "error") {
    return (
      <EmptyState
        icon={History}
        title="Couldn't load runs"
        description="Run history could not be read from local storage. Try again after clearing corrupted data."
        actionLabel="Try again"
        onCreate={() => retryWorkflowRunsLoad()}
        className="min-h-[16rem]"
      />
    )
  }

  if (runs.length === 0) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4">
        <EmptyState
          icon={History}
          title="No runs yet"
          description={
            workflowId
              ? "Run this workflow to see execution history here."
              : "Runs will show up here after a workflow executes."
          }
          className="min-h-0 w-full"
        />
        {showRunNow && workflowId && workflowName ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const run = startMockRun({ workflowId, workflowName })
              setSelectedId(run.id)
            }}
          >
            Run now
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {showRunNow && workflowId && workflowName ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const run = startMockRun({ workflowId, workflowName })
              setSelectedId(run.id)
            }}
          >
            Run now
          </Button>
        </div>
      ) : null}
      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <WorkflowRunList
          runs={runs}
          selectedId={active?.id}
          onSelect={setSelectedId}
        />
        {active ? <WorkflowRunDetail run={active} /> : null}
      </div>
    </div>
  )
}
