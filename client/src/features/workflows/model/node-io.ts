import { getNodeType } from "./node-catalog"
import type { VantegNode, VantegNodeData, NodeKind, NodeVar } from "./types"

function makeVar(key: string, value = ""): NodeVar {
  return { id: crypto.randomUUID(), key, value }
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

export function defaultNodeIo(catalogId: string): {
  inVars: NodeVar[]
  outVars: NodeVar[]
} {
  const catalog = getNodeType(catalogId)
  const kind = catalog?.kind ?? "action"
  const fieldKeys = (catalog?.fields ?? []).map((field) => field.key)

  if (kind === "trigger") {
    return {
      inVars: [],
      outVars: uniqueKeys([...fieldKeys, ...extraOutKeys(catalogId, kind)]).map((key) =>
        makeVar(key)
      ),
    }
  }

  return {
    inVars: uniqueKeys(fieldKeys).map((key) => makeVar(key)),
    outVars: uniqueKeys(extraOutKeys(catalogId, kind)).map((key) => makeVar(key)),
  }
}

export function mapUpstreamOutputs(
  source: VantegNode,
  target: VantegNode
): VantegNodeData {
  const existing = new Set(target.data.inVars.map((item) => item.key))
  const mapped = source.data.outVars
    .filter((item) => item.key && !existing.has(item.key))
    .map((item) => makeVar(item.key, `{{${source.data.label}.${item.key}}}`))

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
