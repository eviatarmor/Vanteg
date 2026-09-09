import { useSyncExternalStore } from "react"

import {
  isSystemColumnId,
  nowTimestamp,
  systemTimestampColumns,
} from "./system-columns"
import { isTextColumnVariant, isTimeColumnVariant } from "./column-types"
import type {
  Database,
  DatabaseCellVariant,
  DatabaseColumn,
  DatabaseRow,
  DatabaseSchema,
  DatabaseTable,
  DataSnapshot,
  KeyValueItem,
  SelectOption,
  TextFormat,
} from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "item"
}

function createSeed(): DataSnapshot {
  return {
    databases: [
      {
        id: "db-production",
        name: "production",
        schemas: [
          {
            id: "schema-production-public",
            name: "public",
            tables: [
              {
                id: "table-users",
                name: "users",
                columns: [
                  { id: "name", name: "Name", variant: "short-text" },
                  { id: "email", name: "Email", variant: "short-text" },
                  {
                    id: "role",
                    name: "Role",
                    variant: "select",
                    options: [
                      { label: "Admin", value: "admin" },
                      { label: "Member", value: "member" },
                    ],
                  },
                  { id: "active", name: "Active", variant: "checkbox" },
                  ...systemTimestampColumns(),
                ],
                rows: [
                  {
                    id: "user-ada",
                    name: "Ada Lovelace",
                    email: "ada@vanteg.dev",
                    role: "admin",
                    active: true,
                    createdAt: "2026-03-01T12:00:00.000Z",
                    updatedAt: "2026-04-01T12:00:00.000Z",
                  },
                  {
                    id: "user-grace",
                    name: "Grace Hopper",
                    email: "grace@vanteg.dev",
                    role: "member",
                    active: true,
                    createdAt: "2026-03-02T12:00:00.000Z",
                    updatedAt: "2026-04-01T12:00:00.000Z",
                  },
                  {
                    id: "user-alan",
                    name: "Alan Turing",
                    email: "alan@vanteg.dev",
                    role: "member",
                    active: false,
                    createdAt: "2026-03-03T12:00:00.000Z",
                    updatedAt: "2026-03-20T12:00:00.000Z",
                  },
                ],
              },
              {
                id: "table-orders",
                name: "orders",
                columns: [
                  { id: "number", name: "Number", variant: "short-text" },
                  { id: "customer", name: "Customer", variant: "short-text" },
                  { id: "total", name: "Total", variant: "number" },
                  {
                    id: "status",
                    name: "Status",
                    variant: "select",
                    options: [
                      { label: "Paid", value: "paid" },
                      { label: "Pending", value: "pending" },
                      { label: "Refunded", value: "refunded" },
                    ],
                  },
                  ...systemTimestampColumns(),
                ],
                rows: [
                  {
                    id: "order-1001",
                    number: "ORD-1001",
                    customer: "Ada Lovelace",
                    total: 120.5,
                    status: "paid",
                    createdAt: "2026-03-10T12:00:00.000Z",
                    updatedAt: "2026-03-11T12:00:00.000Z",
                  },
                  {
                    id: "order-1002",
                    number: "ORD-1002",
                    customer: "Grace Hopper",
                    total: 48,
                    status: "pending",
                    createdAt: "2026-03-12T12:00:00.000Z",
                    updatedAt: "2026-03-12T12:00:00.000Z",
                  },
                ],
              },
            ],
          },
          {
            id: "schema-production-analytics",
            name: "analytics",
            tables: [
              {
                id: "table-events",
                name: "events",
                columns: [
                  { id: "name", name: "Name", variant: "short-text" },
                  { id: "day", name: "Day", variant: "date" },
                  { id: "count", name: "Count", variant: "number" },
                  ...systemTimestampColumns(),
                ],
                rows: [
                  {
                    id: "event-1",
                    name: "workflow.deployed",
                    day: "2026-04-01",
                    count: 12,
                    createdAt: "2026-04-01T08:00:00.000Z",
                    updatedAt: "2026-04-01T08:00:00.000Z",
                  },
                  {
                    id: "event-2",
                    name: "workflow.run",
                    day: "2026-04-02",
                    count: 140,
                    createdAt: "2026-04-02T08:00:00.000Z",
                    updatedAt: "2026-04-02T08:00:00.000Z",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "db-staging",
        name: "staging",
        schemas: [
          {
            id: "schema-staging-public",
            name: "public",
            tables: [
              {
                id: "table-staging-users",
                name: "users",
                columns: [
                  { id: "name", name: "Name", variant: "short-text" },
                  { id: "email", name: "Email", variant: "short-text" },
                  ...systemTimestampColumns(),
                ],
                rows: [
                  {
                    id: "staging-user-1",
                    name: "Test User",
                    email: "test@staging.vanteg.dev",
                    createdAt: "2026-03-15T12:00:00.000Z",
                    updatedAt: "2026-03-15T12:00:00.000Z",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    variableGroups: [
      {
        id: "vars-global",
        name: "Global",
        items: [
          { id: "var-app-name", key: "APP_NAME", value: "Vanteg" },
          { id: "var-api-url", key: "API_URL", value: "https://api.vanteg.dev" },
          { id: "var-region", key: "DEFAULT_REGION", value: "us-east-1" },
        ],
      },
      {
        id: "vars-staging",
        name: "Staging",
        items: [
          {
            id: "var-staging-api",
            key: "API_URL",
            value: "https://staging.api.vanteg.dev",
          },
          { id: "var-staging-log", key: "LOG_LEVEL", value: "debug" },
        ],
      },
      {
        id: "vars-production",
        name: "Production",
        items: [
          { id: "var-prod-api", key: "API_URL", value: "https://api.vanteg.dev" },
          { id: "var-prod-log", key: "LOG_LEVEL", value: "info" },
        ],
      },
    ],
    secretGroups: [
      {
        id: "secrets-global",
        name: "Global",
        items: [
          { id: "secret-jwt", key: "JWT_SECRET", value: "dev-jwt-secret" },
          {
            id: "secret-stripe",
            key: "STRIPE_SECRET_KEY",
            value: "sk_test_vanteg",
          },
        ],
      },
      {
        id: "secrets-staging",
        name: "Staging",
        items: [
          {
            id: "secret-staging-db",
            key: "DATABASE_URL",
            value: "postgres://vanteg:vanteg@localhost:5432/vanteg_staging",
          },
        ],
      },
      {
        id: "secrets-production",
        name: "Production",
        items: [
          {
            id: "secret-xai",
            key: "XAI_API_KEY",
            value: "xai-dev-key",
          },
          {
            id: "secret-prod-db",
            key: "DATABASE_URL",
            value: "postgres://vanteg:vanteg@localhost:5432/vanteg",
          },
        ],
      },
    ],
    selectedTableId: "table-users",
    selectedSchemaId: "schema-production-public",
    selectedVariableGroupId: "vars-global",
    selectedSecretGroupId: "secrets-global",
  }
}

let snapshot: DataSnapshot = createSeed()

export function subscribeDataStore(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDataSnapshot(): DataSnapshot {
  return snapshot
}

export function useDataStore(): DataSnapshot {
  return useSyncExternalStore(subscribeDataStore, getDataSnapshot, getDataSnapshot)
}

export function resetDataStore(): void {
  snapshot = createSeed()
  emit()
}

export function findSchema(
  databases: readonly Database[],
  schemaId: string
): { database: Database; schema: DatabaseSchema } | undefined {
  for (const database of databases) {
    const schema = database.schemas.find((item) => item.id === schemaId)
    if (schema) {
      return { database, schema }
    }
  }
  return undefined
}

export function findTable(
  databases: readonly Database[],
  tableId: string
): { database: Database; schema: DatabaseSchema; table: DatabaseTable } | undefined {
  for (const database of databases) {
    for (const schema of database.schemas) {
      const table = schema.tables.find((item) => item.id === tableId)
      if (table) {
        return { database, schema, table }
      }
    }
  }
  return undefined
}

export function selectDatabaseNode(id: string): void {
  const tableMatch = findTable(snapshot.databases, id)
  if (!tableMatch) {
    return
  }
  snapshot = {
    ...snapshot,
    selectedTableId: tableMatch.table.id,
    selectedSchemaId: tableMatch.schema.id,
  }
  emit()
}

export function selectVariableGroup(id: string): void {
  if (!snapshot.variableGroups.some((group) => group.id === id)) {
    return
  }
  snapshot = { ...snapshot, selectedVariableGroupId: id }
  emit()
}

export function selectSecretGroup(id: string): void {
  if (!snapshot.secretGroups.some((group) => group.id === id)) {
    return
  }
  snapshot = { ...snapshot, selectedSecretGroupId: id }
  emit()
}

function userFieldsChanged(previous: DatabaseRow, next: DatabaseRow): boolean {
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)])
  for (const key of keys) {
    if (key === "id" || isSystemColumnId(key)) {
      continue
    }
    if (previous[key] !== next[key]) {
      return true
    }
  }
  return false
}

function applySystemTimestamps(
  previous: DatabaseRow | undefined,
  row: DatabaseRow,
  now: string
): DatabaseRow {
  if (!previous) {
    return { ...row, createdAt: now, updatedAt: now }
  }
  const createdAt = typeof previous.createdAt === "string" ? previous.createdAt : now
  const updatedAt = userFieldsChanged(previous, row)
    ? now
    : typeof previous.updatedAt === "string"
      ? previous.updatedAt
      : now
  return { ...row, createdAt, updatedAt }
}

export function updateTableRows(tableId: string, rows: DatabaseRow[]): void {
  const match = findTable(snapshot.databases, tableId)
  if (!match) {
    return
  }
  const previousById = new Map(match.table.rows.map((row) => [row.id, row]))
  const now = nowTimestamp()
  const nextRows = rows.map((row) =>
    applySystemTimestamps(previousById.get(row.id), row, now)
  )
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) =>
          table.id === tableId ? { ...table, rows: nextRows } : table
        ),
      })),
    })),
  }
  emit()
}

function emptyCellValue(variant: DatabaseCellVariant): unknown {
  if (variant === "checkbox") {
    return false
  }
  if (
    variant === "number" ||
    variant === "date" ||
    variant === "time" ||
    variant === "datetime" ||
    variant === "select"
  ) {
    return null
  }
  return ""
}

function uniqueColumnId(table: DatabaseTable, name: string): string {
  const base = slugify(name)
  const used = new Set(table.columns.map((column) => column.id))
  if (!used.has(base)) {
    return base
  }
  let index = 2
  while (used.has(`${base}-${index}`)) {
    index += 1
  }
  return `${base}-${index}`
}

function insertIndexForNewColumn(columns: readonly DatabaseColumn[]): number {
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    if (!isSystemColumnId(columns[index]?.id ?? "")) {
      return index + 1
    }
  }
  return 0
}

export function addTableRow(tableId: string): DatabaseRow | undefined {
  const match = findTable(snapshot.databases, tableId)
  if (!match) {
    return undefined
  }
  const now = nowTimestamp()
  const row: DatabaseRow = { id: crypto.randomUUID(), createdAt: now, updatedAt: now }
  for (const column of match.table.columns) {
    if (isSystemColumnId(column.id)) {
      continue
    }
    row[column.id] = emptyCellValue(column.variant)
  }
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) =>
          table.id === tableId ? { ...table, rows: [...table.rows, row] } : table
        ),
      })),
    })),
  }
  emit()
  return row
}

