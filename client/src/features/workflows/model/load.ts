/** Controllable workflows list load for skeleton/error/retry + tests. */

export type WorkflowsLoadStatus = "loading" | "ready" | "error"

let failNext = false

export function failNextWorkflowsLoad(): void {
  failNext = true
}

export function resetWorkflowsLoadFlags(): void {
  failNext = false
}

export function humanizeWorkflowsLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return "We couldn't load your workflows. Check your connection and try again."
}

/** Resolves immediately so the page can paint a skeleton, then ready/error. */
export async function loadWorkflowsList(): Promise<void> {
  await Promise.resolve()
  if (failNext) {
    failNext = false
    throw new Error(humanizeWorkflowsLoadError(null))
  }
}
