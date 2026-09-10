export type {
  AppAuth,
  AuthKind,
  Connector,
  ConnectorApp,
  ConnectorAuth,
  ConnectorCategory,
  FieldControl,
  FieldVariant,
  IntegrationApp,
  Method,
  MethodField,
  MethodKind,
  OAuthApp,
  OAuthProvisioner,
  OAuthProviderDef,
  SelectOption,
  SheetField,
  TemplateName,
  TerraformOAuthApp,
  Toggle,
  ToggleType,
} from "./types.ts"

export {
  CONNECTORS,
  getApp,
  getConnector,
  getOAuthApp,
  listApps,
  listConnectorCategories,
  listFeaturedMethods,
  listPickerConnectorApps,
  listUnshippedFeaturedMethodIds,
  oauthApps,
  terraformOAuthApps,
} from "./registry.ts"

export type { IntegrationError, IntegrationErrorCode, Result } from "./errors.ts"
export { err, isIntegrationError, ok } from "./errors.ts"

export type {
  CompleteOAuthCallbackInput,
  CompleteOAuthInput,
  ConnectAppInput,
  Connection,
  ConnectionStatus,
  CreateConnectionInput,
  Credential,
  ExecuteMethodInput,
  IntegrationsAdapter,
  StartOAuthInput,
  VerifyWebhookInput,
} from "./runtime.ts"

export type {
  CreateCustomCredentialInput,
  CustomAuthKind,
  CustomCredential,
  CustomCredentialFieldDef,
  UpdateCustomCredentialInput,
} from "./custom-credentials.ts"
export {
  CUSTOM_AUTH_KINDS,
  applyCustomCredentialDefaults,
  customAuthKindLabel,
  customCredentialFieldsFor,
  mergeCustomCredentialFields,
  primarySecretPreview,
  secretFieldIdsFor,
  validateCustomCredentialInput,
} from "./custom-credentials.ts"

export { createMockIntegrationsAdapter } from "./mock-adapter.ts"

export type { ResourceOption } from "./resources.ts"
export { listResourceTypes, listResources } from "./resources.ts"
