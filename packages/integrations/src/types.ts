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

export type MethodKind = "trigger" | "action"

export type FieldControl = "input" | "textarea" | "code" | "select" | "boolean" | "resource"

export interface MethodField {
  key: string
  label: string
  placeholder: string
  help?: string
  control?: FieldControl
  language?: "javascript" | "json"
  options?: readonly { value: string; label: string }[]
  /** Connection-scoped resource catalog key, e.g. "slack.channel". Used when control is "resource". */
  resourceType?: string
}

export interface Method {
  id: string
  kind: MethodKind
  label: string
  description: string
  fields: MethodField[]
}

export type ToggleType = "boolean" | "string" | "select"

export interface Toggle {
  id: string
  label: string
  description?: string
  type: ToggleType
  defaultValue?: string | boolean
  options?: readonly { value: string; label: string }[]
}

export type AppAuth =
  | { kind: "oauth2"; provider: string; scopes?: readonly string[] }
  | { kind: Exclude<AuthKind, "oauth2"> }

export type TemplateName =
  | "sheet"
  | "email"
  | "chat"
  | "crm"
  | "issue"
  | "file"
  | "calendar"
  | "payment"
  | "ai"
  | "db"
  | "event"
  | "sms"
  | "analytics"
  | "identity"
  | "commerce"
  | "ticket"
  | "form"
  | "deploy"
  | "search"

export interface IntegrationApp {
  id: string
  name: string
  description: string
  category: ConnectorCategory
  iconSlug: string
  auth: AppAuth
  sheetsTemplate: TemplateName
  methods: readonly Method[]
  toggles: readonly Toggle[]
  featured: boolean
  pickerGroup?: string
}

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
  operations: string[]
}

export interface ConnectorApp {
  id: string
  name: string
  description: string
  iconCatalogId: string
  iconSlug?: string
  methods: Method[]
}

export type OAuthProvisioner = "azuread" | "google-apis" | "ssm-slot"

export interface OAuthProviderDef {
  id: string
  name: string
  authorizeUrl: string
  tokenUrl: string
  provisioner: OAuthProvisioner
  baseScopes: readonly string[]
  googleServices?: readonly string[]
}

export interface OAuthApp {
  id: string
  name: string
  managed: true
  clientIdEnv: string
  clientSecretEnv: string
  authorizeUrl: string
  tokenUrl: string
  redirectPath: string
  scopes: string[]
  provisioner: OAuthProvisioner
}

export type TerraformOAuthApp = {
  name: string
  client_id_env: string
  client_secret_env: string
  authorize_url: string
  token_url: string
  redirect_path: string
  scopes: string[]
}
