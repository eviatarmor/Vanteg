/** Shared runtime I/O schema and Setup field metadata for workflow + integration nodes. */

export type IoValueType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "json"
  | "date"
  | "datetime"
  | "binary"
  | "any"

export interface IoSchemaField {
  key: string
  label: string
  type: IoValueType
  description?: string
  optional?: boolean
  secret?: boolean
  fields?: IoSchemaField[]
  items?: IoSchemaField
}

export type FieldSection = "connection" | "parameters" | "options" | "execution"

export type FieldMode = "fixed" | "expression" | "either"

export interface FieldShowWhen {
  key: string
  equals?: string | readonly string[]
  notEquals?: string | readonly string[]
  truthy?: boolean
}

export type FieldValidationKind =
  | "required"
  | "integer"
  | "min"
  | "max"
  | "url"
  | "email"
  | "json"
  | "cron"
  | "regex"
  | "dateOrder"
  | "uniqueWebhookPath"
  | "uniqueRouteName"
  | "expressionRef"
  | "credential"
  | "resource"
  | "destructive"

export interface FieldValidationRule {
  kind: FieldValidationKind
  value?: number
  pattern?: string
  message?: string
  beforeKey?: string
  afterKey?: string
}

export function io(
  key: string,
  label: string,
  type: IoValueType,
  extra: Omit<Partial<IoSchemaField>, "key" | "label" | "type"> = {}
): IoSchemaField {
  return { key, label, type, ...extra }
}

export function ioObject(
  key: string,
  label: string,
  fields: IoSchemaField[],
  extra: Omit<Partial<IoSchemaField>, "key" | "label" | "type" | "fields"> = {}
): IoSchemaField {
  return { key, label, type: "object", fields, ...extra }
}

export function ioArray(
  key: string,
  label: string,
  items: IoSchemaField,
  extra: Omit<Partial<IoSchemaField>, "key" | "label" | "type" | "items"> = {}
): IoSchemaField {
  return { key, label, type: "array", items, ...extra }
}

export function flattenIoPaths(
  fields: readonly IoSchemaField[],
  prefix = ""
): string[] {
  const paths: string[] = []
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.key}` : field.key
    paths.push(path)
    if (field.fields?.length) {
      paths.push(...flattenIoPaths(field.fields, path))
    }
    if (field.items?.fields?.length) {
      paths.push(...flattenIoPaths(field.items.fields, path))
    }
  }
  return paths
}

export function findIoField(
  fields: readonly IoSchemaField[],
  path: string
): IoSchemaField | undefined {
  const [head, ...rest] = path.split(".")
  if (!head) {
    return undefined
  }
  const field = fields.find((item) => item.key === head)
  if (!field) {
    return undefined
  }
  if (rest.length === 0) {
    return field
  }
  const nested = field.fields ?? field.items?.fields
  if (!nested) {
    return undefined
  }
  return findIoField(nested, rest.join("."))
}

export function isSecretSetupKey(key: string): boolean {
  const compact = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  return (
    compact === "credentialid" ||
    compact === "token" ||
    compact === "secret" ||
    compact === "password" ||
    compact === "apikey" ||
    compact === "clientsecret" ||
    compact === "accesskey" ||
    compact === "privatekey" ||
    compact === "authorization" ||
    compact === "bearertoken" ||
    compact === "accesstoken" ||
    compact === "refreshtoken" ||
    compact === "sharedsecret" ||
    compact === "signingsecret"
  )
}
