import { isSecretSetupKey, type IoSchemaField } from "@workspace/integrations"

import { getNodeType } from "./node-catalog"
import type {
  VantegNode,
  VantegNodeData,
  NodeKind,
  NodeField,
  NodeVar,
  NodeVarType,
} from "./types"

/** Keys (and header names) treated as secret-sensitive workflow I/O. */
const SECRET_KEY_TOKENS = new Set([
  "token",
  "password",
  "passwd",
  "secret",
  "apikey",
  "clientsecret",
  "accesskey",
  "privatekey",
  "credentialid",
  "authorization",
  "bearertoken",
  "accesstoken",
  "refreshtoken",
  "sharedsecret",
  "signingsecret",
])

const TOKEN_PREFIX_DENY = new Set(["next", "page", "continuation", "cursor"])

function compactKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
}

function splitKeyTokens(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase())
}

/** True when a var/config key name looks secret-sensitive. */
export function isSecretIoKey(key: string): boolean {
  const compact = compactKey(key)
  if (!compact) {
    return false
  }
  if (SECRET_KEY_TOKENS.has(compact) || isSecretSetupKey(key)) {
    return true
  }
  const parts = splitKeyTokens(key)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (part === "token") {
      const prev = parts[i - 1] ?? ""
      if (TOKEN_PREFIX_DENY.has(prev)) {
        continue
      }
      return true
    }
    if (SECRET_KEY_TOKENS.has(part)) {
      return true
    }
    if (i > 0 && SECRET_KEY_TOKENS.has(parts[i - 1] + part)) {
      return true
    }
  }
  return false
}

export function isSecretNodeVar(
  item: Pick<NodeVar, "key" | "secret">,
  field?: Pick<NodeField, "secret"> | undefined
): boolean {
  if (item.secret === true || field?.secret === true) {
    return true
  }
  return isSecretIoKey(item.key)
}

export function sanitizeIoVarValue(secret: boolean, value: string): string {
  if (secret && value && !(value.includes("{{") && value.includes("}}"))) {
    return ""
  }
  return value
}

const OBJECT_KEYS = new Set(["payload", "body", "headers", "query", "result", "data"])
const NUMBER_KEYS = new Set(["status", "index", "concurrency", "amount", "timeout"])
const BOOLEAN_KEYS = new Set(["ok"])

export function nodeVarType(item: Pick<NodeVar, "key" | "type" | "children">): NodeVarType {
  if (item.type) {
    return item.type
  }
  if (item.children?.length) {
    return "object"
  }
  if (BOOLEAN_KEYS.has(item.key)) {
    return "boolean"
  }
  if (NUMBER_KEYS.has(item.key)) {
    return "number"
  }
  if (OBJECT_KEYS.has(item.key)) {
    return "object"
  }
  return "string"
}

function makeVar(
  key: string,
  value = "",
  options?: { secret?: boolean; type?: NodeVarType; children?: NodeVar[] }
): NodeVar {
  const secret = options?.secret === true || isSecretIoKey(key)
  const safeValue = sanitizeIoVarValue(secret, value)
  const type = options?.type ?? nodeVarType({ key, type: options?.type, children: options?.children })
  const node: NodeVar = { id: crypto.randomUUID(), key, value: safeValue, type }
  if (secret) {
    node.secret = true
  }
  if (options?.children) {
    node.children = options.children
  }
  return node
}

function cloneVarTree(item: NodeVar, value: string): NodeVar {
  return makeVar(item.key, value, {
    secret: isSecretNodeVar(item),
    type: nodeVarType(item),
    children: item.children?.map((child) =>
      cloneVarTree(
        child,
        value.endsWith("}}")
          ? `${value.slice(0, -2)}.${child.key}}}`
          : value
      )
    ),
  })
}

function schemaToVars(fields: readonly IoSchemaField[] | undefined): NodeVar[] {
  return (fields ?? [])
    .filter((field) => !isSecretSetupKey(field.key) && field.secret !== true)
    .map((field) => {
      const nested = field.fields?.length
        ? schemaToVars(field.fields)
        : field.items
          ? schemaToVars([{ ...field.items, key: field.items.key || "item" }])
          : undefined
      return makeVar(field.key, "", {
        secret: field.secret === true,
        type: field.type,
        children: nested?.length ? nested : undefined,
      })
    })
}

export function defaultNodeIo(catalogId: string): {
  inVars: NodeVar[]
  outVars: NodeVar[]
} {
  const catalog = getNodeType(catalogId)
  const kind: NodeKind = catalog?.kind ?? "action"
  const outputs = catalog?.outputs ?? []
  const inputs = catalog?.inputs ?? []

  if (kind === "trigger") {
    return {
      inVars: [],
      outVars: schemaToVars(outputs),
    }
  }

  return {
    inVars: schemaToVars(inputs),
    outVars: schemaToVars(outputs),
  }
}

export function mapUpstreamOutputs(
  source: VantegNode,
  target: VantegNode
): VantegNodeData {
  const existing = new Set(target.data.inVars.map((item) => item.key))
  const mapped = source.data.outVars
    .filter((item) => item.key && !existing.has(item.key))
    .map((item) =>
      cloneVarTree(item, "{{" + source.data.label + "." + item.key + "}}")
    )

  return {
    ...target.data,
    inVars: [...target.data.inVars, ...mapped],
  }
}

export function wireConnection(
  nodes: VantegNode[],
  sourceId: string | null | undefined,
  targetId: string | null | undefined
): VantegNode[] {
  if (!sourceId || !targetId || sourceId === targetId) {
    return nodes
  }
  const source = nodes.find((node) => node.id === sourceId)
  const target = nodes.find((node) => node.id === targetId)
  if (!source || !target) {
    return nodes
  }
  const data = mapUpstreamOutputs(source, target)
  return nodes.map((node) => (node.id === target.id ? { ...node, data } : node))
}
