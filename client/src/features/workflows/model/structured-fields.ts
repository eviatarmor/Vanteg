export interface KeyValueRow {
  id: string
  key: string
  value: string
}

export interface MappingRow {
  id: string
  op: "set" | "replace" | "rename" | "remove" | "pick" | "omit"
  path: string
  value: string
  type: "string" | "number" | "boolean" | "json" | "auto"
}

export interface SchemaRow {
  id: string
  key: string
  type: "string" | "number" | "boolean" | "object" | "array" | "datetime"
  description: string
  required: boolean
}

export interface RouteRow {
  id: string
  name: string
  value: string
}

function parseJsonArray<T>(value: string | undefined): T[] | null {
  if (!value?.trim()) {
    return []
  }
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}

export function parseKeyValue(value: string | undefined): KeyValueRow[] {
  const parsed = parseJsonArray<Partial<KeyValueRow>>(value)
  if (parsed) {
    return parsed
      .filter((row) => row && (row.key || row.value))
      .map((row) => ({
        id: row.id || crypto.randomUUID(),
        key: row.key ?? "",
        value: row.value ?? "",
      }))
  }
  if (!value?.trim()) {
    return []
  }
  try {
    const object = JSON.parse(value) as Record<string, unknown>
    if (object && typeof object === "object" && !Array.isArray(object)) {
      return Object.entries(object).map(([key, item]) => ({
        id: crypto.randomUUID(),
        key,
        value: typeof item === "string" ? item : JSON.stringify(item),
      }))
    }
  } catch {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split("=")
        return {
          id: crypto.randomUUID(),
          key: key?.trim() ?? "",
          value: rest.join("=").trim(),
        }
      })
  }
  return []
}

export function serializeKeyValue(rows: KeyValueRow[]): string {
  const object: Record<string, string> = {}
  for (const row of rows) {
    if (!row.key) {
      continue
    }
    object[row.key] = row.value
  }
  return JSON.stringify(object)
}

export function parseMapping(value: string | undefined): MappingRow[] {
  const parsed = parseJsonArray<Partial<MappingRow>>(value)
  if (parsed) {
    return parsed.map((row) => ({
      id: row.id || crypto.randomUUID(),
      op: row.op ?? "set",
      path: row.path ?? "",
      value: row.value ?? "",
      type: row.type ?? "auto",
    }))
  }
  if (!value?.trim()) {
    return []
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [path, ...rest] = line.split("=")
      return {
        id: crypto.randomUUID(),
        op: "set" as const,
        path: path?.trim() ?? "",
        value: rest.join("=").trim(),
        type: "auto" as const,
      }
    })
}

export function serializeMapping(rows: MappingRow[]): string {
  return JSON.stringify(rows)
}

export function parseSchemaBuilder(value: string | undefined): SchemaRow[] {
  const parsed = parseJsonArray<Partial<SchemaRow>>(value)
  if (parsed) {
    return parsed.map((row) => ({
      id: row.id || crypto.randomUUID(),
      key: row.key ?? "",
      type: row.type ?? "string",
      description: row.description ?? "",
      required: row.required === true,
    }))
  }
  if (!value?.trim()) {
    return []
  }
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((key) => ({
      id: crypto.randomUUID(),
      key,
      type: "string" as const,
      description: "",
      required: false,
    }))
}

export function serializeSchemaBuilder(rows: SchemaRow[]): string {
  return JSON.stringify(rows)
}

export function defaultRoutes(): RouteRow[] {
  return [
    { id: "a", name: "A", value: "" },
    { id: "b", name: "B", value: "" },
  ]
}

export function parseRoutes(value: string | undefined): RouteRow[] {
  const parsed = parseJsonArray<Partial<RouteRow>>(value)
  if (parsed && parsed.length > 0) {
    return parsed.map((row, index) => ({
      id: row.id || `route_${index + 1}`,
      name: row.name || row.id || `Route ${index + 1}`,
      value: row.value ?? "",
    }))
  }
  if (!value?.trim()) {
    return defaultRoutes()
  }
  try {
    const object = JSON.parse(value) as Record<string, unknown>
    if (object && typeof object === "object" && !Array.isArray(object)) {
      const entries = Object.entries(object)
      if (entries.length === 0) {
        return defaultRoutes()
      }
      return entries.map(([name, item], index) => ({
        id: index === 0 ? "a" : index === 1 ? "b" : `route_${index + 1}`,
        name,
        value: typeof item === "string" ? item : JSON.stringify(item),
      }))
    }
  } catch {
    const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) {
      return defaultRoutes()
    }
    return lines.map((name, index) => ({
      id: index === 0 ? "a" : index === 1 ? "b" : `route_${index + 1}`,
      name,
      value: name,
    }))
  }
  return defaultRoutes()
}

export function serializeRoutes(rows: RouteRow[]): string {
  return JSON.stringify(rows)
}

export function uniqueRouteNames(rows: RouteRow[]): boolean {
  const names = rows.map((row) => row.name.trim().toLowerCase()).filter(Boolean)
  return new Set(names).size === names.length
}
