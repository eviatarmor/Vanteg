import { useSyncExternalStore } from "react"

import type { RunStatus, RunsLoadState, WorkflowRun } from "./run-types"

export const WORKFLOW_RUNS_STORAGE_KEY = "vanteg.workflow-runs"

const listeners = new Set<() => void>()

let runs: WorkflowRun[] = []
let loadState: RunsLoadState = "loading"
let hydrated = false
let completeTimers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function persist(): void {
  if (typeof localStorage === "undefined") {
    return
  }
  localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, JSON.stringify(runs))
}

function createSeedRuns(): WorkflowRun[] {
  const now = Date.now()
  return [
    {
      id: "run-demo-success",
      workflowId: "demo-lead-alerts",
      workflowName: "Lead alerts",
      status: "success",
      startedAt: now - 1000 * 60 * 45,
      durationMs: 1840,
      triggerLabel: "Webhook",
      steps: [
        { id: "s1", label: "Webhook", status: "success", durationMs: 42 },
        { id: "s2", label: "If", status: "success", durationMs: 18 },
        { id: "s3", label: "Send message", status: "success", durationMs: 1780 },
      ],
      inputs: [
        { key: "email", value: "lead@acme.com" },
        { key: "apiKey", value: "sk-demo-secret", secret: true },
      ],
      outputs: [
        { key: "messageId", value: "msg_91a2" },
        { key: "channel", value: "#sales" },
      ],
    },
    {
      id: "run-demo-failed",
      workflowId: "demo-invoice-sync",
      workflowName: "Invoice sync",
      status: "failed",
      startedAt: now - 1000 * 60 * 120,
      durationMs: 920,
      triggerLabel: "Schedule",
      errorMessage: "HTTP Request returned 401 Unauthorized",
      steps: [
        { id: "s1", label: "Schedule", status: "success", durationMs: 12 },
        {
          id: "s2",
          label: "HTTP Request",
          status: "failed",
          durationMs: 908,
          errorMessage: "401 Unauthorized",
        },
      ],
      inputs: [
        { key: "invoiceId", value: "inv_204" },
        { key: "token", value: "tok_live_abc", secret: true },
      ],
      outputs: [],
    },
    {
      id: "run-demo-running",
      workflowId: "demo-onboarding",
      workflowName: "Onboarding drip",
      status: "running",
      startedAt: now - 1000 * 12,
      triggerLabel: "Manual",
      steps: [
        { id: "s1", label: "Manual", status: "success", durationMs: 8 },
        { id: "s2", label: "Send email", status: "running" },
      ],
      inputs: [{ key: "userId", value: "usr_18" }],
      outputs: [],
    },
  ]
}

export function retryWorkflowRunsLoad(): void {
  hydrated = false
  loadState = "loading"
  emit()
  hydrateWorkflowRuns()
  emit()
}

export function hydrateWorkflowRuns(): void {
  if (hydrated) {
    return
  }
  hydrated = true

  try {
    if (typeof localStorage === "undefined") {
      runs = createSeedRuns()
      loadState = "ready"
      return
    }
    const raw = localStorage.getItem(WORKFLOW_RUNS_STORAGE_KEY)
    if (!raw) {
      runs = createSeedRuns()
      persist()
    } else {
      const parsed = JSON.parse(raw) as WorkflowRun[]
      runs = Array.isArray(parsed) && parsed.length > 0 ? parsed : createSeedRuns()
      if (!Array.isArray(parsed) || parsed.length === 0) {
        persist()
      }
    }
    loadState = "ready"
  } catch {
    runs = []
    loadState = "error"
  }
}

