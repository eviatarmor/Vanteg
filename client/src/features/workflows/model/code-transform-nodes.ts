import type { WorkflowNodeType } from "./types"
import {
  codeLanguageField,
  codeSnippetField,
  loopConcurrencyField,
  loopItemsField,
  mergeModeField,
  setMappingField,
  transformExpressionField,
} from "./code-transform-fields"

/** Platform Code / Transform / Set / Merge / Loop nodes with polished Setup fields. */
export const codeTransformNodes: WorkflowNodeType[] = [
  {
    id: "code",
    label: "Code",
    description: "Run JavaScript or Python.",
    kind: "logic",
    category: "Logic",
    fields: [codeLanguageField(), codeSnippetField()],
  },
  {
    id: "set",
    label: "Edit fields",
    description: "Set or rename fields.",
    kind: "logic",
    category: "Logic",
    fields: [setMappingField()],
  },
  {
    id: "merge",
    label: "Merge",
    description: "Combine branches.",
    kind: "logic",
    category: "Logic",
    fields: [mergeModeField()],
  },
  {
    id: "loop",
    label: "Loop",
    description: "Iterate over items.",
    kind: "logic",
    category: "Logic",
    fields: [loopItemsField(), loopConcurrencyField()],
  },
  {
    id: "transform",
    label: "Transform",
    description: "Map, pick, or reshape data.",
    kind: "logic",
    category: "Logic",
    fields: [transformExpressionField()],
  },
]