export type TableColumnInput = {
  name: string
  variant: DatabaseCellVariant
  options?: SelectOption[]
  regex?: string
  textFormat?: TextFormat
  showSeconds?: boolean
}

function columnFieldsFromInput(input: TableColumnInput): Omit<DatabaseColumn, "id" | "system"> {
  const name = input.name.trim()
  const regex = isTextColumnVariant(input.variant) ? input.regex?.trim() : undefined
  return {
    name,
    variant: input.variant,
    options: input.variant === "select" ? input.options : undefined,
    regex: regex || undefined,
    textFormat: isTextColumnVariant(input.variant) ? input.textFormat : undefined,
    showSeconds:
      isTimeColumnVariant(input.variant) && input.showSeconds ? true : undefined,
  }
}

export function addTableColumn(
  tableId: string,
  input: TableColumnInput
): DatabaseColumn | undefined {
  const fields = columnFieldsFromInput(input)
  if (!fields.name) {
    return undefined
  }
  const match = findTable(snapshot.databases, tableId)
  if (!match) {
    return undefined
  }
  const column: DatabaseColumn = {
    id: uniqueColumnId(match.table, fields.name),
    ...fields,
  }
  const empty = emptyCellValue(column.variant)
  const insertAt = insertIndexForNewColumn(match.table.columns)
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) => {
          if (table.id !== tableId) {
            return table
          }
          const columns = [...table.columns]
          columns.splice(insertAt, 0, column)
          return {
            ...table,
            columns,
            rows: table.rows.map((row) => ({ ...row, [column.id]: empty })),
          }
        }),
      })),
    })),
  }
  emit()
  return column
}

