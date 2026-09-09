import {
  applyCustomCredentialDefaults,
  mergeCustomCredentialFields,
  validateCustomCredentialInput,
  type CreateCustomCredentialInput,
  type CustomCredential,
  type UpdateCustomCredentialInput,
} from "./custom-credentials.ts"
import { err, ok, type Result } from "./errors.ts"
import { getApp, getOAuthApp, listApps } from "./registry.ts"
import type {
  CompleteOAuthInput,
  ConnectAppInput,
  Connection,
  CreateConnectionInput,
  Credential,
  ExecuteMethodInput,
  IntegrationsAdapter,
  StartOAuthInput,
  VerifyWebhookInput,
} from "./runtime.ts"
import type { AuthKind } from "./types.ts"

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function requiredFieldsFor(kind: AuthKind, category?: string): string[] {
  if (kind === "api-key") {
    return ["apiKey"]
  }
  if (kind === "jwt") {
    return ["algorithm", "secret", "issuer", "audience"]
  }
  if (kind === "basic") {
    if (category === "Databases") {
      return ["host", "database", "username", "password"]
    }
    return ["username", "password"]
  }
  if (kind === "bearer") {
    return ["token"]
  }
  if (kind === "service-account") {
    return ["jsonKey"]
  }
  if (kind === "oauth2") {
    return ["clientId", "clientSecret"]
  }
  return []
}

function validateFields(
  kind: AuthKind,
  fields: Record<string, string>,
  category?: string
): Record<string, string> | undefined {
  const missing: Record<string, string> = {}
  for (const key of requiredFieldsFor(kind, category)) {
    if (!fields[key]?.trim()) {
      missing[key] = "Required"
    }
  }
  return Object.keys(missing).length > 0 ? missing : undefined
}

function isSheetLikeMethod(methodId: string): boolean {
  return /sheet|spreadsheet|insert|update|append|row/i.test(methodId)
}

function sheetLikePayload(input: Record<string, unknown>): Record<string, unknown> {
  const sheetName = String(input.sheetName ?? "Sheet1")
  const spreadsheetId = String(input.spreadsheetId ?? "spreadsheet")
  return {
    ok: true,
    status: "ok",
    updatedRows: 1,
    updatedCells: Object.keys(input).length || 4,
    updatedRange: `${sheetName}!A2:D2`,
    spreadsheetId,
  }
}

function appsForProvider(provider: string): string[] {
  return listApps()
    .filter((app) => app.auth.kind === "oauth2" && app.auth.provider === provider)
    .map((app) => app.id)
}

