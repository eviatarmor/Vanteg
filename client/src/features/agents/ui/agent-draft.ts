import type { AgentCapabilityId } from "../model/capabilities"
import type { Agent, AgentModel } from "../model/types"

export type AgentDraft = {
  name: string
  description: string
  instructions: string
  model: AgentModel
  icon: Agent["icon"]
  memoryBaseIds: string[]
  knowledgeBaseIds: string[]
  workflowIds: string[]
  capabilityIds: AgentCapabilityId[]
  credentialIds: string[]
}

export function toAgentDraft(agent: Agent): AgentDraft {
  return {
    name: agent.name,
    description: agent.description,
    instructions: agent.instructions,
    model: agent.model,
    icon: agent.icon,
    memoryBaseIds: [...agent.memoryBaseIds],
    knowledgeBaseIds: [...agent.knowledgeBaseIds],
    workflowIds: [...agent.workflowIds],
    capabilityIds: [...agent.capabilityIds],
    credentialIds: [...agent.credentialIds],
  }
}

export function sameAgentIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const left = [...a].sort()
  const right = [...b].sort()
  return left.every((value, index) => value === right[index])
}
