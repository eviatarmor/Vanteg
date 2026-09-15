import { getNodeTypeForEditor } from "./auth-fields"
import { defaultNodeIo } from "./node-io"
import type { VantegNode, NodeField } from "./types"

function defaultConfig(fields: readonly NodeField[] | undefined): Record<string, string> {
  const config: Record<string, string> = {}
  for (const field of fields ?? []) {
    if (field.defaultValue !== undefined) {
      config[field.key] = field.defaultValue
      continue
    }
    if (field.control === "boolean") {
      config[field.key] = field.placeholder === "false" ? "false" : "true"
      continue
    }
    if (field.control === "select" && field.options?.length) {
      const fromPlaceholder = field.options.find((option) => option.value === field.placeholder)
      config[field.key] = fromPlaceholder?.value ?? field.options[0]!.value
      continue
    }
    if (field.control === "conditions") {
      config[field.key] = JSON.stringify({ join: "and", rules: [] })
      continue
    }
    if (field.control === "routes") {
      config[field.key] = JSON.stringify([
        { id: "a", name: "A", value: "" },
        { id: "b", name: "B", value: "" },
      ])
    }
  }
  return config
}

export function createVantegNode(
  catalogId: string,
  position: { x: number; y: number }
): VantegNode {
  const catalog = getNodeTypeForEditor(catalogId)
  const io = defaultNodeIo(catalogId)

  return {
    id: crypto.randomUUID(),
    type: "vanteg",
    position,
    data: {
      catalogId,
      label: catalog?.label ?? catalogId,
      config: defaultConfig(catalog?.fields),
      inVars: io.inVars,
      outVars: io.outVars,
    },
  }
}
