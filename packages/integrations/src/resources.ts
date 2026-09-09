/** Connection-scoped resource options for MethodField control: "resource". */

export interface ResourceOption {
  value: string
  label: string
}

const SLACK_CHANNELS: readonly ResourceOption[] = [
  { value: "#ops", label: "#ops - Operations" },
  { value: "#incidents", label: "#incidents - Incident response" },
  { value: "#deals", label: "#deals - Sales pipeline" },
  { value: "#eng", label: "#eng - Engineering" },
  { value: "#support", label: "#support - Customer support" },
  { value: "#general", label: "#general" },
]

const CATALOG: Record<string, readonly ResourceOption[]> = {
  "slack.channel": SLACK_CHANNELS,
}

/** Synchronous mock catalog used by the workflow Setup resource picker. */
export function listResources(resourceType: string): ResourceOption[] {
  const rows = CATALOG[resourceType]
  if (!rows) {
    return []
  }
  return rows.map((row) => ({ ...row }))
}

/** Known resourceType keys with mock data (for tests / docs). */
export function listResourceTypes(): string[] {
  return Object.keys(CATALOG).sort()
}
