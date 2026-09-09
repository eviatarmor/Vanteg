import type {
  CreateCustomCredentialInput,
  CustomCredential,
  UpdateCustomCredentialInput,
} from "./custom-credentials.ts"
import type { Result } from "./errors.ts"
import type { AuthKind } from "./types.ts"

export type ConnectionStatus = "connected" | "disconnected" | "error" | "pending"

export interface Connection {
  id: string
  appId: string
  name: string
  credentialId: string
  status: ConnectionStatus
  createdAt: string
  updatedAt?: string
}

export interface Credential {
  id: string
  appId: string
  name: string
  kind: AuthKind
  managed: boolean
  status: ConnectionStatus
  fields: Record<string, string>
}

export interface CreateConnectionInput {
  appId: string
  name?: string
  fields: Record<string, string>
}

export interface StartOAuthInput {
  provider: string
  redirectUri?: string
  /** App / connector id to attach when the OAuth session completes. */
  appId?: string
  name?: string
}

export interface CompleteOAuthInput {
  provider: string
  code: string
  state: string
}

/** Query params from the OAuth redirect / local demo callback. */
export interface CompleteOAuthCallbackInput {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
  provider?: string
}

export interface ExecuteMethodInput {
  connectionId: string
  methodId: string
  input: Record<string, unknown>
  idempotencyKey?: string
}

export interface VerifyWebhookInput {
  provider: string
  connectionId: string
  headers: Record<string, string>
  rawBody: string
}

export interface ConnectAppInput {
  appId: string
  fields?: Record<string, string>
  name?: string
  /** When set, update this connection in place instead of inserting a new one. */
  connectionId?: string
}

export interface IntegrationsAdapter {
  listConnections(): Promise<Result<Connection[]>>
  getConnection(id: string): Promise<Result<Connection>>
  createConnection(input: CreateConnectionInput): Promise<Result<Connection>>
  startOAuth(input: StartOAuthInput): Promise<Result<{ authorizeUrl: string; state: string }>>
  completeOAuth(input: CompleteOAuthInput): Promise<Result<Connection>>
  /** Finish a redirect/callback: validate state, apply IdP error query, or complete with code. */
  completeOAuthCallback(input: CompleteOAuthCallbackInput): Promise<Result<Connection>>
  deleteConnection(id: string): Promise<Result<{ id: string }>>
  executeMethod(input: ExecuteMethodInput): Promise<Result<Record<string, unknown>>>
  verifyWebhook?(input: VerifyWebhookInput): Promise<Result<{ accepted: boolean; eventId?: string }>>
  /** Convenience for UI: managed oauth2 simulates complete; secrets use createConnection. */
  connectApp(input: ConnectAppInput): Promise<Result<Connection>>
  listCustomCredentials(): Promise<Result<CustomCredential[]>>
  createCustomCredential(input: CreateCustomCredentialInput): Promise<Result<CustomCredential>>
  updateCustomCredential(input: UpdateCustomCredentialInput): Promise<Result<CustomCredential>>
  deleteCustomCredential(id: string): Promise<Result<{ id: string }>>
}
