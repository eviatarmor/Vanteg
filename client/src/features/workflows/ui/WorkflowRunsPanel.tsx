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
import type { WorkflowRun } from "../model/run-types"
import { WorkflowRunDetail } from "./WorkflowRunDetail"
import { WorkflowRunList } from "./WorkflowRunList"

function RunsLoadingPane() {
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

function RunsErrorPane() {
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

function emptyRunsDescription(workflowId?: string) {
  if (workflowId) {
    return "Run this workflow to see execution history here."
  }
  return "Runs will show up here after a workflow executes."
}

function RunNowButton({
  workflowId,
  workflowName,
  onStarted,
}: {
  workflowId: string
  workflowName: string
  onStarted: (id: string) => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => {
        const run = startMockRun({ workflowId, workflowName })
        onStarted(run.id)
      }}
    >
      Run now
    </Button>
  )
}

function RunNowControl({
  showRunNow,
  workflowId,
  workflowName,
  onStarted,
}: {
  showRunNow: boolean
  workflowId?: string
  workflowName?: string
  onStarted: (id: string) => void
}) {
  if (!showRunNow) {
    return null
  }
  if (!workflowId) {
    return null
  }
  if (!workflowName) {
    return null
  }
  return (
    <RunNowButton
      workflowId={workflowId}
      workflowName={workflowName}
      onStarted={onStarted}
    />
  )
}

function RunsEmptyPane({
  workflowId,
  workflowName,
  showRunNow,
  onStarted,
}: {
  workflowId?: string
  workflowName?: string
  showRunNow: boolean
  onStarted: (id: string) => void
}) {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4">
      <EmptyState
        icon={History}
        title="No runs yet"
        description={emptyRunsDescription(workflowId)}
        className="min-h-0 w-full"
      />
      <RunNowControl
        showRunNow={showRunNow}
        workflowId={workflowId}
        workflowName={workflowName}
        onStarted={onStarted}
      />
    </div>
  )
}

function RunsListRunNow({
  showRunNow,
  workflowId,
  workflowName,
  onStarted,
}: {
  showRunNow: boolean
  workflowId?: string
  workflowName?: string
  onStarted: (id: string) => void
}) {
  if (!showRunNow) {
    return null
  }
  if (!workflowId) {
    return null
  }
  if (!workflowName) {
    return null
  }
  return (
    <div className="flex justify-end">
      <RunNowButton
        workflowId={workflowId}
        workflowName={workflowName}
        onStarted={onStarted}
      />
    </div>
  )
}

function RunsListPane({
  runs,
  active,
  showRunNow,
  workflowId,
  workflowName,
  onSelect,
}: {
  runs: WorkflowRun[]
  active: WorkflowRun | undefined
  showRunNow: boolean
  workflowId?: string
  workflowName?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <RunsListRunNow
        showRunNow={showRunNow}
        workflowId={workflowId}
        workflowName={workflowName}
        onStarted={onSelect}
      />
      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <WorkflowRunList
          runs={runs}
          selectedId={active?.id}
          onSelect={onSelect}
        />
        {active ? <WorkflowRunDetail run={active} /> : null}
      </div>
    </div>
  )
}

function runById(selectedId: string | null) {
  if (!selectedId) {
    return undefined
  }
  return getWorkflowRun(selectedId)
}

function activeRun(selected: WorkflowRun | undefined, runs: WorkflowRun[]) {
  if (!selected) {
    return runs[0]
  }
  if (!runs.some((run) => run.id === selected.id)) {
    return runs[0]
  }
  return selected
}

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
  const selected = runById(selectedId)
  const active = activeRun(selected, runs)

  if (loadState === "loading") {
    return <RunsLoadingPane />
  }

  if (loadState === "error") {
    return <RunsErrorPane />
  }

  if (runs.length === 0) {
    return (
      <RunsEmptyPane
        workflowId={workflowId}
        workflowName={workflowName}
        showRunNow={showRunNow}
        onStarted={setSelectedId}
      />
    )
  }

  return (
    <RunsListPane
      runs={runs}
      active={active}
      showRunNow={showRunNow}
      workflowId={workflowId}
      workflowName={workflowName}
      onSelect={setSelectedId}
    />
  )
}
