export type ApiKeyKind = "private-keys" | "public-keys"

export type ApiKeyStatus = "active" | "revoked"

export interface ApiKey {
  id: string
  kind: ApiKeyKind
  name: string
  /** Visible prefix of the secret (never the full value after create). */
  prefix: string
  scopes: string[]
  status: ApiKeyStatus
  createdAt: string
  lastUsedAt: string | null
}

export type ApiKeysLoadState = "loading" | "ready" | "error"

export interface ApiKeysSnapshot {
  keys: ApiKey[]
  loadState: ApiKeysLoadState
  loadError: string | null
}

export interface CreateApiKeyInput {
  kind: ApiKeyKind
  name: string
  scopes: string[]
}

export interface CreatedApiKey {
  key: ApiKey
  /** Full secret — only returned once from createApiKey. */
  secret: string
}
