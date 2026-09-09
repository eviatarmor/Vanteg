export const API_KEY_SCOPES = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "workflows", label: "Workflows" },
  { id: "data", label: "Data" },
  { id: "admin", label: "Admin" },
] as const

export type ApiKeyScopeId = (typeof API_KEY_SCOPES)[number]["id"]
