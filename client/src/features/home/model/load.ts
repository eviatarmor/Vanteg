/** Controllable home overview load for skeletons + tests. */

export type HomeLoadStatus = "loading" | "ready" | "error"

let failNext = false

export function failNextHomeLoad(): void {
  failNext = true
}

export function resetHomeLoadFlags(): void {
  failNext = false
}

export function humanizeHomeLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return "We couldn't load workspace stats. Check your connection and try again."
}

/** Resolves immediately so UI can show a skeleton, then ready/error. */
export async function loadHomeOverview(): Promise<void> {
  await Promise.resolve()
  if (failNext) {
    failNext = false
    throw new Error(humanizeHomeLoadError(null))
  }
}
