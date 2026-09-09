import { getNodeTypeForEditor } from "./auth-fields"
import { defaultNodeIo } from "./node-io"
import type { VantegNode, NodeField } from "./types"

function defaultConfig(fields: readonly NodeField[] | undefined): Record<string, string> {
  const config: Record<string, string> = {}
  for (const field of fields ?? []) {
    if (field.control === "boolean") {
      config[field.key] = field.placeholder === "false" ? "false" : "true"
      continue
    }
    if (field.control !== "select" || !field.options?.length) {
      continue
    }
    const fromPlaceholder = field.options.find((option) => option.value === field.placeholder)
    config[field.key] = fromPlaceholder?.value ?? field.options[0]!.value
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
      notes: "",
      config: defaultConfig(catalog?.fields),
      inVars: io.inVars,
      outVars: io.outVars,
    },
  }
}
