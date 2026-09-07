import { useSyncExternalStore } from "react"

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
    row.email = "ada@freeze.dev"
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

export function connectConnector(
  connectorId: string,
  values: Record<string, string> = {},
  existingCredentialId?: string
): ConnectorConnection {
  const connector = getConnector(connectorId)
  if (!connector) {
    throw new Error(`Unknown connector: ${connectorId}`)
  }

  const managed = isManagedOAuth(connector)
  const existing = snapshot.credentials.find((item) => item.id === existingCredentialId)
  const fields = managed
    ? { accessToken: existing?.fields.accessToken ?? "oauth-access-token" }
    : mergeSecretFields(existing?.fields, values)

  const credential: SavedCredential = {
    id: existing?.id ?? crypto.randomUUID(),
    connectorId,
    name: existing?.name ?? connector.name,
    kind: connector.auth.kind,
    managed,
    status: "connected",
    fields,
  }

  const connection: ConnectorConnection = {
    id: crypto.randomUUID(),
    connectorId,
    credentialId: credential.id,
    name: connector.name,
    sheets: seedSheets(connector),
  }

  snapshot = {
    credentials: existing
      ? snapshot.credentials.map((item) => (item.id === credential.id ? credential : item))
      : [...snapshot.credentials, credential],
    connections: existing
      ? snapshot.connections.map((item) =>
          item.credentialId === credential.id
            ? { ...item, credentialId: credential.id }
            : item
        )
      : [...snapshot.connections, connection],
    selectedConnectionId: existing
      ? snapshot.connections.find((item) => item.credentialId === credential.id)?.id ??
        snapshot.selectedConnectionId
      : connection.id,
  }

  if (existing && snapshot.connections.every((item) => item.credentialId !== credential.id)) {
    snapshot = {
      ...snapshot,
      connections: [...snapshot.connections, connection],
      selectedConnectionId: connection.id,
    }
  }

  emit()
  return (
    snapshot.connections.find((item) => item.credentialId === credential.id) ?? connection
  )
}

export function selectConnection(connectionId: string | null) {
  snapshot = { ...snapshot, selectedConnectionId: connectionId }
  emit()
}

export function disconnectConnector(connectionId: string) {
  const connection = snapshot.connections.find((item) => item.id === connectionId)
  snapshot = {
    ...snapshot,
    connections: snapshot.connections.filter((item) => item.id !== connectionId),
    credentials: snapshot.credentials.filter((item) => item.id !== connection?.credentialId),
    selectedConnectionId:
      snapshot.selectedConnectionId === connectionId ? null : snapshot.selectedConnectionId,
  }
  emit()
}

export function deleteCredential(credentialId: string) {
  snapshot = {
    ...snapshot,
    credentials: snapshot.credentials.filter((item) => item.id !== credentialId),
    connections: snapshot.connections.filter((item) => item.credentialId !== credentialId),
    selectedConnectionId: snapshot.connections.some(
      (item) => item.id === snapshot.selectedConnectionId && item.credentialId !== credentialId
    )
      ? snapshot.selectedConnectionId
      : null,
  }
  emit()
}

function updateConnection(
  connectionId: string,
  updater: (connection: ConnectorConnection) => ConnectorConnection
) {
  snapshot = {
    ...snapshot,
    connections: snapshot.connections.map((item) =>
      item.id === connectionId ? updater(item) : item
    ),
  }
  emit()
}

export function setSheetRows(connectionId: string, kind: SheetKind, rows: SheetRow[]) {
  updateConnection(connectionId, (connection) => ({
    ...connection,
    sheets: { ...connection.sheets, [kind]: rows },
  }))
}

export function addDataRow(connectionId: string, values: Record<string, unknown> = {}): SheetRow | undefined {
  const connection = snapshot.connections.find((item) => item.id === connectionId)
  const connector = connection ? getConnector(connection.connectorId) : undefined
  if (!connection || !connector) {
    return undefined
  }
  const row = { ...emptyFromFields(connector.dataFields), ...values, id: crypto.randomUUID() }
  updateConnection(connectionId, (item) => ({
    ...item,
    sheets: { ...item.sheets, data: [...item.sheets.data, row] },
  }))
  return row
}

export function addVariableRow(connectionId: string, kind: "in" | "out"): SheetRow | undefined {
  const connection = snapshot.connections.find((item) => item.id === connectionId)
  if (!connection) {
    return undefined
  }
  const row: SheetRow =
    kind === "in"
      ? {
          id: crypto.randomUUID(),
          key: "",
          type: "short-text",
          required: false,
          default: "",
          description: "",
        }
      : {
          id: crypto.randomUUID(),
          key: "",
          type: "short-text",
          description: "",
          sample: "",
        }
  updateConnection(connectionId, (item) => ({
    ...item,
    sheets: { ...item.sheets, [kind]: [...item.sheets[kind], row] },
  }))
  return row
}

function buildOutRow(connector: Connector, dataRow: SheetRow, inVars: Record<string, unknown>): SheetRow {
  const row: SheetRow = { id: crypto.randomUUID() }
  for (const item of connector.outFields) {
    if (item.id === "updatedRows" || item.id === "rows") {
      row[item.id] = 1
      continue
    }
    if (item.id === "updatedCells") {
      row[item.id] = connector.dataFields.length
      continue
    }
    if (item.id === "updatedRange") {
      const sheetName = String(inVars.sheetName ?? "Sheet1")
      row[item.id] = `${sheetName}!A2:D2`
      continue
    }
    if (item.id === "spreadsheetId") {
      row[item.id] = String(inVars.spreadsheetId || "spreadsheet")
      continue
    }
    if (item.id === "ok") {
      row[item.id] = true
      continue
    }
    if (item.id === "status") {
      row[item.id] = "ok"
      continue
    }
    if (dataRow[item.id] !== undefined && dataRow[item.id] !== "") {
      row[item.id] = dataRow[item.id]
      continue
    }
    row[item.id] = item.defaultValue ?? `${item.id}-${String(row.id).slice(0, 8)}`
  }
  return row
}

export function insertDataRows(connectionId: string, rowIds?: string[]) {
  const connection = snapshot.connections.find((item) => item.id === connectionId)
  const connector = connection ? getConnector(connection.connectorId) : undefined
  if (!connection || !connector) {
    return
  }
  const selected = new Set(rowIds ?? connection.sheets.data.map((row) => row.id))
  const inVars = inVarMap(connection.sheets.in)
  const outRows: SheetRow[] = []
  const data = connection.sheets.data.map((row) => {
    if (!selected.has(row.id)) {
      return row
    }
    outRows.push(buildOutRow(connector, row, inVars))
    return { ...row, inserted: true }
  })
  updateConnection(connectionId, (item) => ({
    ...item,
    sheets: {
      ...item.sheets,
      data,
      out: [...item.sheets.out, ...outRows],
    },
  }))
}
