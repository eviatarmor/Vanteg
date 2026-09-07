import type { AgentIconId } from "./icons"

export const agentModels = [
  { value: "grok-4.6", label: "Grok 4.6" },
  { value: "grok-4.5", label: "Grok 4.5" },
] as const

export type AgentModel = (typeof agentModels)[number]["value"]

export interface Agent {
  id: string
  name: string
  description: string
  instructions: string
  model: AgentModel
  icon: AgentIconId
  memoryBaseIds: string[]
  knowledgeBaseIds: string[]
  workflowIds: string[]
  updatedAt: number
}
