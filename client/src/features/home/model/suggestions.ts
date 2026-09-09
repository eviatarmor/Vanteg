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
    body: "Runs that stop on HTTP Request sit in Inbox. An agent can read the error, retry, or ask you only when it cannot recover — so you decide less and ship faster.",
    href: "/agents/agent-support",
    action: "Open Support copilot",
  },
  {
    id: "suggest-slack-renew",
    title: "Remind you before Slack credentials expire",
    body: "Form intake still depends on Slack. A short workflow can warn you a week out instead of failing mid-run — start from Integrations or a template.",
    href: "/integrations",
    action: "Open Integrations",
  },
  {
    id: "suggest-webhook-team",
    title: "Have the engineering team inspect inbound webhooks",
    body: "Payloads already land on Form intake. The SWE team can review them before anything is written to Data, with clear ownership on each step.",
    href: "/teams/team-swe",
    action: "Open engineering team",
  },
  {
    id: "suggest-templates",
    title: "Start from an industry template",
    body: "Legal, sales, support, and agency playbooks ship with assistants, workflows, and teams already wired. Pick one and customize instead of building blank.",
    href: "/templates",
    action: "Browse templates",
  },
]
