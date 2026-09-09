import { useSyncExternalStore } from "react"

import { generateApiKeySecret, secretPrefix } from "./generate-secret"
import type {
  ApiKey,
  ApiKeysSnapshot,
  CreateApiKeyInput,
  CreatedApiKey,
} from "./types"

export const API_KEYS_STORAGE_KEY = "vanteg.mock.api-keys"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function emptyReady(): ApiKeysSnapshot {
  return { keys: [], loadState: "ready", loadError: null }
}

let snapshot: ApiKeysSnapshot = {
  keys: [],
  loadState: "loading",
  loadError: null,
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(API_KEYS_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeRaw(value: string): void {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, value)
  } catch {
    // Ignore quota / private-mode failures in the mock shell.
  }
}

function clearRaw(): void {
  try {
    localStorage.removeItem(API_KEYS_STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

function isApiKey(value: unknown): value is ApiKey {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<ApiKey>
  return (
    typeof item.id === "string" &&
    (item.kind === "private-keys" || item.kind === "public-keys") &&
    typeof item.name === "string" &&
    typeof item.prefix === "string" &&
    Array.isArray(item.scopes) &&
    (item.status === "active" || item.status === "revoked") &&
    typeof item.createdAt === "string" &&
    (item.lastUsedAt === null || typeof item.lastUsedAt === "string")
  )
}

function parseKeys(raw: string): ApiKey[] {
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error("API keys storage is corrupt.")
  }
  const keys: ApiKey[] = []
  for (const item of parsed) {
    if (!isApiKey(item)) {
      throw new Error("API keys storage is corrupt.")
    }
    keys.push({
      id: item.id,
      kind: item.kind,
      name: item.name,
      prefix: item.prefix,
      scopes: item.scopes.map(String),
      status: item.status,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt,
    })
  }
  return keys
}

function persist(keys: ApiKey[]) {
  writeRaw(JSON.stringify(keys))
}

/** Load from localStorage. Safe to call repeatedly. */
export function hydrateApiKeys(): ApiKeysSnapshot {
  const raw = readRaw()
  if (raw == null || raw === "") {
    snapshot = emptyReady()
    emit()
    return snapshot
  }
  try {
    snapshot = {
      keys: parseKeys(raw),
      loadState: "ready",
      loadError: null,
    }
  } catch (error) {
    snapshot = {
      keys: [],
      loadState: "error",
      loadError:
        error instanceof Error ? error.message : "API keys storage is corrupt.",
    }
  }
  emit()
  return snapshot
}

export function retryApiKeysLoad(): ApiKeysSnapshot {
  clearRaw()
  return hydrateApiKeys()
}

export function subscribeApiKeys(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getApiKeysSnapshot(): ApiKeysSnapshot {
  return snapshot
}

export function useApiKeysStore(): ApiKeysSnapshot {
  return useSyncExternalStore(
    subscribeApiKeys,
    getApiKeysSnapshot,
    getApiKeysSnapshot
  )
}

export function resetApiKeysStore() {
  clearRaw()
  snapshot = emptyReady()
  emit()
}

/** Test helper — put the store into a loading frame without touching storage. */
export function setApiKeysLoading() {
  snapshot = { keys: [], loadState: "loading", loadError: null }
  emit()
}

function ensureHydrated() {
  if (snapshot.loadState === "loading") {
    hydrateApiKeys()
  }
}

export function createApiKey(input: CreateApiKeyInput): CreatedApiKey {
  ensureHydrated()
  const name = input.name.trim()
  if (!name) {
    throw new Error("Name is required")
  }
  const secret = generateApiKeySecret(input.kind)
  const key: ApiKey = {
    id: crypto.randomUUID(),
    kind: input.kind,
    name,
    prefix: secretPrefix(secret),
    scopes: [...new Set(input.scopes)],
    status: "active",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  }
  const keys = [key, ...snapshot.keys]
  snapshot = { keys, loadState: "ready", loadError: null }
  persist(keys)
  emit()
  return { key, secret }
}

export function revokeApiKey(id: string): ApiKey | null {
  ensureHydrated()
  const existing = snapshot.keys.find((item) => item.id === id)
  if (!existing || existing.status === "revoked") {
    return null
  }
  const keys = snapshot.keys.map((item) =>
    item.id === id ? { ...item, status: "revoked" as const } : item
  )
  snapshot = { ...snapshot, keys, loadState: "ready", loadError: null }
  persist(keys)
  emit()
  return keys.find((item) => item.id === id) ?? null
}

export function deleteApiKey(id: string): boolean {
  ensureHydrated()
  const next = snapshot.keys.filter((item) => item.id !== id)
  if (next.length === snapshot.keys.length) {
    return false
  }
  snapshot = { ...snapshot, keys: next, loadState: "ready", loadError: null }
  persist(next)
  emit()
  return true
}

export function listKeysForKind(kind: CreateApiKeyInput["kind"]): ApiKey[] {
  return snapshot.keys.filter((item) => item.kind === kind)
}
