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

const GITHUB_REPOS: readonly ResourceOption[] = [
  { value: "acme/app", label: "acme/app" },
  { value: "acme/api", label: "acme/api" },
  { value: "acme/docs", label: "acme/docs" },
  { value: "acme/infra", label: "acme/infra" },
]

const SHEETS: readonly ResourceOption[] = [
  { value: "Leads", label: "Leads" },
  { value: "Pipeline", label: "Pipeline" },
  { value: "Customers", label: "Customers" },
  { value: "Events", label: "Events" },
]

const DISCORD_CHANNELS: readonly ResourceOption[] = [
  { value: "#alerts", label: "#alerts - Alerts" },
  { value: "#general", label: "#general" },
  { value: "#engineering", label: "#engineering" },
  { value: "#support", label: "#support" },
]

const NOTION_PAGES: readonly ResourceOption[] = [
  { value: "Tasks", label: "Tasks" },
  { value: "Specs", label: "Specs" },
  { value: "Meeting notes", label: "Meeting notes" },
  { value: "Roadmap", label: "Roadmap" },
]

const CALENDARS: readonly ResourceOption[] = [
  { value: "primary", label: "Primary" },
  { value: "team", label: "Team" },
  { value: "hiring", label: "Hiring" },
  { value: "support", label: "Support on-call" },
]

const FORMS: readonly ResourceOption[] = [
  { value: "contact-form", label: "Contact form" },
  { value: "nps", label: "NPS survey" },
  { value: "signup", label: "Signup" },
  { value: "feedback", label: "Product feedback" },
]

const CATALOG: Record<string, readonly ResourceOption[]> = {
  "slack.channel": SLACK_CHANNELS,
  "github.repo": GITHUB_REPOS,
  "sheets.sheet": SHEETS,
  "discord.channel": DISCORD_CHANNELS,
  "notion.page": NOTION_PAGES,
  "calendar.calendar": CALENDARS,
  "forms.form": FORMS,
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
