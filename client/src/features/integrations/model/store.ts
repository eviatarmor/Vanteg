import { useSyncExternalStore } from "react"

import type {
  CreateCustomCredentialInput,
  CustomCredential,
  Result,
  UpdateCustomCredentialInput,
} from "@workspace/integrations"
import { err, ok } from "@workspace/integrations"

import { getIntegrationsAdapter, resetIntegrationsAdapter } from "./adapter"
import { getConnector } from "./catalog"
import { isManagedOAuth } from "./credential-fields"
import type {
  Connector,
  ConnectorConnection,
  ConnectorSheets,
  IntegrationsSnapshot,
  SavedCredential,
  SheetField,
  SheetKind,
  SheetRow,
} from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function emptySnapshot(): IntegrationsSnapshot {
  return {
    credentials: [],
    connections: [],
    customCredentials: [],
    selectedConnectionId: null,
  }
}

let snapshot: IntegrationsSnapshot = emptySnapshot()
const oauthCallbackInFlight = new Map<string, Promise<Result<ConnectorConnection>>>()

export function subscribeIntegrations(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getIntegrationsSnapshot(): IntegrationsSnapshot {
  return snapshot
}

export function useIntegrationsStore(): IntegrationsSnapshot {
  return useSyncExternalStore(
    subscribeIntegrations,
    getIntegrationsSnapshot,
    getIntegrationsSnapshot
  )
}

let customCredentialsLoadReset: (() => void) | null = null

export function registerCustomCredentialsLoadReset(fn: () => void) {
  customCredentialsLoadReset = fn
}

export function resetIntegrationsStore() {
  resetIntegrationsAdapter()
  snapshot = emptySnapshot()
  oauthCallbackInFlight.clear()
  customCredentialsLoadReset?.()
  emit()
}
