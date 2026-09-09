/** Connection-scoped resource options for MethodField control: "resource". */

export interface ResourceOption {
  value: string
  label: string
}

const SLACK_CHANNELS: readonly ResourceOption[] = [
  { value: "#ops", label: "#ops \u00b7 Operations" },
  { value: "#incidents", label: "#incidents \u00b7 Incident response" },
  { value: "#deals", label: "#deals \u00b7 Sales pipeline" },
  { value: "#eng", label: "#eng \u00b7 Engineering" },
  { value: "#support", label: "#support \u00b7 Customer support" },
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
