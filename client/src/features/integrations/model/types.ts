export type {
  AuthKind,
  Connector,
  ConnectorAuth,
  ConnectorCategory,
  CustomAuthKind,
  CustomCredential,
  FieldVariant,
  SelectOption,
  SheetField,
} from "@workspace/integrations"

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
  customCredentials: CustomCredential[]
  selectedConnectionId: string | null
}
