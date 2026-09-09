/** Controllable inbox load for loading/error/retry + tests. */

export type InboxLoadStatus = "loading" | "ready" | "error"

let failNext = false
let decisionDelayMs = 0

export function failNextInboxLoad(): void {
  failNext = true
}

export function setInboxDecisionDelay(ms: number): void {
  decisionDelayMs = Math.max(0, ms)
}

export function getInboxDecisionDelay(): number {
  return decisionDelayMs
}

export function resetInboxLoadFlags(): void {
  failNext = false
  decisionDelayMs = 0
}

export function humanizeInboxLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return "We couldn't load your inbox. Check your connection and try again."
}

export function humanizeInboxDecisionError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return "We couldn't save that decision. Try again in a moment."
}

/** Resolves immediately so the page can paint a skeleton, then ready/error. */
export async function loadInboxItems(): Promise<void> {
  await Promise.resolve()
  if (failNext) {
    failNext = false
    throw new Error(humanizeInboxLoadError(null))
  }
}

export async function waitForInboxDecision(): Promise<void> {
  const delay = decisionDelayMs
  if (delay <= 0) {
    await Promise.resolve()
    return
  }
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay)
  })
}
