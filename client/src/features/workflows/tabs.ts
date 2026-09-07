import type { PageTab } from "@/features/page-tabs/types"

export const workflowTabs = [
  {
    id: "deployed",
    label: "Deployed",
    description: "Deployed workflows will appear here.",
    newAction: {
      label: "New workflow",
      placeholder: "Workflow name",
    },
  },
  {
    id: "drafts",
    label: "Drafts",
    description: "Draft workflows will appear here.",
    newAction: {
      label: "New workflow",
      placeholder: "Workflow name",
    },
  },
  {
    id: "runs",
    label: "Runs",
    description: "Workflow runs will appear here.",
    newAction: {
      label: "New workflow",
      placeholder: "Workflow name",
    },
  },
] as const satisfies readonly PageTab[]
