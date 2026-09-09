export type HelpFaqItem = {
  id: string
  question: string
  answer: string
  tags: string[]
}

export type HelpDocLink = {
  id: string
  title: string
  description: string
  path: string
  href: string
}

export const HELP_FAQ: HelpFaqItem[] = [
  {
    id: "what-is-vanteg",
    question: "What is Vanteg?",
    answer:
      "Vanteg is a workspace for building workflows, agents, and teams that connect your apps. Use Home for an overview, then Build and Manage sections for automations and connectors.",
    tags: ["overview", "product"],
  },
  {
    id: "connect-integration",
    question: "How do I connect an integration?",
    answer:
      "Open Integrations, pick an app, and connect with OAuth or credentials. Secrets use SecretInput so tokens stay masked. See docs/integrations.md for the connector catalog.",
    tags: ["integrations", "oauth", "connectors"],
  },
  {
    id: "api-keys",
    question: "Where do I manage API keys?",
    answer:
      "Go to API Keys under Manage. Create private or public keys for calling Vanteg from outside this workspace.",
    tags: ["api", "keys", "manage"],
  },
  {
    id: "secrets",
    question: "How should secrets and tokens be entered?",
    answer:
      "Always use SecretInput for passwords, API keys, and tokens. Never use a native password input. Details live in docs/ui-conventions.md.",
    tags: ["secrets", "security", "secretinput"],
  },
  {
    id: "theme",
    question: "How do I change the theme?",
    answer:
      "Open Settings → Appearance and choose Light, Dark, or System. You can also press D when focus is not in a text field.",
    tags: ["theme", "appearance", "settings"],
  },
  {
    id: "workflows",
    question: "How do workflows start?",
    answer:
      "Create a workflow from Workflows, add triggers and actions on the canvas, then test or deploy from the toolbar. Inbox collects approvals from running work.",
    tags: ["workflows", "automation", "inbox"],
  },
  {
    id: "agents-teams",
    question: "What is the difference between Agents and Teams?",
    answer:
      "Agents are individual assistants you configure. Teams orchestrate multiple agents as a graph with roles, similar to a lead and senior SWE pairing.",
    tags: ["agents", "teams"],
  },
  {
    id: "export-data",
    question: "How do I export my data?",
    answer:
      "Open Settings → Privacy & data and choose Request export. When the mock job finishes, download the JSON package. For formal GDPR/CCPA access, use Settings → Compliance to queue an access or export request.",
    tags: ["export", "gdpr", "ccpa", "privacy", "compliance", "data"],
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      "Settings → Privacy & data → Delete account asks for confirmation, then marks the mock account for deletion. Production deletions follow the DPA timeline after identity verification.",
    tags: ["delete", "account", "gdpr", "privacy", "compliance"],
  },
  {
    id: "dpa",
    question: "Where is the Data Processing Agreement (DPA)?",
    answer:
      "Settings → Compliance links to the stub DPA at vanteg.app/legal/dpa. The same section lists subprocessors and an audit log viewer for compliance reviews.",
    tags: ["dpa", "compliance", "legal", "subprocessors"],
  },
  {
    id: "billing-plan",
    question: "How does billing and upgrading work?",
    answer:
      "Settings → Billing shows your Free or Pro plan, usage meters, invoice stubs, and a masked payment method. Upgrade to Pro is a local mock — no real card processor runs. Update payment only stores last-four digits for demos.",
    tags: ["billing", "plan", "pro", "invoices", "payment"],
  },
  {
    id: "support",
    question: "How do I get support?",
    answer:
      "Search this Help page first, then use Contact support below or check the status page stub. Include the page path and what you expected to happen.",
    tags: ["support", "contact", "help", "status"],
  },
]

export const HELP_DOC_LINKS: HelpDocLink[] = [
  {
    id: "readme",
    title: "README",
    description: "Repo overview, packages, and how to run the app.",
    path: "README.md",
    href: "https://github.com/eviatarmor/Vanteg/blob/master/README.md",
  },
  {
    id: "ui-conventions",
    title: "UI conventions",
    description: "SecretInput rules and shared client UI guidance.",
    path: "docs/ui-conventions.md",
    href: "https://github.com/eviatarmor/Vanteg/blob/master/docs/ui-conventions.md",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connector catalog notes and auth mix for apps.",
    path: "docs/integrations.md",
    href: "https://github.com/eviatarmor/Vanteg/blob/master/docs/integrations.md",
  },
]

export const HELP_STATUS_HREF = "https://status.vanteg.app"
export const HELP_SUPPORT_EMAIL = "support@vanteg.app"

export function filterFaq(query: string, items: HelpFaqItem[] = HELP_FAQ): HelpFaqItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return items
  }

  return items.filter((item) => {
    const haystack = [item.question, item.answer, ...item.tags]
      .join(" ")
      .toLowerCase()
    return haystack.includes(normalized)
  })
}
