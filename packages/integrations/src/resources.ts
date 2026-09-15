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

const TEAMS_TEAMS: readonly ResourceOption[] = [
  { value: "acme-ops", label: "Acme Ops" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
]

const TEAMS_CHANNELS: readonly ResourceOption[] = [
  { value: "General", label: "General" },
  { value: "incidents", label: "incidents" },
  { value: "deals", label: "deals" },
  { value: "standup", label: "standup" },
]

const FORMS: readonly ResourceOption[] = [
  { value: "contact-form", label: "Contact form" },
  { value: "nps", label: "NPS survey" },
  { value: "signup", label: "Signup" },
  { value: "feedback", label: "Product feedback" },
]

const SPREADSHEETS: readonly ResourceOption[] = [
  { value: "1vanteg-demo-sheet", label: "Leads workbook" },
  { value: "1vanteg-pipeline", label: "Pipeline" },
  { value: "1vanteg-customers", label: "Customers" },
]

const DRIVE_FOLDERS: readonly ResourceOption[] = [
  { value: "Inbox", label: "Inbox" },
  { value: "Clients", label: "Clients" },
  { value: "Docs", label: "Docs" },
  { value: "Exports", label: "Exports" },
]

const GITHUB_BRANCHES: readonly ResourceOption[] = [
  { value: "main", label: "main" },
  { value: "develop", label: "develop" },
  { value: "release", label: "release" },
]

const NOTION_DATABASES: readonly ResourceOption[] = [
  { value: "Tasks", label: "Tasks" },
  { value: "CRM", label: "CRM" },
  { value: "Specs", label: "Specs" },
]

const AIRTABLE_BASES: readonly ResourceOption[] = [
  { value: "CRM", label: "CRM" },
  { value: "Ops", label: "Ops" },
  { value: "Hiring", label: "Hiring" },
]

const AIRTABLE_TABLES: readonly ResourceOption[] = [
  { value: "Leads", label: "Leads" },
  { value: "Deals", label: "Deals" },
  { value: "Companies", label: "Companies" },
]

const CATALOG: Record<string, readonly ResourceOption[]> = {
  "slack.channel": SLACK_CHANNELS,
  "github.repo": GITHUB_REPOS,
  "github.branch": GITHUB_BRANCHES,
  "sheets.sheet": SHEETS,
  "sheets.spreadsheet": SPREADSHEETS,
  "drive.folder": DRIVE_FOLDERS,
  "discord.channel": DISCORD_CHANNELS,
  "notion.page": NOTION_PAGES,
  "notion.database": NOTION_DATABASES,
  "airtable.base": AIRTABLE_BASES,
  "airtable.table": AIRTABLE_TABLES,
  "calendar.calendar": CALENDARS,
  "forms.form": FORMS,
  "teams.team": TEAMS_TEAMS,
  "teams.channel": TEAMS_CHANNELS,
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
