import { contracts, type IoSchemaField, type IoValueType } from "@workspace/integrations"

import { fileListOutputs, fileReadOutputs, fileWriteOutputs } from "./io-contracts"
import { parseMapping, parseSchemaBuilder } from "./structured-fields"
import type { WorkflowNodeType } from "./types"

function inferType(value: unknown): IoValueType {
  if (value === null || value === undefined) {
    return "any"
  }
  if (Array.isArray(value)) {
    return "array"
  }
  if (typeof value === "boolean") {
    return "boolean"
  }
  if (typeof value === "number") {
    return "number"
  }
  if (typeof value === "object") {
    return "object"
  }
  return "string"
}

export function inferSchemaFromSample(sample: unknown, key = "result"): IoSchemaField[] {
  if (sample && typeof sample === "object" && !Array.isArray(sample)) {
    return Object.entries(sample as Record<string, unknown>).map(([child, value]) => ({
      key: child,
      label: child,
      type: inferType(value),
      optional: true,
      fields:
        value && typeof value === "object" && !Array.isArray(value)
          ? inferSchemaFromSample(value, child)
          : undefined,
    }))
  }
  return [{ key, label: key, type: inferType(sample) }]
}

function mappingSchema(config: Record<string, string>): IoSchemaField[] {
  const mapping = parseMapping(config.mapping || config.expression || config.values)
  const pick = mapping.filter((row) => row.op === "pick").map((row) => row.path)
  const omit = new Set(mapping.filter((row) => row.op === "omit" || row.op === "remove").map((row) => row.path))
  const fields: IoSchemaField[] = []
  for (const row of mapping) {
    if (row.op === "omit" || row.op === "remove") {
      continue
    }
    const key = row.op === "rename" ? row.value || row.path : row.path
    if (!key || omit.has(key)) {
      continue
    }
    if (pick.length && !pick.includes(row.path) && row.op !== "set") {
      continue
    }
    fields.push({
      key,
      label: key,
      type: row.type === "auto" ? "any" : row.type === "json" ? "object" : row.type,
    })
  }
  return fields
}

function schemaRows(configKey: string, config: Record<string, string>): IoSchemaField[] {
  return parseSchemaBuilder(config[configKey]).map((row): IoSchemaField => ({
    key: row.key,
    label: row.key,
    type: row.type,
    optional: !row.required,
    description: row.description || undefined,
  }))
}

function inferredFields(
  catalog: WorkflowNodeType,
  config: Record<string, string>,
  sample?: unknown
): IoSchemaField[] {
  if (sample !== undefined) {
    return inferSchemaFromSample(sample)
  }
  if (catalog.id === "set" || catalog.id === "transform" || catalog.id === "code") {
    const mapped = mappingSchema(config)
    if (catalog.id === "code") {
      return [...mapped, ...schemaRows("outputSchema", config)]
    }
    return mapped
  }
  if (catalog.id === "ai-extract") {
    return schemaRows("schema", config)
  }
  if (catalog.id === "manual") {
    const fromSchema = schemaRows("exampleSchema", config)
    const raw = config.examplePayload?.trim()
    if (!raw) {
      return fromSchema
    }
    try {
      return [...fromSchema, ...inferSchemaFromSample(JSON.parse(raw))]
    } catch {
      return fromSchema
    }
  }
  return []
}

function declaredFields(
  catalog: WorkflowNodeType,
  config: Record<string, string>
): IoSchemaField[] {
  if (catalog.id === "file") {
    if (config.operation === "write" || config.operation === "delete") {
      return fileWriteOutputs
    }
    if (config.operation === "list") {
      return fileListOutputs
    }
    return fileReadOutputs
  }
  if (catalog.id === "github") {
    if (config.action === "create_comment") {
      return contracts.githubCommentOutputs
    }
    if (config.action === "create_pull_request") {
      return contracts.githubPullRequestOutputs
    }
    return contracts.githubIssueOutputs
  }
  return catalog.outputs ?? []
}

export function resolveOutputSchema(
  catalog: WorkflowNodeType,
  config: Record<string, string>,
  sample?: unknown
): IoSchemaField[] {
  const declared = declaredFields(catalog, config)
  const declaredKeys = new Set(declared.map((field) => field.key))
  const extra = inferredFields(catalog, config, sample).filter(
    (field) => field.key && !declaredKeys.has(field.key)
  )
  return [...declared, ...extra]
}

/** Union of port-specific schemas, otherwise the resolved Out contract. */
export function outputsForNode(
  catalog: WorkflowNodeType,
  config: Record<string, string>
): IoSchemaField[] {
  if (catalog.outputByPort) {
    const merged = new Map<string, IoSchemaField>()
    for (const fields of Object.values(catalog.outputByPort)) {
      for (const field of fields) {
        if (!merged.has(field.key)) {
          merged.set(field.key, field)
        }
      }
    }
    return [...merged.values()]
  }
  return resolveOutputSchema(catalog, config)
}