export function createMockIntegrationsAdapter(): IntegrationsAdapter {
  const connections = new Map<string, Connection>()
  const credentials = new Map<string, Credential>()
  const customCredentials = new Map<string, CustomCredential>()
  const oauthStates = new Map<string, { provider: string }>()
  const idempotency = new Map<string, Result<Record<string, unknown>>>()

  function putConnection(connection: Connection, credential: Credential): Connection {
    connections.set(connection.id, connection)
    credentials.set(credential.id, credential)
    return connection
  }

  async function startOAuth(
    input: StartOAuthInput
  ): Promise<Result<{ authorizeUrl: string; state: string }>> {
    const provider = getOAuthApp(input.provider)
    if (!provider) {
      return err({
        code: "not_found",
        message: `Unknown OAuth provider: ${input.provider}`,
        provider: input.provider,
      })
    }
    const state = newId()
    oauthStates.set(state, { provider: input.provider })
    const authorizeUrl = `https://example.invalid/oauth/${input.provider}?state=${encodeURIComponent(state)}`
    return ok({ authorizeUrl, state })
  }

  async function completeOAuth(input: CompleteOAuthInput): Promise<Result<Connection>> {
    const pending = oauthStates.get(input.state)
    if (!pending || pending.provider !== input.provider) {
      return err({
        code: "unauthorized",
        message: "Invalid or expired OAuth state",
        provider: input.provider,
      })
    }
    oauthStates.delete(input.state)

    const appId = appsForProvider(input.provider)[0] ?? input.provider
    const app = getApp(appId)
    const createdAt = nowIso()
    const credential: Credential = {
      id: newId(),
      appId,
      name: app?.name ?? input.provider,
      kind: "oauth2",
      managed: true,
      status: "connected",
      fields: { accessToken: "oauth-access-token" },
    }
    const connection: Connection = {
      id: newId(),
      appId,
      name: app?.name ?? input.provider,
      credentialId: credential.id,
      status: "connected",
      createdAt,
      updatedAt: createdAt,
    }
    return ok(putConnection(connection, credential))
  }

  async function connectManaged(
    appId: string,
    name?: string
  ): Promise<Result<Connection>> {
    const app = getApp(appId)
    if (!app || app.auth.kind !== "oauth2") {
      return err({
        code: "not_found",
        message: `Unknown OAuth app: ${appId}`,
      })
    }
    const provider = app.auth.provider
    const started = await startOAuth({ provider })
    if (!started.ok) {
      return started
    }
    const completed = await completeOAuth({
      provider,
      code: "mock-code",
      state: started.data.state,
    })
    if (!completed.ok) {
      return completed
    }
    const createdAt = completed.data.createdAt
    const credential = credentials.get(completed.data.credentialId)
    if (credential) {
      const nextCredential: Credential = {
        ...credential,
        appId,
        name: name ?? app.name,
      }
      credentials.set(nextCredential.id, nextCredential)
    }
    const connection: Connection = {
      ...completed.data,
      appId,
      name: name ?? app.name,
      updatedAt: createdAt,
    }
    connections.set(connection.id, connection)
    return ok(connection)
  }

  async function createConnection(
    input: CreateConnectionInput
  ): Promise<Result<Connection>> {
    const app = getApp(input.appId)
    if (!app) {
      return err({
        code: "not_found",
        message: `Unknown app: ${input.appId}`,
      })
    }

    if (app.auth.kind === "oauth2" && getOAuthApp(app.auth.provider)?.managed === true) {
      return connectManaged(input.appId, input.name)
    }

    const kind = app.auth.kind
    const fieldErrors = validateFields(kind, input.fields, app.category)
    if (fieldErrors) {
      return err({
        code: "validation",
        message: "Missing required credential fields",
        fields: fieldErrors,
        provider: input.appId,
      })
    }

    const createdAt = nowIso()
    const credential: Credential = {
      id: newId(),
      appId: input.appId,
      name: input.name ?? app.name,
      kind,
      managed: false,
      status: "connected",
      fields: { ...input.fields },
    }
    const connection: Connection = {
      id: newId(),
      appId: input.appId,
      name: input.name ?? app.name,
      credentialId: credential.id,
      status: "connected",
      createdAt,
      updatedAt: createdAt,
    }
    return ok(putConnection(connection, credential))
  }

  async function connectApp(input: ConnectAppInput): Promise<Result<Connection>> {
    const app = getApp(input.appId)
    if (!app) {
      return err({
        code: "not_found",
        message: `Unknown app: ${input.appId}`,
      })
    }
    const managed =
      app.auth.kind === "oauth2" && getOAuthApp(app.auth.provider)?.managed === true
    if (managed) {
      return connectManaged(input.appId, input.name)
    }
    return createConnection({
      appId: input.appId,
      name: input.name,
      fields: input.fields ?? {},
    })
  }

  async function listConnections(): Promise<Result<Connection[]>> {
    return ok([...connections.values()])
  }

  async function getConnection(id: string): Promise<Result<Connection>> {
    const connection = connections.get(id)
    if (!connection) {
      return err({ code: "not_found", message: `Connection not found: ${id}` })
    }
    return ok(connection)
  }

  async function deleteConnection(id: string): Promise<Result<{ id: string }>> {
    const connection = connections.get(id)
    if (!connection) {
      return err({ code: "not_found", message: `Connection not found: ${id}` })
    }
    connections.delete(id)
    credentials.delete(connection.credentialId)
    return ok({ id })
  }

  async function executeMethod(
    input: ExecuteMethodInput
  ): Promise<Result<Record<string, unknown>>> {
    if (input.idempotencyKey) {
      const cached = idempotency.get(input.idempotencyKey)
      if (cached) {
        return cached
      }
    }

    const connection = connections.get(input.connectionId)
    if (!connection) {
      return err({
        code: "not_found",
        message: `Connection not found: ${input.connectionId}`,
      })
    }

    const app = getApp(connection.appId)
    const methodKnown = app?.methods.some((method) => method.id === input.methodId) ?? false
    if (!methodKnown && !isSheetLikeMethod(input.methodId)) {
      const result = err<Record<string, unknown>>({
        code: "not_found",
        message: `Unknown method: ${input.methodId}`,
        provider: connection.appId,
      })
      if (input.idempotencyKey) {
        idempotency.set(input.idempotencyKey, result)
      }
      return result
    }

    const result = ok(sheetLikePayload(input.input))
    if (input.idempotencyKey) {
      idempotency.set(input.idempotencyKey, result)
    }
    return result
  }

  async function verifyWebhook(
    input: VerifyWebhookInput
  ): Promise<Result<{ accepted: boolean; eventId?: string }>> {
    if (input.headers["x-vanteg-signature"] === "test") {
      return ok({ accepted: true, eventId: newId() })
    }
    return err({
      code: "webhook_invalid",
      message: "Invalid webhook signature",
      provider: input.provider,
    })
  }

  async function listCustomCredentials(): Promise<Result<CustomCredential[]>> {
    return ok([...customCredentials.values()].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function createCustomCredential(
    input: CreateCustomCredentialInput
  ): Promise<Result<CustomCredential>> {
    const fieldErrors = validateCustomCredentialInput({
      name: input.name,
      kind: input.kind,
      fields: input.fields,
    })
    if (fieldErrors) {
      return err({
        code: "validation",
        message: "Missing required credential fields",
        fields: fieldErrors,
      })
    }
    const createdAt = nowIso()
    const credential: CustomCredential = {
      id: newId(),
      name: input.name.trim(),
      kind: input.kind,
      fields: applyCustomCredentialDefaults(input.kind, { ...input.fields }),
      createdAt,
      updatedAt: createdAt,
    }
    customCredentials.set(credential.id, credential)
    return ok(credential)
  }

  async function updateCustomCredential(
    input: UpdateCustomCredentialInput
  ): Promise<Result<CustomCredential>> {
    const existing = customCredentials.get(input.id)
    if (!existing) {
      return err({ code: "not_found", message: `Custom credential not found: ${input.id}` })
    }
    const kind = input.kind ?? existing.kind
    const name = input.name ?? existing.name
    const fields = mergeCustomCredentialFields(existing.fields, input.fields ?? {}, kind)
    const fieldErrors = validateCustomCredentialInput({
      name,
      kind,
      fields,
      allowBlankSecrets: false,
    })
    if (fieldErrors) {
      return err({
        code: "validation",
        message: "Missing required credential fields",
        fields: fieldErrors,
      })
    }
    const updated: CustomCredential = {
      ...existing,
      name: name.trim(),
      kind,
      fields,
      updatedAt: nowIso(),
    }
    customCredentials.set(updated.id, updated)
    return ok(updated)
  }

  async function deleteCustomCredential(id: string): Promise<Result<{ id: string }>> {
    if (!customCredentials.has(id)) {
      return err({ code: "not_found", message: `Custom credential not found: ${id}` })
    }
    customCredentials.delete(id)
    return ok({ id })
  }

  return {
    listConnections,
    getConnection,
    createConnection,
    startOAuth,
    completeOAuth,
    deleteConnection,
    executeMethod,
    verifyWebhook,
    connectApp,
    listCustomCredentials,
    createCustomCredential,
    updateCustomCredential,
    deleteCustomCredential,
  }
}
