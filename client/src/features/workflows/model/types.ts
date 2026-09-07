import type { Edge, Node } from "@xyflow/react"

export type WorkflowStatus = "draft" | "dev" | "prod"

export type NodeKind = "trigger" | "action" | "logic"

export type FieldControl = "input" | "textarea" | "code" | "select"

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
}

export type FreezeNodeData = {
  catalogId: string
  label: string
  notes: string
  config: Record<string, string>
  inVars: NodeVar[]
  outVars: NodeVar[]
}

export type FreezeNodePatch = Partial<
  Pick<FreezeNodeData, "label" | "notes" | "config" | "inVars" | "outVars">
>

export type FreezeNode = Node<FreezeNodeData, "freeze">
export type FreezeEdge = Edge

export interface Workflow {
  id: string
  name: string
  status: WorkflowStatus
  nodes: FreezeNode[]
  edges: FreezeEdge[]
  updatedAt: number
}
