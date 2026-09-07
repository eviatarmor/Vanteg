export type FieldVariant =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "url"

export interface SelectOption {
  label: string
  value: string
}

export interface SheetField {
  id: string
  name: string
  variant: FieldVariant
  required?: boolean
  description?: string
  defaultValue?: string | number | boolean
  options?: SelectOption[]
}

export type AuthKind =
  | "oauth2"
  | "api-key"
  | "jwt"
  | "basic"
  | "bearer"
  | "service-account"

export interface ConnectorAuth {
  kind: AuthKind
  oauthAppId?: string
}

export type ConnectorCategory =
  | "Google"
  | "Microsoft"
  | "Communication"
  | "CRM"
  | "Project"
  | "Developer"
  | "Payments"
  | "Marketing"
  | "Storage"
  | "Databases"
  | "AI"
  | "Social"
  | "Commerce"
  | "Analytics"
  | "HR"
  | "Finance"
  | "Support"
  | "Design"
  | "Auth"
  | "Infra"

export interface Connector {
  id: string
  name: string
  description: string
  category: ConnectorCategory
  iconSlug: string
  auth: ConnectorAuth
  inFields: SheetField[]
  dataFields: SheetField[]
  outFields: SheetField[]
}

export interface CredentialField {
  id: string
  label: string
  secret?: boolean
  placeholder?: string
}

export type SheetKind = "in" | "data" | "out"

export type SheetRow = {
  id: string
  [key: string]: unknown
}

export interface ConnectorSheets {
  in: SheetRow[]
  data: SheetRow[]
  out: SheetRow[]
}

export interface ConnectorConnection {
  id: string
  connectorId: string
  credentialId: string
  name: string
  sheets: ConnectorSheets
}

export interface SavedCredential {
  id: string
  connectorId: string
  name: string
  kind: AuthKind
  managed: boolean
  status: "connected" | "disconnected"
  fields: Record<string, string>
}

export interface IntegrationsSnapshot {
  credentials: SavedCredential[]
  connections: ConnectorConnection[]
  selectedConnectionId: string | null
}
