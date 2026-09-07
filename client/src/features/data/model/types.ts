export type DatabaseCellVariant =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "url"
  | "secret"

export interface SelectOption {
  label: string
  value: string
}

export interface DatabaseColumn {
  id: string
  name: string
  variant: DatabaseCellVariant
  options?: SelectOption[]
  system?: boolean
}

export type DatabaseRow = {
  id: string
  [key: string]: unknown
}

export interface DatabaseTable {
  id: string
  name: string
  columns: DatabaseColumn[]
  rows: DatabaseRow[]
}

export interface DatabaseSchema {
  id: string
  name: string
  tables: DatabaseTable[]
}

export interface Database {
  id: string
  name: string
  schemas: DatabaseSchema[]
}

export interface KeyValueItem {
  id: string
  key: string
  value: string
}

export interface KeyValueGroup {
  id: string
  name: string
  items: KeyValueItem[]
}

export interface DataSnapshot {
  databases: Database[]
  variableGroups: KeyValueGroup[]
  secretGroups: KeyValueGroup[]
  selectedTableId: string | null
  selectedSchemaId: string
  selectedVariableGroupId: string
  selectedSecretGroupId: string
}