export function subscribeWorkflowRuns(listener: () => void): () => void {
  hydrateWorkflowRuns()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getWorkflowRunsSnapshot(): WorkflowRun[] {
  hydrateWorkflowRuns()
  return runs
}

export function getRunsLoadState(): RunsLoadState {
  hydrateWorkflowRuns()
  return loadState
}

export function useWorkflowRuns(): WorkflowRun[] {
  return useSyncExternalStore(
    subscribeWorkflowRuns,
    getWorkflowRunsSnapshot,
    getWorkflowRunsSnapshot
  )
}

export function useRunsLoadState(): RunsLoadState {
  return useSyncExternalStore(
    subscribeWorkflowRuns,
    getRunsLoadState,
    getRunsLoadState
  )
}

export function listWorkflowRuns(workflowId?: string): WorkflowRun[] {
  hydrateWorkflowRuns()
  const items = workflowId
    ? runs.filter((run) => run.workflowId === workflowId)
    : runs
  return [...items].sort((a, b) => b.startedAt - a.startedAt)
}

export function getWorkflowRun(id: string): WorkflowRun | undefined {
  hydrateWorkflowRuns()
  return runs.find((run) => run.id === id)
}

export function appendWorkflowRun(run: WorkflowRun): WorkflowRun {
  hydrateWorkflowRuns()
  runs = [run, ...runs]
  persist()
  emit()
  return run
}

export function updateWorkflowRun(
  id: string,
  patch: Partial<
    Pick<
      WorkflowRun,
      "status" | "durationMs" | "errorMessage" | "steps" | "outputs"
    >
  >
): WorkflowRun | undefined {
  hydrateWorkflowRuns()
  const current = runs.find((run) => run.id === id)
  if (!current) {
    return undefined
  }
  const next = { ...current, ...patch }
  runs = runs.map((run) => (run.id === id ? next : run))
  persist()
  emit()
  return next
}

function defaultSteps(triggerLabel: string): WorkflowRun["steps"] {
  return [
    { id: crypto.randomUUID(), label: triggerLabel, status: "success", durationMs: 10 },
    { id: crypto.randomUUID(), label: "Action", status: "running" },
  ]
}

/** Starts a mock run that flips from running → success after a short delay. */
export function startMockRun(input: {
  workflowId: string
  workflowName: string
  triggerLabel?: string
}): WorkflowRun {
  const triggerLabel = input.triggerLabel ?? "Manual"
  const run: WorkflowRun = {
    id: crypto.randomUUID(),
    workflowId: input.workflowId,
    workflowName: input.workflowName,
    status: "running",
    startedAt: Date.now(),
    triggerLabel,
    steps: defaultSteps(triggerLabel),
    inputs: [{ key: "trigger", value: triggerLabel }],
    outputs: [],
  }
  appendWorkflowRun(run)

  const timer = setTimeout(() => {
    completeTimers.delete(run.id)
    updateWorkflowRun(run.id, {
      status: "success",
      durationMs: 640,
      steps: [
        { id: run.steps[0]!.id, label: triggerLabel, status: "success", durationMs: 10 },
        {
          id: run.steps[1]!.id,
          label: "Action",
          status: "success",
          durationMs: 630,
        },
      ],
      outputs: [
        { key: "status", value: "ok" },
        { key: "receipt", value: `rcpt_${run.id.slice(0, 8)}` },
      ],
    })
  }, 650)
  completeTimers.set(run.id, timer)

  return run
}

export function resetWorkflowRuns(options?: { seed?: boolean }): void {
  for (const timer of completeTimers.values()) {
    clearTimeout(timer)
  }
  completeTimers.clear()
  hydrated = false
  loadState = "loading"
  runs = []
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(WORKFLOW_RUNS_STORAGE_KEY)
  }
  if (options?.seed) {
    hydrateWorkflowRuns()
  } else {
    emit()
  }
}

/** Test helper: force a load state without touching storage. */
export function setRunsLoadStateForTests(state: RunsLoadState): void {
  loadState = state
  hydrated = true
  emit()
}

export function formatRunDuration(durationMs?: number, status?: RunStatus): string {
  if (status === "running" || durationMs === undefined) {
    return "—"
  }
  if (durationMs < 1000) {
    return `${durationMs} ms`
  }
  return `${(durationMs / 1000).toFixed(1)} s`
}

export function formatRunStartedAt(startedAt: number): string {
  return new Date(startedAt).toLocaleString()
}
