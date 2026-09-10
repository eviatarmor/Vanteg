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
    body: "Form intake still depends on Slack. A short workflow can warn you a week out instead of failing mid-run — start from Integrations.",
    href: "/integrations",
    action: "Open Connectors",
  },
  {
    id: "suggest-webhook-team",
    title: "Have the engineering team inspect inbound webhooks",
    body: "Payloads already land on Form intake. The SWE team can review them before anything is written to Data, with clear ownership on each step.",
    href: "/teams/team-swe",
    action: "Open engineering team",
  },
  {
    id: "suggest-blank-workflow",
    title: "Start a workflow from a blank canvas",
    body: "Triggers, actions, and agents wire up on the canvas. Open Workflows and create a draft instead of starting from a playbook.",
    href: "/workflows",
    action: "Open Workflows",
  },
]
