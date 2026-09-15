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
  if (SECRET_KEY_TOKENS.has(compact)) {
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
  if (secret && value && !(value.includes('{{') && value.includes('}}'))) {
    return ""
  }
  return value
}

type IoShape = {
  key: string
  type: NodeVarType
  secret?: boolean
  children?: IoShape[]
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

function typeFromField(field: NodeField): NodeVarType {
  if (field.control === "number") {
    return "number"
  }
  if (field.control === "boolean") {
    return "boolean"
  }
  if (field.language === "json") {
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

function uniqueKeys(keys: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const key of keys) {
    if (!key || seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push(key)
  }
  return result
}

function jsonObject(key: string, children: IoShape[] = []): IoShape {
  return { key, type: "object", children }
}

function extraOutShapes(catalogId: string, kind: NodeKind): IoShape[] {
  if (catalogId === "webhook") {
    return [
      jsonObject("headers", [
        { key: "content-type", type: "string" },
        { key: "authorization", type: "string", secret: true },
      ]),
      jsonObject("query", [{ key: "id", type: "string" }]),
      jsonObject("body", [
        { key: "id", type: "string" },
        jsonObject("data"),
      ]),
    ]
  }
  if (catalogId === "rss") {
    return [
      {
        key: "items",
        type: "array",
        children: [
          jsonObject("item", [
            { key: "title", type: "string" },
            { key: "url", type: "string" },
            { key: "publishedAt", type: "string" },
          ]),
        ],
      },
    ]
  }
  if (catalogId.startsWith("slack")) {
    return [
      { key: "ok", type: "boolean" },
      { key: "ts", type: "string" },
    ]
  }
  if (catalogId === "http" || catalogId.startsWith("http-")) {
    return [
      { key: "status", type: "number" },
      { key: "ok", type: "boolean" },
      jsonObject("body", [
        { key: "id", type: "string" },
        jsonObject("data"),
      ]),
    ]
  }
  if (catalogId === "loop") {
    return [
      jsonObject("item", [{ key: "id", type: "string" }]),
      { key: "index", type: "number" },
      { key: "ok", type: "boolean" },
    ]
  }
  if (kind === "trigger") {
    return [
      jsonObject("payload", [
        { key: "id", type: "string" },
        jsonObject("data"),
      ]),
    ]
  }
  return [
    { key: "ok", type: "boolean" },
    jsonObject("result", [
      { key: "id", type: "string" },
      jsonObject("data"),
    ]),
  ]
}

function makeVarsFromShapes(shapes: IoShape[]): NodeVar[] {
  return shapes.map((shape) =>
    makeVar(shape.key, "", {
      secret: shape.secret === true || isSecretIoKey(shape.key),
      type: shape.type,
      children: shape.children?.length
        ? makeVarsFromShapes(shape.children)
        : undefined,
    })
  )
}

function makeVarsFromFields(fields: readonly NodeField[]): NodeVar[] {
  return uniqueKeys(fields.map((field) => field.key)).map((key) => {
    const field = fields.find((item) => item.key === key)
    return makeVar(key, "", {
      secret: field?.secret === true || isSecretIoKey(key),
      type: field ? typeFromField(field) : "string",
    })
  })
}

export function defaultNodeIo(catalogId: string): {
  inVars: NodeVar[]
  outVars: NodeVar[]
} {
  const catalog = getNodeType(catalogId)
  const kind = catalog?.kind ?? "action"
  const fields = catalog?.fields ?? []
  const extras = makeVarsFromShapes(extraOutShapes(catalogId, kind))
  const extraKeys = new Set(extras.map((item) => item.key))
  const fieldVars = makeVarsFromFields(fields).filter((item) => !extraKeys.has(item.key))

  if (kind === "trigger") {
    return {
      inVars: [],
      outVars: [...fieldVars, ...extras],
    }
  }

  return {
    inVars: fieldVars,
    outVars: extras,
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
