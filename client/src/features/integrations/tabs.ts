import type { PageTab } from "@/features/page-tabs/types"

export const integrationTabs = [
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect apps to use from workflow steps.",
    emptyTitle: "No connectors configured",
    newAction: {
      label: "Add connector",
      placeholder: "Connector name",
    },
  },
  {
    id: "custom-credentials",
    label: "Custom Credentials",
    description: "Reusable auth configs for agents and workflows.",
    emptyTitle: "No custom credentials yet",
    newAction: {
      label: "New credential",
      placeholder: "Credential name",
    },
  },
] as const satisfies readonly PageTab[]
