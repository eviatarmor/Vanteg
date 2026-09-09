import type { PageTab } from "@/features/page-tabs/types"

export const dataTabs = [
  {
    id: "database",
    label: "Database",
    description: "Create a table to browse rows in the data grid.",
    emptyTitle: "No tables yet",
    newAction: {
      label: "New table",
      placeholder: "Table name",
    },
  },
  {
    id: "variables",
    label: "Variables",
    description: "Add a workspace variable to share config across workflows and agents.",
    emptyTitle: "No variables yet",
    newAction: {
      label: "New variable",
      placeholder: "KEY_NAME",
      nameLabel: "Key",
      valueLabel: "Value",
      valuePlaceholder: "Variable value",
    },
  },
  {
    id: "secrets",
    label: "Secrets",
    description: "Store API tokens and credentials securely. Values stay masked in the grid.",
    emptyTitle: "No secrets yet",
    newAction: {
      label: "New secret",
      placeholder: "KEY_NAME",
      nameLabel: "Key",
      valueLabel: "Secret",
      valuePlaceholder: "Secret value",
      secret: true,
    },
  },
] as const satisfies readonly PageTab[]
