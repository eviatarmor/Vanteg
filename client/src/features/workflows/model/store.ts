import { useEffect, useSyncExternalStore } from "react"

import { createVantegNode } from "./create-node"
import type { Workflow, WorkflowStatus } from "./types"

export type WorkflowsLoadStatus = "idle" | "loading" | "ready" | "error"

type WorkflowsSnapshot = {
  workflows: Workflow[]
  status: WorkflowsLoadStatus
  error: string | null
}

let snapshot: WorkflowsSnapshot = {
  workflows: [],
  status: "idle",
  error: null,
}
let loadPromise: Promise<void> | null = null
/** Test hook: fail the next ensureLoaded call once. */
let failNextLoad = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function nextName(): string {
  const names = new Set(snapshot.workflows.map((workflow) => workflow.name))
  if (!names.has("Untitled workflow")) {
    return "Untitled workflow"
  }
  let index = 2
  while (names.has(`Untitled workflow ${index}`)) {
    index += 1
  }
  return `Untitled workflow ${index}`
}

export function createDraft(): Workflow {
  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name: nextName(),
    status: "draft",
    nodes: [createVantegNode("manual", { x: 80, y: 160 })],
    edges: [],
    updatedAt: Date.now(),
  }
  snapshot = {
    ...snapshot,
    workflows: [workflow, ...snapshot.workflows],
    status: snapshot.status === "idle" ? "ready" : snapshot.status,
  }
  emit()
  return workflow
}

export function getWorkflow(id: string): Workflow | undefined {
  return snapshot.workflows.find((workflow) => workflow.id === id)
}

export function listWorkflows(
  status?: WorkflowStatus | readonly WorkflowStatus[]
): Workflow[] {
  if (!status) {
    return snapshot.workflows
  }
  const allowed = new Set(Array.isArray(status) ? status : [status])
  return snapshot.workflows.filter((workflow) => allowed.has(workflow.status))
}

export function saveWorkflow(
  id: string,
  patch: Partial<Pick<Workflow, "name" | "nodes" | "edges" | "status">>
): Workflow | undefined {
  const current = getWorkflow(id)
  if (!current) {
    return undefined
  }
  const next = { ...current, ...patch, updatedAt: Date.now() }
  snapshot = {
    ...snapshot,
    workflows: snapshot.workflows.map((workflow) => (workflow.id === id ? next : workflow)),
  }
  emit()
  return next
}

export function subscribeWorkflows(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getWorkflowSnapshot(): Workflow[] {
  return snapshot.workflows
}

export function getWorkflowsMeta(): Pick<WorkflowsSnapshot, "status" | "error"> {
  return { status: snapshot.status, error: snapshot.error }
}

export async function ensureLoaded(): Promise<void> {
  if (snapshot.status === "ready" || snapshot.status === "loading") {
    return loadPromise ?? Promise.resolve()
  }
  snapshot = { ...snapshot, status: "loading", error: null }
  emit()
  loadPromise = (async () => {
    try {
      // Mock hydration delay (0ms) — swap for a real listWorkflows adapter later.
      await Promise.resolve()
      if (failNextLoad) {
        failNextLoad = false
        throw new Error("Failed to load workflows")
      }
      snapshot = { ...snapshot, status: "ready", error: null }
    } catch (error) {
      snapshot = {
        ...snapshot,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load workflows",
      }
    } finally {
      loadPromise = null
      emit()
    }
  })()
  return loadPromise
}

export function retryWorkflowsLoad(): void {
  snapshot = { ...snapshot, status: "idle", error: null }
  emit()
  void ensureLoaded()
}

/** Test-only: next ensureLoaded fails once. */
export function setWorkflowsLoadFailureOnce() {
  failNextLoad = true
  snapshot = { ...snapshot, status: "idle", error: null }
  loadPromise = null
}

export function useWorkflows(): Workflow[] {
  const workflows = useSyncExternalStore(
    subscribeWorkflows,
    getWorkflowSnapshot,
    getWorkflowSnapshot
  )
  useEffect(() => {
    void ensureLoaded()
  }, [])
  return workflows
}

export function useWorkflowsStatus(): WorkflowsLoadStatus {
  return useSyncExternalStore(
    subscribeWorkflows,
    () => snapshot.status,
    () => snapshot.status
  )
}

export function useWorkflowsError(): string | null {
  return useSyncExternalStore(
    subscribeWorkflows,
    () => snapshot.error,
    () => snapshot.error
  )
}

export function resetWorkflows(): void {
  snapshot = { workflows: [], status: "idle", error: null }
  loadPromise = null
  failNextLoad = false
  emit()
}
