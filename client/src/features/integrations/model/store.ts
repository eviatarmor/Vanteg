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

export function resetIntegrationsStore() {
  resetIntegrationsAdapter()
  snapshot = emptySnapshot()
  emit()
}

function inVarMap(rows: SheetRow[]): Record<string, unknown> {
  const vars: Record<string, unknown> = {}
  for (const row of rows) {
    const key = String(row.key ?? "")
    if (key) {
      vars[key] = row.default ?? row.value
    }
  }
  return vars
}

function seedInRows(fields: SheetField[]): SheetRow[] {
  return fields.map((item) => ({
    id: crypto.randomUUID(),
    key: item.id,
    type: item.variant,
    required: Boolean(item.required),
    default: item.defaultValue ?? "",
    description: item.description ?? item.name,
  }))
}

function emptyFromFields(fields: SheetField[]): SheetRow {
  const row: SheetRow = { id: crypto.randomUUID() }
  for (const item of fields) {
    row[item.id] = item.defaultValue ?? (item.variant === "checkbox" ? false : "")
  }
  return row
}

function sampleDataRow(connector: Connector): SheetRow {
  const row = emptyFromFields(connector.dataFields)
  if (connector.id === "google-sheets") {
    row.name = "Ada Lovelace"
    row.email = "ada@vanteg.dev"
    row.company = "Analytical Engines"
    row.status = "active"
  }
  return row
}

function seedSheets(connector: Connector): ConnectorSheets {
  return {
    in: seedInRows(connector.inFields),
    data: [sampleDataRow(connector)],
    out: [],
  }
}

function mergeSecretFields(
  previous: Record<string, string> | undefined,
  next: Record<string, string>
): Record<string, string> {
  const merged = { ...next }
  if (!previous) {
    return merged
  }
  for (const [key, value] of Object.entries(merged)) {
    if (value.trim() === "" && previous[key]) {
      merged[key] = previous[key]
    }
  }
  return merged
}

export async function connectConnector(
  connectorId: string,
  values: Record<string, string> = {},
  existingCredentialId?: string
): Promise<Result<ConnectorConnection> {
