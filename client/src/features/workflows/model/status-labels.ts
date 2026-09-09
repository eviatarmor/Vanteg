import type { WorkflowStatus } from "./types"

/** User-facing labels for draft / publish environments. */
export const workflowStatusLabel: Record<WorkflowStatus, string> = {
  draft: "Draft",
  dev: "Development",
  prod: "Published",
}

export const workflowStatusDescription: Record<WorkflowStatus, string> = {
  draft: "Not shared — only editable as a draft",
  dev: "Running in a development environment",
  prod: "Live for production runs",
}
