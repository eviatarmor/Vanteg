/** Controllable integrations list load for skeleton/error/retry + tests. */

export type IntegrationsLoadStatus = "loading" | "ready" | "error"

let failNext = false

export function failNextIntegrationsLoad(): void {
  failNext = true
}

export function resetIntegrationsLoadFlags(): void {
  failNext = false
}

export function humanizeIntegrationsLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return "We couldn't load your connectors. Check your connection and try again."
}

/** Resolves immediately so the page can paint a skeleton, then ready/error. */
export async function loadIntegrationsList(): Promise<void> {
  await Promise.resolve()
  if (failNext) {
    failNext = false
    throw new Error(humanizeIntegrationsLoadError(null))
  }
}
