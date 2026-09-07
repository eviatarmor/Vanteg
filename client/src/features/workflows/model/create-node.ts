import { getNodeType } from "./node-catalog"
import { defaultNodeIo } from "./node-io"
import type { FreezeNode, NodeField } from "./types"

function defaultConfig(fields: readonly NodeField[] | undefined): Record<string, string> {
  const config: Record<string, string> = {}
  for (const field of fields ?? []) {
    if (field.control !== "select" || !field.options?.length) {
      continue
    }
    const fromPlaceholder = field.options.find((option) => option.value === field.placeholder)
    config[field.key] = fromPlaceholder?.value ?? field.options[0]!.value
  }
  return config
}

export function createFreezeNode(
  catalogId: string,
  position: { x: number; y: number }
): FreezeNode {
  const catalog = getNodeType(catalogId)
  const io = defaultNodeIo(catalogId)

  return {
    id: crypto.randomUUID(),
    type: "freeze",
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
