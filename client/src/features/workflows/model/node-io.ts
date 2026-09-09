import { getNodeType } from "./node-catalog"
import type { VantegNode, VantegNodeData, NodeKind, NodeField, NodeVar } from "./types"

/** Keys (and header names) treated as secret-sensitive workflow I/O. */
const SECRET_KEY_TOKENS = [
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
] as const

function compactKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
}

/** True when a var/config key name looks secret-sensitive. */
export function isSecretIoKey(key: string): boolean {
  const compact = compactKey(key)
  if (!compact) {
    return false
  }
  return SECRET_KEY_TOKENS.some(
    (token) => compact === token || compact.endsWith(token)
  )
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

function makeVar(
  key: string,
  value = "",
  options?: { secret?: boolean }
): NodeVar {
  const secret = options?.secret === true || isSecretIoKey(key)
  // Never paste live tokens into defaults - keep empty unless a template path.
  const safeValue =
    secret && value && !value.includes("{{") ? "" : value
  return secret
    ? { id: crypto.randomUUID(), key, value: safeValue, secret: true }
    : { id: crypto.randomUUID(), key, value: safeValue }
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

function extraOutKeys(catalogId: string, kind: NodeKind): string[] {
  if (catalogId === "webhook") {
    return ["body", "headers", "query"]
  }
  if (catalogId.startsWith("slack")) {
    return ["ts", "ok"]
  }
  if (catalogId === "http" || catalogId.startsWith("http-")) {
    return ["status", "body", "ok"]
  }
  return kind === "trigger" ? ["payload"] : ["result", "ok"]
}

function fieldSecretMap(fields: readonly NodeField[] | undefined): Map<string, boolean> {
  const map = new Map<string, boolean>()
  for (const field of fields ?? []) {
    if (field.secret) {
      map.set(field.key, true)
    }
  }
  return map
}

function makeVarsFromKeys(
  keys: string[],
  fieldSecrets: Map<string, boolean>
): NodeVar[] {
  return keys.map((key) =>
    makeVar(key, "", { secret: fieldSecrets.get(key) === true || isSecretIoKey(key) })
  )
}

export function defaultNodeIo(catalogId: string): {
  inVars: NodeVar[]
  outVars: NodeVar[]
} {
  const catalog = getNodeType(catalogId)
  const kind = catalog?.kind ?? "action"
  const fields = catalog?.fields ?? []
  const fieldKeys = fields.map((field) => field.key)
  const fieldSecrets = fieldSecretMap(fields)

  if (kind === "trigger") {
    return {
      inVars: [],
      outVars: makeVarsFromKeys(
        uniqueKeys([...fieldKeys, ...extraOutKeys(catalogId, kind)]),
        fieldSecrets
      ),
    }
  }

  return {
    inVars: makeVarsFromKeys(uniqueKeys(fieldKeys), fieldSecrets),
    outVars: makeVarsFromKeys(uniqueKeys(extraOutKeys(catalogId, kind)), fieldSecrets),
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
      makeVar(item.key, `{{${source.data.label}.${item.key}}}`, {
        secret: isSecretNodeVar(item),
      })
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