export function deleteTableRows(tableId: string, rowIds: readonly string[]): void {
  const idSet = new Set(rowIds)
  if (idSet.size === 0) {
    return
  }
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) =>
          table.id === tableId
            ? { ...table, rows: table.rows.filter((row) => !idSet.has(row.id)) }
            : table
        ),
      })),
    })),
  }
  emit()
}

export function reorderTableColumn(
  tableId: string,
  columnId: string,
  targetColumnId: string | null
): void {
  const match = findTable(snapshot.databases, tableId)
  if (!match) {
    return
  }
  const columns = match.table.columns
  const from = columns.findIndex((column) => column.id === columnId)
  if (from < 0) {
    return
  }
  const to =
    targetColumnId === null
      ? columns.length
      : columns.findIndex((column) => column.id === targetColumnId)
  if (to < 0 || from === to) {
    return
  }
  const next = [...columns]
  const [moved] = next.splice(from, 1)
  if (!moved) {
    return
  }
  const insertAt = from < to ? to - 1 : to
  next.splice(insertAt, 0, moved)
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) =>
          table.id === tableId ? { ...table, columns: next } : table
        ),
      })),
    })),
  }
  emit()
}

export function shiftTableColumn(
  tableId: string,
  columnId: string,
  direction: -1 | 1
): void {
  const match = findTable(snapshot.databases, tableId)
  if (!match) {
    return
  }
  const from = match.table.columns.findIndex((column) => column.id === columnId)
  if (from < 0) {
    return
  }
  const neighbor = match.table.columns[from + direction]
  if (!neighbor) {
    return
  }
  if (direction < 0) {
    reorderTableColumn(tableId, columnId, neighbor.id)
    return
  }
  const afterNeighbor = match.table.columns[from + 2]
  reorderTableColumn(tableId, columnId, afterNeighbor?.id ?? null)
}

