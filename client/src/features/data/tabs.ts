import type { PageTab } from "@/features/page-tabs/types"

export const dataTabs = [
  {
    id: "database",
    label: "Database",
    description: "Browse databases and tables.",
    newAction: {
      label: "New table",
      placeholder: "Table name",
    },
  },
  {
    id: "variables",
    label: "Variables",
    description: "Workspace variables grouped by environment.",
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
    description: "Workspace secrets grouped by environment.",
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
