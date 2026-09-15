import { Braces, Lock } from "lucide-react"
import { useMemo } from "react"

import { Input } from "@workspace/ui/components/input"
import { flattenIoPaths, type IoSchemaField } from "@workspace/integrations"

import { MentionInput } from "@/components/mention"
import { SecretInput } from "@/components/secret-input"
import type { MentionItem, MentionKindMeta } from "@/components/mention/types"

import {
  missingExpressionRefs,
  outputMentionItem,
  parseWorkflowExpression,
  serializeWorkflowExpression,
} from "../model/expression"
import { outputsForNode } from "../model/infer-output-schema"
import { isSecretIoKey } from "../model/node-io"
import type { FieldMode, VantegEdge, VantegNode } from "../model/types"
import { getNodeType } from "../model/node-catalog"

const KINDS: MentionKindMeta[] = [
  { kind: "output", label: "Outputs", icon: Braces },
  { kind: "secret-output", label: "Secrets", icon: Lock },
]

export function upstreamOutputItems(
  nodeId: string,
  nodes: VantegNode[],
  edges: VantegEdge[]
): MentionItem[] {
  const items: MentionItem[] = []
  for (const edge of edges) {
    if (edge.target !== nodeId) {
      continue
    }
    const source = nodes.find((node) => node.id === edge.source)
    if (!source) {
      continue
    }
    const catalog = getNodeType(source.data.catalogId)
    const outputs = catalog ? outputsForNode(catalog, source.data.config) : []
    const label = source.data.label
    const paths = outputs.length
      ? flattenIoPaths(outputs)
      : source.data.outVars.map((item) => item.key).filter(Boolean)
    for (const path of paths) {
      const secret = isSecretIoKey(path.split(".").pop() ?? path)
      items.push({
        ...outputMentionItem(`${label}.${path}`),
        kind: secret ? "secret-output" : "output",
      })
    }
  }
  return items
}

export function availableUpstreamPaths(
  nodeId: string,
  nodes: VantegNode[],
  edges: VantegEdge[]
): string[] {
  return upstreamOutputItems(nodeId, nodes, edges).map((item) => item.id)
}

export function WorkflowExpressionInput({
  id,
  value,
  placeholder,
  mode = "either",
  secret = false,
  disabled,
  items,
  availablePaths,
  "aria-label": ariaLabel,
  onChange,
}: {
  id?: string
  value: string
  placeholder?: string
  mode?: FieldMode
  secret?: boolean
  disabled?: boolean
  items: MentionItem[]
  availablePaths: Iterable<string>
  "aria-label"?: string
  onChange: (value: string) => void
}) {
  const segments = useMemo(() => parseWorkflowExpression(value), [value])
  const missing = useMemo(
    () => missingExpressionRefs(value, availablePaths),
    [value, availablePaths]
  )

  if (mode === "fixed") {
    if (secret) {
      return (
        <SecretInput
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onValueChange={onChange}
        />
      )
    }
    return (
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  return (
    <div className="grid gap-1">
      <MentionInput
        id={id}
        items={items}
        kinds={KINDS}
        segments={segments}
        onSegmentsChange={(next) => onChange(serializeWorkflowExpression(next))}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
      />
      {missing.length > 0 ? (
        <p className="text-xs text-destructive" role="status">
          Missing reference: {missing[0]}
        </p>
      ) : null}
    </div>
  )
}

export function schemaPaths(fields: readonly IoSchemaField[] | undefined, prefix = ""): string[] {
  return flattenIoPaths(fields ?? [], prefix)
}
