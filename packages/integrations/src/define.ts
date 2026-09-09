import { templates } from "./templates.ts"
import type { AppAuth, IntegrationApp, Method, MethodField, MethodKind, Toggle } from "./types.ts"

export function method(
  id: string,
  kind: MethodKind,
  label: string,
  description: string,
  fields: MethodField[]
): Method {
  return { id, kind, label, description, fields }
}

export function field(
  key: string,
  label: string,
  placeholder: string,
  extra: Partial<MethodField> = {}
): MethodField {
  return { key, label, placeholder, ...extra }
}

export function selectField(
  key: string,
  label: string,
  placeholder: string,
  options: readonly { value: string; label: string }[],
  extra: Partial<MethodField> = {}
): MethodField {
  return field(key, label, placeholder, { control: "select", options, ...extra })
}

export function booleanField(
  key: string,
  label: string,
  defaultValue: boolean,
  extra: Partial<MethodField> = {}
): MethodField {
  return field(key, label, defaultValue ? "true" : "false", {
    control: "boolean",
    ...extra,
  })
}

export function integrationApp(
  input: Omit<IntegrationApp, "toggles" | "featured" | "methods"> & {
    methods?: readonly Method[]
    toggles?: readonly Toggle[]
    featured?: boolean
  }
): IntegrationApp {
  return {
    toggles: [],
    featured: true,
    methods: [],
    ...input,
  }
}

export function oauth(provider: string, scopes: readonly string[] = []): AppAuth {
  return { kind: "oauth2", provider, scopes }
}

export const apiKey: AppAuth = { kind: "api-key" }
export const jwt: AppAuth = { kind: "jwt" }
export const basic: AppAuth = { kind: "basic" }
export const bearer: AppAuth = { kind: "bearer" }
export const serviceAccount: AppAuth = { kind: "service-account" }

export function templateOperations(app: IntegrationApp): string[] {
  const operation = templates[app.sheetsTemplate].in.find((item) => item.id === "operation")
  return (operation?.options ?? []).map((item) => item.value)
}
