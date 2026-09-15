import type { IoSchemaField } from "@workspace/integrations"

import type { ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { maskSecretLast, SECRET_MASK } from "@/features/data/model/mask-secret"

import { outputsForNode, resolveOutputSchema } from "../model/infer-output-schema"
import { getNodeType } from "../model/node-catalog"
import { isSecretIoKey, isSecretNodeVar } from "../model/node-io"
import { getNodePorts } from "../model/node-ports"
import type { VantegEdge, VantegNode, NodeVar } from "../model/types"

function secretHint(item: NodeVar): string {
  const value = item.value?.trim() ?? ""
  if (!value) {
    return SECRET_MASK
  }
  if (value.includes("{{") && value.includes("}}")) {
    return SECRET_MASK
  }
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

function schemaLeaves(
  fields: readonly IoSchemaField[],
  prefix: string,
  nodeLabel: string,
  varsByKey: Map<string, NodeVar>,
  pathPrefix = ""
): ExplorerNode[] {
  return fields.map((field) => {
    const path = pathPrefix ? `${pathPrefix}.${field.key}` : field.key
    const variable = varsByKey.get(field.key)
    const secret = field.secret === true || isSecretIoKey(field.key)
    const hint = secret
      ? variable
        ? secretHint(variable)
        : SECRET_MASK
      : variable?.value || `{{${nodeLabel}.${path}}}`
    const children = field.fields?.length
      ? schemaLeaves(field.fields, `${prefix}:${field.key}`, nodeLabel, varsByKey, path)
      : field.items?.fields?.length
        ? schemaLeaves(field.items.fields, `${prefix}:${field.key}`, nodeLabel, varsByKey, path)
        : undefined
    return {
      id: `${prefix}:${path}`,
      label: field.key,
      icon: secret ? ("secret" as const) : ("variable" as const),
      hint,
      children,
    }
  })
}

export function outExplorerNodes(node: VantegNode): ExplorerNode[] {
  const catalog = getNodeType(node.data.catalogId)
  const varsByKey = new Map(node.data.outVars.map((item) => [item.key, item]))
  const resolved = catalog ? resolveOutputSchema(catalog, node.data.config) : []
  const schemaKeys = new Set(resolved.map((field) => field.key))
  let schemaChildren: ExplorerNode[] = []
  if (catalog?.outputByPort) {
    const ports = getNodePorts(node.data.catalogId, node.data.config).filter(
      (port) => port.type === "source" && port.id !== "error"
    )
    schemaChildren = ports.map((port) => {
      const fields = catalog.outputByPort?.[port.id] ?? catalog.outputs
      return {
        id: `out:${node.id}:${port.id}`,
        label: port.label,
        icon: "folder" as const,
        children: schemaLeaves(fields, `out:${node.id}:${port.id}`, node.data.label, varsByKey),
      }
    })
  } else if (resolved.length) {
    schemaChildren = schemaLeaves(resolved, `out:${node.id}`, node.data.label, varsByKey)
  }
  const extra = varLeaves(
    node.data.outVars.filter((item) => item.key && !schemaKeys.has(item.key) && item.value),
    `out:${node.id}`
  )
  const children = schemaChildren.length
    ? [...schemaChildren, ...extra]
    : extra.length
      ? extra
      : varLeaves(
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
  const groups: ExplorerNode[] = []
  for (const edge of edges) {
    if (edge.target !== nodeId) {
      continue
    }
    const source = nodes.find((item) => item.id === edge.source)
    if (!source) {
      continue
    }
    const port = edge.sourceHandle ? ` / ${edge.sourceHandle}` : ""
    const catalog = getNodeType(source.data.catalogId)
    const varsByKey = new Map(source.data.outVars.map((item) => [item.key, item]))
    const resolved = catalog ? outputsForNode(catalog, source.data.config) : []
    const schemaKeys = new Set(resolved.map((field) => field.key))
    const schemaChildren = resolved.length
      ? schemaLeaves(resolved, `in:${source.id}:${edge.id}`, source.data.label, varsByKey)
      : []
    const extra = varLeaves(
      source.data.outVars.filter((item) => item.key && !schemaKeys.has(item.key)),
      `in:${source.id}:${edge.id}`,
      (item) => `{{${source.data.label}.${item.key}}}`
    )
    const children = schemaChildren.length
      ? [...schemaChildren, ...extra]
      : varLeaves(
          source.data.outVars,
          `in:${source.id}:${edge.id}`,
          (item) => `{{${source.data.label}.${item.key}}}`
        )
    if (children.length === 0) {
      continue
    }
    groups.push({
      id: `in:${source.id}:${edge.id}`,
      label: `${source.data.label}${port}`,
      icon: "folder",
      children,
    })
  }
  return groups
}

export function explorerGroupIds(nodes: ExplorerNode[]): string[] {
  return nodes.filter((node) => (node.children?.length ?? 0) > 0).map((node) => node.id)
}
