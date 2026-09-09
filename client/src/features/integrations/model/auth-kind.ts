import type { AuthKind } from "./types"

const labels: Record<AuthKind, string> = {
  oauth2: "OAUTH",
  "api-key": "API KEY",
  jwt: "JWT",
  basic: "BASIC",
  bearer: "BEARER",
  "service-account": "SERVICE ACCOUNT",
}

export function authKindLabel(kind: AuthKind): string {
  return labels[kind]
}