export function updateTableColumn(
  tableId: string,
  columnId: string,
  input: TableColumnInput
): DatabaseColumn | undefined {
  if (isSystemColumnId(columnId)) {
    return undefined
  }
  const fields = columnFieldsFromInput(input)
  if (!fields.name) {
    return undefined
  }
  const match = findTable(snapshot.databases, tableId)
  const existing = match?.table.columns.find((column) => column.id === columnId)
  if (!match || !existing) {
    return undefined
  }
  const column: DatabaseColumn = { ...existing, ...fields }
  const variantChanged = existing.variant !== fields.variant
  const empty = emptyCellValue(fields.variant)
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) => {
          if (table.id !== tableId) {
            return table
          }
          return {
            ...table,
            columns: table.columns.map((item) => (item.id === columnId ? column : item)),
            rows: variantChanged
              ? table.rows.map((row) => ({ ...row, [columnId]: empty }))
              : table.rows,
          }
        }),
      })),
    })),
  }
  emit()
  return column
}

export function deleteTableColumn(tableId: string, columnId: string): void {
  if (isSystemColumnId(columnId)) {
    return
  }
  snapshot = {
    ...snapshot,
    databases: snapshot.databases.map((database) => ({
      ...database,
      schemas: database.schemas.map((schema) => ({
        ...schema,
        tables: schema.tables.map((table) => {
          if (table.id !== tableId) {
            return table
          }
          return {
            ...table,
            columns: table.columns.filter((column) => column.id !== columnId),
            rows: table.rows.map((row) => {
              const { [columnId]: _removed, ...rest } = row
              return rest as DatabaseRow
            }),
          }
        }),
      })),
    })),
  }
  emit()
}

