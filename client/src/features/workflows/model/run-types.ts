export type RunStatus = "success" | "failed" | "running"

export interface RunStep {
  id: string
  label: string
  status: RunStatus
  durationMs?: number
  errorMessage?: string
}

export interface RunIoEntry {
  key: string
  value: string
  secret?: boolean
}

export interface WorkflowRun {
  id: string
  workflowId: string
  workflowName: string
  status: RunStatus
  startedAt: number
  durationMs?: number
  triggerLabel: string
  errorMessage?: string
  steps: RunStep[]
  inputs: RunIoEntry[]
  outputs: RunIoEntry[]
}

export type RunsLoadState = "loading" | "ready" | "error"
