import type { PageTab } from "@/features/page-tabs/types"

export const integrationTabs = [
  {
    id: "connectors",
    label: "Connectors",
    description: "Connect Google apps to use from workflow steps.",
    emptyTitle: "No connectors configured",
    newAction: {
      label: "Add connector",
      placeholder: "Connector name",
    },
  },
  {
    id: "mcp-servers",
    label: "MCP Servers",
    description:
      "Add Model Context Protocol servers by kind: mcp.json, npx, Docker, claude mcp add, URL, or Cursor link.",
    emptyTitle: "No MCP servers yet",
    newAction: {
      label: "Add MCP server",
      placeholder:
        "Paste mcp.json, npx, docker, claude mcp add, URL, or cursor:// link",
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
