import type { ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { maskSecretLast, SECRET_MASK } from "@/features/data/model/mask-secret"

import { isSecretNodeVar, nodeVarType } from "../model/node-io"
import type { VantegEdge, VantegNode, NodeVar } from "../model/types"

function secretHint(item: NodeVar): string {
  const value = item.value?.trim() ?? ""
  if (!value) {
    return SECRET_MASK
  }
  // Template paths are not secret material; still avoid leaking length of live secrets.
  if (value.includes("{{") && value.includes("}}")) {
    return SECRET_MASK
  }
  // Credential ids and other opaque values: mask without revealing raw content.
  return maskSecretLast(value) || SECRET_MASK
}

function varNode(item: NodeVar, prefix: string): ExplorerNode {
  const type = nodeVarType(item)
  const secret = isSecretNodeVar(item)
  const nested = (item.children ?? []).filter((child) => child.key)
  const id = `${prefix}:${item.id}`
  const hint = secret ? secretHint(item) : type
  if (nested.length > 0) {
    return {
      id,
      label: item.key,
      icon: secret ? "secret" : "folder",
      hint,
      children: nested.map((child) => varNode(child, id)),
    }
  }
  return {
    id,
    label: item.key,
    icon: secret ? "secret" : "variable",
    hint,
  }
}

function varForest(vars: NodeVar[], prefix: string): ExplorerNode[] {
  return vars.filter((item) => item.key).map((item) => varNode(item, prefix))
}

export function outExplorerNodes(node: VantegNode): ExplorerNode[] {
  const children = varForest(node.data.outVars, `out:${node.id}`)
  if (children.length === 0) {
    return []
  }
  return [
    {
      id: `out:${node.id}`,
      label: node.data.label,
      icon: "folder",
      children,
    },
  ]
}

export function inExplorerNodes(
  nodeId: string,
  nodes: VantegNode[],
  edges: VantegEdge[]
): ExplorerNode[] {
  const seen = new Set<string>()
  const sources: VantegNode[] = []
  for (const edge of edges) {
    if (edge.target !== nodeId || seen.has(edge.source)) {
      continue
    }
    const source = nodes.find((item) => item.id === edge.source)
    if (!source) {
      continue
    }
    seen.add(source.id)
    sources.push(source)
  }

  return sources
    .map((source) => ({
      id: `in:${source.id}`,
      label: source.data.label,
      icon: "folder" as const,
      children: varForest(source.data.outVars, `in:${source.id}`),
    }))
    .filter((group) => (group.children?.length ?? 0) > 0)
}

export function explorerGroupIds(nodes: ExplorerNode[]): string[] {
  const ids: string[] = []
  function walk(list: ExplorerNode[]) {
    for (const node of list) {
      if ((node.children?.length ?? 0) > 0) {
        ids.push(node.id)
        walk(node.children ?? [])
      }
    }
  }
  walk(nodes)
  return ids
}
