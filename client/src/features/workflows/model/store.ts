import { useSyncExternalStore } from "react"

import { createVantegNode } from "./create-node"
import type { Workflow, WorkflowStatus } from "./types"

let workflows: Workflow[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function nextName(): string {
  const names = new Set(workflows.map((workflow) => workflow.name))
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
  workflows = [workflow, ...workflows]
  emit()
  return workflow
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((workflow) => workflow.id === id)
}

export function listWorkflows(
  status?: WorkflowStatus | readonly WorkflowStatus[]
): Workflow[] {
  if (!status) {
    return workflows
  }
  const allowed = new Set(Array.isArray(status) ? status : [status])
  return workflows.filter((workflow) => allowed.has(workflow.status))
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
  workflows = workflows.map((workflow) => (workflow.id === id ? next : workflow))
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
  return workflows
}

export function useWorkflows(): Workflow[] {
  return useSyncExternalStore(
    subscribeWorkflows,
    getWorkflowSnapshot,
    getWorkflowSnapshot
  )
}

export function resetWorkflows(): void {
  workflows = []
  emit()
}
