import { useSyncExternalStore } from "react"

import type { AgentIconId } from "./icons"
import type { Agent, AgentModel } from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function nextName(preferred?: string): string {
  if (preferred?.trim()) {
    return preferred.trim()
  }
  const names = new Set(agents.map((agent) => agent.name))
  if (!names.has("Untitled agent")) {
    return "Untitled agent"
  }
  let index = 2
  while (names.has(`Untitled agent ${index}`)) {
    index += 1
  }
  return `Untitled agent ${index}`
}

function createSeed(): Agent[] {
  return [
    {
      id: "agent-support",
      name: "Support copilot",
      description: "Answers customer questions with shared support memory.",
      instructions:
        "Be concise and kind. Use the Support memory base and Product knowledge base before guessing.",
      model: "grok-4.6",
      icon: "headset",
      memoryBaseIds: ["base-support", "base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T08:00:00Z"),
    },
    {
      id: "agent-research",
      name: "Research analyst",
      description: "Reads product knowledge and workspace memory.",
      instructions: "Summarize sources and cite the knowledge file names you used.",
      model: "grok-4.6",
      icon: "search",
      memoryBaseIds: ["base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T09:00:00Z"),
    },
    {
      id: "agent-lead-swe",
      name: "Lead SWE agent",
      description: "Owns the engineering team plan and delegates implementation.",
      instructions: "Break work into tasks, assign owners, and keep the team unblocked.",
      model: "grok-4.6",
      icon: "briefcase",
      memoryBaseIds: ["base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T10:00:00Z"),
    },
    {
      id: "agent-senior-swe",
      name: "Senior SWE",
      description: "Implements complex changes and reviews junior work.",
      instructions: "Ship high-quality code, leave clear notes, and flag risks early.",
      model: "grok-4.6",
      icon: "code",
      memoryBaseIds: ["base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T10:05:00Z"),
    },
    {
      id: "agent-junior-swe",
      name: "Junior SWE",
      description: "Takes well-scoped tasks from the lead and senior engineers.",
      instructions: "Ask when stuck, keep diffs small, and write tests.",
      model: "grok-4.6",
      icon: "graduation-cap",
      memoryBaseIds: ["base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T10:10:00Z"),
    },
    {
      id: "agent-reviewer",
      name: "Code reviewer",
      description: "Reviews pull requests from the engineering team.",
      instructions: "Check correctness, tests, and clarity. Be direct and kind.",
      model: "grok-4.6",
      icon: "shield",
      memoryBaseIds: ["base-workspace"],
      knowledgeBaseIds: ["kb-product"],
      workflowIds: [],
      updatedAt: Date.parse("2026-04-05T10:15:00Z"),
    },
  ]
}

let agents: Agent[] = createSeed()

export function subscribeAgents(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAgentSnapshot(): Agent[] {
  return agents
}

export function useAgents(): Agent[] {
  return useSyncExternalStore(subscribeAgents, getAgentSnapshot, getAgentSnapshot)
}

export function resetAgents(): void {
  agents = createSeed()
  emit()
}

export function getAgent(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id)
}

export function createAgent(name?: string): Agent {
  const agent: Agent = {
    id: crypto.randomUUID(),
    name: nextName(name),
    description: "",
    instructions: "",
    model: "grok-4.6",
    icon: "bot",
    memoryBaseIds: ["base-workspace"],
    knowledgeBaseIds: [],
    workflowIds: [],
    updatedAt: Date.now(),
  }
  agents = [agent, ...agents]
  emit()
  return agent
}

export function saveAgent(
  id: string,
  patch: Partial<
    Pick<
      Agent,
      | "name"
      | "description"
      | "instructions"
      | "model"
      | "icon"
      | "memoryBaseIds"
      | "knowledgeBaseIds"
      | "workflowIds"
    >
  >
): Agent | undefined {
  const current = getAgent(id)
  if (!current) {
    return undefined
  }
  const next: Agent = {
    ...current,
    ...patch,
    model: (patch.model ?? current.model) as AgentModel,
    icon: (patch.icon ?? current.icon) as AgentIconId,
    updatedAt: Date.now(),
  }
  agents = agents.map((agent) => (agent.id === id ? next : agent))
  emit()
  return next
}

export function toggleAgentAssignment(
  id: string,
  field: "memoryBaseIds" | "knowledgeBaseIds" | "workflowIds",
  value: string,
  enabled: boolean
): Agent | undefined {
  const current = getAgent(id)
  if (!current) {
    return undefined
  }
  const existing = new Set(current[field])
  if (enabled) {
    existing.add(value)
  } else {
    existing.delete(value)
  }
  return saveAgent(id, { [field]: [...existing] })
}
