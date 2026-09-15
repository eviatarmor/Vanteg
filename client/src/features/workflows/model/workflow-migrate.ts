import { isSecretSetupKey } from "@workspace/integrations"

import { migrateLegacyCondition } from "./conditions"
import { defaultNodeIo, isSecretIoKey } from "./node-io"
import { parseRoutes, serializeRoutes } from "./structured-fields"
import type { NodeVar, VantegNode, Workflow, WorkflowNodeType } from "./types"

function toVar(
  key: string,
  existing: NodeVar | undefined,
  secret: boolean
): NodeVar {
  if (existing) {
    return {
      ...existing,
      secret: secret || existing.secret,
      value:
        secret && existing.value && !(existing.value.includes("{{") && existing.value.includes("}}"))
          ? ""
          : existing.value,
    }
  }
  return {
    id: crypto.randomUUID(),
    key,
    value: "",
    ...(secret ? { secret: true as const } : {}),
  }
}

function schemaVars(
  catalog: WorkflowNodeType,
  existing: NodeVar[]
): NodeVar[] {
  const byKey = new Map(existing.map((item) => [item.key, item]))
  const declared = (catalog.outputs ?? []).map((field) => {
    const secret = field.secret === true || isSecretIoKey(field.key)
    return toVar(field.key, byKey.get(field.key), secret)
  })
  const declaredKeys = new Set(declared.map((item) => item.key))
  const setupKeys = new Set(catalog.fields.map((field) => field.key))
  const extra = existing.filter((item) => {
    if (!item.key || declaredKeys.has(item.key)) {
      return false
    }
    if (item.secret === true || isSecretSetupKey(item.key) || isSecretIoKey(item.key)) {
      return false
    }
    if (setupKeys.has(item.key)) {
      return false
    }
    return true
  })
  return [...declared, ...extra].filter((item) => !isSecretSetupKey(item.key))
}

function migrateConfig(
  catalog: WorkflowNodeType,
  config: Record<string, string>
): Record<string, string> {
  const next = { ...config }
  if (catalog.id === "if" || catalog.id === "filter") {
    next.conditions = migrateLegacyCondition(next)
  }
  if (catalog.id === "switch" || catalog.id === "paths") {
    const from = next.routes || next.cases || next.paths
    next.routes = serializeRoutes(parseRoutes(from))
  }
  if (catalog.id === "schedule" && !next.intervalType) {
    next.intervalType = next.cron ? "cron" : "minutes"
    next.intervalCount = next.intervalCount || "1"
  }
  return next
}

export function normalizeWorkflowNode(
  node: VantegNode,
  catalog: WorkflowNodeType | undefined
): VantegNode {
  if (!catalog) {
    return node
  }
  const config = migrateConfig(catalog, node.data.config)
  const defaults = defaultNodeIo(catalog.id)
  const outVars = schemaVars(catalog, node.data.outVars)
  const inVars =
    catalog.kind === "trigger"
      ? []
      : node.data.inVars.length
        ? node.data.inVars
        : defaults.inVars
  return {
    ...node,
    data: {
      ...node.data,
      config,
      inVars,
      outVars,
    },
  }
}

export function normalizeWorkflow(
  workflow: Workflow,
  getCatalog: (id: string) => WorkflowNodeType | undefined
): Workflow {
  return {
    ...workflow,
    nodes: workflow.nodes.map((node) =>
      normalizeWorkflowNode(node, getCatalog(node.data.catalogId))
    ),
  }
}
