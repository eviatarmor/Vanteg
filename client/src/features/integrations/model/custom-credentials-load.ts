import { useEffect, useSyncExternalStore } from "react"

import type { CustomCredential } from "@workspace/integrations"

import { getIntegrationsAdapter } from "./adapter"
import {
  getIntegrationsSnapshot,
  registerCustomCredentialsLoadReset,
  replaceCustomCredentials,
  subscribeIntegrations,
} from "./store"

export type CustomCredentialsLoadStatus = "idle" | "loading" | "ready" | "error"

type CustomCredentialsMeta = {
  status: CustomCredentialsLoadStatus
  error: string | null
}

let customCredentialsMeta: CustomCredentialsMeta = {
  status: "idle",
  error: null,
}
let customCredentialsLoadPromise: Promise<void> | null = null
let failNextCustomCredentialsLoad = false
let customCredentialsLoadHold: {
  promise: Promise<void>
  resolve: () => void
} | null = null

const listeners = new Set<() => void>()

function emitMeta() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribeMeta(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function resetCustomCredentialsLoad() {
  customCredentialsLoadHold?.resolve()
  customCredentialsLoadHold = null
  customCredentialsMeta = { status: "idle", error: null }
  customCredentialsLoadPromise = null
  failNextCustomCredentialsLoad = false
  emitMeta()
}

queueMicrotask(() => {
  registerCustomCredentialsLoadReset(resetCustomCredentialsLoad)
})

export function getCustomCredentialsMeta(): CustomCredentialsMeta {
  return customCredentialsMeta
}

export function useCustomCredentialsStatus(): CustomCredentialsLoadStatus {
  return useSyncExternalStore(
    subscribeMeta,
    () => customCredentialsMeta.status,
    () => customCredentialsMeta.status
  )
}

export function useCustomCredentialsError(): string | null {
  return useSyncExternalStore(
    subscribeMeta,
    () => customCredentialsMeta.error,
    () => customCredentialsMeta.error
  )
}

export async function ensureCustomCredentialsLoaded(): Promise<void> {
  if (
    customCredentialsMeta.status === "ready" ||
    customCredentialsMeta.status === "loading"
  ) {
    return customCredentialsLoadPromise ?? Promise.resolve()
  }
  customCredentialsMeta = { status: "loading", error: null }
  emitMeta()
  customCredentialsLoadPromise = (async () => {
    try {
      const hold = customCredentialsLoadHold
      await (hold?.promise ?? Promise.resolve())
      if (failNextCustomCredentialsLoad) {
        failNextCustomCredentialsLoad = false
        throw new Error("Failed to load custom credentials")
      }
      const result = await getIntegrationsAdapter().listCustomCredentials()
      if (!result.ok) {
        throw new Error(result.error.message)
      }
      replaceCustomCredentials(
        [...result.data].sort((a, b) => a.name.localeCompare(b.name))
      )
      customCredentialsMeta = { status: "ready", error: null }
    } catch (error) {
      customCredentialsMeta = {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to load custom credentials",
      }
    } finally {
      customCredentialsLoadPromise = null
      emitMeta()
    }
  })()
  return customCredentialsLoadPromise
}

export function retryCustomCredentialsLoad(): void {
  customCredentialsMeta = { status: "idle", error: null }
  emitMeta()
  void ensureCustomCredentialsLoaded()
}

/** Test-only: next ensureCustomCredentialsLoaded fails once. */
export function setCustomCredentialsLoadFailureOnce() {
  failNextCustomCredentialsLoad = true
  customCredentialsMeta = { status: "idle", error: null }
  customCredentialsLoadPromise = null
}

/** Test-only: next ensureCustomCredentialsLoaded waits until release. */
export function holdNextCustomCredentialsLoad() {
  let resolve!: () => void
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  customCredentialsLoadHold = { promise, resolve }
}

/** Test-only: release a held ensureCustomCredentialsLoaded. */
export function releaseCustomCredentialsLoad() {
  customCredentialsLoadHold?.resolve()
  customCredentialsLoadHold = null
}

export function useCustomCredentials(): CustomCredential[] {
  const credentials = useSyncExternalStore(
    subscribeIntegrations,
    () => getIntegrationsSnapshot().customCredentials,
    () => getIntegrationsSnapshot().customCredentials
  )
  useEffect(() => {
    void ensureCustomCredentialsLoaded()
  }, [])
  return credentials
}
