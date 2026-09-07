import type { Edge, Node } from "@xyflow/react"

export interface TeamMemberData {
  agentId: string
  role: string
}

export type TeamNode = Node<TeamMemberData, "agent">
export type TeamEdge = Edge

export interface Team {
  id: string
  name: string
  description: string
  nodes: TeamNode[]
  edges: TeamEdge[]
  updatedAt: number
}