export function createTable(name: string): DatabaseTable | undefined {
  const trimmed = name.trim()
  if (!trimmed) {
    return undefined
  }
  const schemaMatch = findSchema(snapshot.databases, snapshot.selectedSchemaId)
  if (!schemaMatch) {
    return undefined
  }
  const table: DatabaseTable = {
    id: `table-${slugify(trimmed)}-${crypto.randomUUID().slice(0, 8)}`,
    name: trimmed,
    columns: [
      { id: "name", name: "Name", variant: "short-text" },
      { id: "notes", name: "Notes", variant: "short-text" },
      ...systemTimestampColumns(),
    ],
    rows: [],
  }
  snapshot = {
    ...snapshot,
    selectedTableId: table.id,
    selectedSchemaId: schemaMatch.schema.id,
    databases: snapshot.databases.map((database) =>
      database.id === schemaMatch.database.id
        ? {
            ...database,
            schemas: database.schemas.map((schema) =>
              schema.id === schemaMatch.schema.id
                ? { ...schema, tables: [...schema.tables, table] }
                : schema
            ),
          }
        : database
    ),
  }
  emit()
  return table
}

function updateGroupItems(
  kind: "variables" | "secrets",
  groupId: string,
  items: KeyValueItem[]
): void {
  const key = kind === "variables" ? "variableGroups" : "secretGroups"
  snapshot = {
    ...snapshot,
    [key]: snapshot[key].map((group) =>
      group.id === groupId ? { ...group, items } : group
    ),
  }
  emit()
}

export function setVariableItems(groupId: string, items: KeyValueItem[]): void {
  updateGroupItems("variables", groupId, items)
}

export function setSecretItems(groupId: string, items: KeyValueItem[]): void {
  updateGroupItems("secrets", groupId, items)
}

function addKeyedItem(
  kind: "variables" | "secrets",
  key: string,
  value = ""
): KeyValueItem | undefined {
  const trimmed = key.trim()
  if (!trimmed) {
    return undefined
  }
  const groups = kind === "variables" ? snapshot.variableGroups : snapshot.secretGroups
  const groupId =
    kind === "variables" ? snapshot.selectedVariableGroupId : snapshot.selectedSecretGroupId
  const group = groups.find((item) => item.id === groupId)
  if (!group) {
    return undefined
  }
  if (group.items.some((item) => item.key === trimmed)) {
    return undefined
  }
  const item: KeyValueItem = {
    id: crypto.randomUUID(),
    key: trimmed,
    value,
  }
  updateGroupItems(kind, group.id, [...group.items, item])
  return item
}

export function createVariable(key: string, value = ""): KeyValueItem | undefined {
  return addKeyedItem("variables", key, value)
}

export function createSecret(key: string, value = ""): KeyValueItem | undefined {
  return addKeyedItem("secrets", key, value)
}

export function addKeyedRow(kind: "variables" | "secrets"): KeyValueItem | undefined {
  const groups = kind === "variables" ? snapshot.variableGroups : snapshot.secretGroups
  const groupId =
    kind === "variables" ? snapshot.selectedVariableGroupId : snapshot.selectedSecretGroupId
  const group = groups.find((item) => item.id === groupId)
  if (!group) {
    return undefined
  }
  const item: KeyValueItem = {
    id: crypto.randomUUID(),
    key: "",
    value: "",
  }
  updateGroupItems(kind, group.id, [...group.items, item])
  return item
}

export function listExpandedDatabaseIds(databases: readonly Database[]): string[] {
  return databases.flatMap((database) => [
    database.id,
    ...database.schemas.map((schema) => schema.id),
  ])
}
