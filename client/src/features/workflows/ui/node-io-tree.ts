import type { IoSchemaField } from "@workspace/integrations"

import type { ExplorerNode } from "@/features/data/ui/ExplorerTree"
import { maskSecretLast, SECRET_MASK } from "@/features/data/model/mask-secret"

import { outputsForNode, resolveOutputSchema } from "../model/infer-output-schema"
import { getNodeType } from "../model/node-catalog"
import { isSecretIoKey, isSecretNodeVar, nodeVarType } from "../model/node-io"
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

function schemaNode(
  field: IoSchemaField,
  prefix: string,
  varsByKey: Map<string, NodeVar>,
  pathPrefix = ""
): ExplorerNode {
  const path = pathPrefix ? `${pathPrefix}.${field.key}` : field.key
  const variable = varsByKey.get(field.key)
  const secret = field.secret === true || isSecretIoKey(field.key)
  const nestedFields = field.fields?.length
    ? field.fields
    : field.items
      ? [{ ...field.items, key: field.items.key || "item" }]
      : []
  const children = nestedFields.map((child) =>
    schemaNode(child, `${prefix}:${field.key}`, varsByKey, path)
  )
  const hint = secret
    ? variable
      ? secretHint(variable)
      : SECRET_MASK
    : field.type
  const folder = children.length > 0
  return {
    id: `${prefix}:${path}`,
    label: field.key,
    icon: secret ? "secret" : folder ? "folder" : "variable",
    hint,
    children: folder ? children : undefined,
  }
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
      const fields = catalog.outputByPort?.[port.id] ?? catalog.outputs ?? []
      return {
        id: `out:${node.id}:${port.id}`,
        label: port.label,
        icon: "folder" as const,
        children: fields.map((field) =>
          schemaNode(field, `out:${node.id}:${port.id}`, varsByKey)
        ),
      }
    })
  } else if (resolved.length) {
    schemaChildren = resolved.map((field) =>
      schemaNode(field, `out:${node.id}`, varsByKey)
    )
  }
  const extra = node.data.outVars
    .filter((item) => item.key && !schemaKeys.has(item.key) && item.value)
    .map((item) => varNode(item, `out:${node.id}`))
  const children = schemaChildren.length
    ? [...schemaChildren, ...extra]
    : extra.length
      ? extra
      : node.data.outVars
          .filter((item) => item.key)
          .map((item) => varNode(item, `out:${node.id}`))
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
    const schemaChildren = resolved.map((field) =>
      schemaNode(field, `in:${source.id}:${edge.id}`, varsByKey)
    )
    const extra = source.data.outVars
      .filter((item) => item.key && !schemaKeys.has(item.key))
      .map((item) => varNode(item, `in:${source.id}:${edge.id}`))
    const children = schemaChildren.length
      ? [...schemaChildren, ...extra]
      : source.data.outVars
          .filter((item) => item.key)
          .map((item) => varNode(item, `in:${source.id}:${edge.id}`))
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
