import type { Edge, Node } from "@xyflow/react"

export type WorkflowStatus = "draft" | "dev" | "prod"

export type NodeKind = "trigger" | "action" | "logic"

export type FieldControl = "input" | "textarea" | "code" | "select" | "credential" | "boolean"

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
  language?: "javascript" | "json"
  options?: readonly NodeFieldOption[]
  /** Render with SecretInput (never type=password). */
  secret?: boolean
  /**
   * Inline auth secret superseded by a selected custom credential.
   * Hidden in the editor when `config.credentialId` matches a saved credential.
   */
  inlineAuth?: boolean
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
}

export type NodeVar = {
  id: string
  key: string
  value: string
  /** Secret-sensitive I/O variable. */
  secret?: boolean
}

export type VantegNodeData = {
  catalogId: string
  label: string
  notes: string
  config: Record<string, string>
  inVars: NodeVar[]
  outVars: NodeVar[]
}

export type VantegNodePatch = Partial<
  Pick<VantegNodeData, "label" | "notes" | "config" | "inVars" | "outVars">
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
