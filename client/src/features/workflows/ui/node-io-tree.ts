import type { ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { maskSecretLast, SECRET_MASK } from "@/features/data/model/mask-secret"

import { isSecretNodeVar } from "../model/node-io"
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

function varLeaves(
  vars: NodeVar[],
  prefix: string,
  hintFor?: (item: NodeVar) => string | undefined
): ExplorerNode[] {
  return vars
    .filter((item) => item.key)
    .map((item) => {
      const secret = isSecretNodeVar(item)
      return {
        id: `${prefix}:${item.id}`,
        label: item.key,
        icon: secret ? ("secret" as const) : ("variable" as const),
        hint: secret ? secretHint(item) : (hintFor?.(item) ?? (item.value || undefined)),
      }
    })
}

export function outExplorerNodes(node: VantegNode): ExplorerNode[] {
  const children = varLeaves(
    node.data.outVars,
    `out:${node.id}`,
    (item) => `{{${node.data.label}.${item.key}}}`
  )
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
      children: varLeaves(
        source.data.outVars,
        `in:${source.id}`,
        (item) => `{{${source.data.label}.${item.key}}}`
      ),
    }))
    .filter((group) => (group.children?.length ?? 0) > 0)
}

export function explorerGroupIds(nodes: ExplorerNode[]): string[] {
  return nodes.filter((node) => (node.children?.length ?? 0) > 0).map((node) => node.id)
}
