export type CustomAuthKind = "bearer" | "api-key" | "basic" | "hmac" | "oauth2"

export interface CustomCredentialFieldDef {
  id: string
  label: string
  secret?: boolean
  required?: boolean
  placeholder?: string
  defaultValue?: string
}

export interface CustomCredential {
  id: string
  name: string
  kind: CustomAuthKind
  fields: Record<string, string>
  createdAt: string
  updatedAt?: string
}

export interface CreateCustomCredentialInput {
  name: string
  kind: CustomAuthKind
  fields: Record<string, string>
}

export interface UpdateCustomCredentialInput {
  id: string
  name?: string
  kind?: CustomAuthKind
  fields?: Record<string, string>
}

export const CUSTOM_AUTH_KINDS: readonly CustomAuthKind[] = [
  "bearer",
  "api-key",
  "basic",
  "hmac",
  "oauth2",
] as const

const kindLabels: Record<CustomAuthKind, string> = {
  bearer: "Bearer",
  "api-key": "API key",
  basic: "Basic",
  hmac: "HMAC",
  oauth2: "OAuth2",
}

export function customAuthKindLabel(kind: CustomAuthKind): string {
  return kindLabels[kind]
}

export function customCredentialFieldsFor(kind: CustomAuthKind): CustomCredentialFieldDef[] {
  if (kind === "bearer") {
    return [{ id: "token", label: "Token", secret: true, required: true, placeholder: "Paste token" }]
  }
  if (kind === "api-key") {
    return [
      { id: "apiKey", label: "API key", secret: true, required: true, placeholder: "Paste API key" },
      {
        id: "headerName",
        label: "Header name",
        required: false,
        placeholder: "X-Api-Key",
        defaultValue: "X-Api-Key",
      },
    ]
  }
  if (kind === "basic") {
    return [
      { id: "username", label: "Username", required: true },
      { id: "password", label: "Password", secret: true, required: true },
    ]
  }
  if (kind === "hmac") {
    return [
      { id: "secret", label: "Secret", secret: true, required: true },
      {
        id: "algorithm",
        label: "Algorithm",
        required: true,
        placeholder: "SHA256",
        defaultValue: "SHA256",
      },
      { id: "headerName", label: "Header name", required: false, placeholder: "X-Signature" },
    ]
  }
  return [
    { id: "clientId", label: "Client ID", required: true },
    { id: "clientSecret", label: "Client secret", secret: true, required: true },
    { id: "tokenUrl", label: "Token URL", required: true, placeholder: "https://…" },
    { id: "scopes", label: "Scopes", required: false, placeholder: "space-separated scopes" },
  ]
}

export function secretFieldIdsFor(kind: CustomAuthKind): string[] {
  return customCredentialFieldsFor(kind)
    .filter((field) => field.secret)
    .map((field) => field.id)
}

export function validateCustomCredentialInput(input: {
  name: string
  kind: CustomAuthKind
  fields: Record<string, string>
  /** When editing, blank secret fields are allowed (keep previous). */
  allowBlankSecrets?: boolean
}): Record<string, string> | undefined {
  const errors: Record<string, string> = {}
  if (!input.name.trim()) {
    errors.name = "Required"
  }
  if (!CUSTOM_AUTH_KINDS.includes(input.kind)) {
    errors.kind = "Invalid kind"
  }
  const defs = customCredentialFieldsFor(input.kind)
  for (const field of defs) {
    const value = input.fields[field.id]?.trim() ?? ""
    if (!field.required) {
      continue
    }
    if (value) {
      continue
    }
    if (field.secret && input.allowBlankSecrets) {
      continue
    }
    if (field.defaultValue) {
      continue
    }
    errors[field.id] = "Required"
  }
  return Object.keys(errors).length > 0 ? errors : undefined
}

export function applyCustomCredentialDefaults(
  kind: CustomAuthKind,
  fields: Record<string, string>
): Record<string, string> {
  const next = { ...fields }
  for (const field of customCredentialFieldsFor(kind)) {
    if (!next[field.id]?.trim() && field.defaultValue) {
      next[field.id] = field.defaultValue
    }
  }
  return next
}

export function mergeCustomCredentialFields(
  previous: Record<string, string> | undefined,
  next: Record<string, string>,
  kind: CustomAuthKind
): Record<string, string> {
  const merged = { ...next }
  const secrets = new Set(secretFieldIdsFor(kind))
  if (previous) {
    for (const key of secrets) {
      if (!merged[key]?.trim() && previous[key]) {
        merged[key] = previous[key]
      }
    }
  }
  return applyCustomCredentialDefaults(kind, merged)
}

export function primarySecretPreview(kind: CustomAuthKind, fields: Record<string, string>): string {
  const secretId = secretFieldIdsFor(kind)[0]
  if (!secretId) {
    return ""
  }
  const value = fields[secretId] ?? ""
  if (!value) {
    return ""
  }
  return "*****"
}
