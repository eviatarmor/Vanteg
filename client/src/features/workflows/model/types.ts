import type { Edge, Node } from "@xyflow/react"
import type {
  FieldMode,
  FieldSection,
  FieldShowWhen,
  FieldValidationRule,
  IoSchemaField,
  IoValueType,
} from "@workspace/integrations"

export type {
  FieldMode,
  FieldSection,
  FieldShowWhen,
  FieldValidationRule,
  IoSchemaField,
  IoValueType,
}

export type WorkflowStatus = "draft" | "dev" | "prod"

export type NodeKind = "trigger" | "action" | "logic"

export type FieldControl =
  | "input"
  | "textarea"
  | "code"
  | "select"
  | "credential"
  | "boolean"
  | "resource"
  | "number"
  | "datetime"
  | "expression"
  | "conditions"
  | "keyValue"
  | "mapping"
  | "schema"
  | "cron"
  | "routes"
  | "multiselect"

export interface NodeFieldOption {
  value: string
  label: string
}

export interface NodeField {
  key: string
  label: string
  placeholder: string
  help?: string
  control?: FieldControl
  language?: "javascript" | "json" | "python"
  options?: readonly NodeFieldOption[]
  /** Render with SecretInput (never type=password). */
  secret?: boolean
  /**
   * Inline auth secret superseded by a selected custom credential.
   * Hidden in the editor when `config.credentialId` matches a saved credential.
   */
  inlineAuth?: boolean
  /** Connection-scoped resource catalog key, e.g. "slack.channel". Used when control is "resource". */
  resourceType?: string
  valueType?: IoValueType
  required?: boolean
  defaultValue?: string
  mode?: FieldMode
  section?: FieldSection
  showWhen?: FieldShowWhen | readonly FieldShowWhen[]
  validation?: readonly FieldValidationRule[]
  sensitive?: boolean
  repeatable?: boolean
}

export type ExecutionOptionId =
  | "onlyRunIf"
  | "retry"
  | "attempts"
  | "retryDelay"
  | "backoff"
  | "timeout"
  | "continueOnFail"
  | "alwaysOutputData"
  | "errorOutput"
  | "itemMode"
  | "rawResponse"
  | "pagination"
  | "returnAll"
  | "maxItems"

export interface DynamicPortSource {
  fieldKey: string
  type: "source" | "target"
  color?: PortColor
  fallbackPorts: NodePort[]
}

export type PortColor =
  | "slate"
  | "teal"
  | "sky"
  | "amber"
  | "emerald"
  | "rose"
  | "violet"
  | "orange"

export interface NodePort {
  id: string
  type: "source" | "target"
  label: string
  color: PortColor
}

export interface WorkflowNodeType {
  id: string
  label: string
  description: string
  kind: NodeKind
  category: string
  fields: NodeField[]
  inputs?: IoSchemaField[]
  outputs: IoSchemaField[]
  ports?: NodePort[]
  dynamicPorts?: DynamicPortSource
  outputByPort?: Record<string, IoSchemaField[]>
  executionOptions?: ExecutionOptionId[]
  testable?: boolean
}

export type NodeVarType = IoValueType

export type NodeVar = {
  id: string
  key: string
  value: string
  /** When true, ExplorerTree masks the value/hint and uses the secret icon. */
  secret?: boolean
  type?: NodeVarType
  children?: NodeVar[]
}

export type VantegNodeData = {
  catalogId: string
  label: string
  config: Record<string, string>
  inVars: NodeVar[]
  outVars: NodeVar[]
}

export type VantegNodePatch = Partial<
  Pick<VantegNodeData, "label" | "config" | "inVars" | "outVars">
>

export type VantegNode = Node<VantegNodeData, "vanteg">
export type VantegEdge = Edge

export interface Workflow {
  id: string
  name: string
  status: WorkflowStatus
  nodes: VantegNode[]
  edges: VantegEdge[]
  updatedAt: number
}

/** Sentinel Select value for "no custom credential". Stored as empty string in config. */
export const CREDENTIAL_NONE = "__none__"

export function normalizeCredentialId(value: string | undefined | null): string {
  if (!value || value === CREDENTIAL_NONE) {
    return ""
  }
  return value
}
