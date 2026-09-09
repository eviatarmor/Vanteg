export interface HomeSuggestion {
  id: string
  title: string
  body: string
  href: string
  action: string
}

export const homeSuggestions: HomeSuggestion[] = [
  {
    id: "suggest-failed-http",
    title: "Route failed HTTP Request runs to Support copilot",
    body: "Runs that stop on HTTP Request sit in Inbox. An agent can read the error, retry, or ask you only when it cannot recover.",
    href: "/agents/agent-support",
    action: "Open Support copilot",
  },
  {
    id: "suggest-slack-renew",
    title: "Remind you before Slack credentials expire",
    body: "Form intake still depends on Slack. A short workflow can warn you a week out instead of failing mid-run.",
    href: "/integrations",
    action: "Open Integrations",
  },
  {
    id: "suggest-webhook-team",
    title: "Have the engineering team inspect inbound webhooks",
    body: "Payloads already land on Form intake. The SWE team can review them before anything is written to Data.",
    href: "/teams/team-swe",
    action: "Open engineering team",
  },
]
