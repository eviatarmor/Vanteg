import type { AgentCapabilityId } from "./capabilities"
import type { AgentIconId } from "./icons"

export const agentProviders = [
  { id: "openai", name: "OpenAI", logo: "openai" },
  { id: "anthropic", name: "Anthropic", logo: "anthropic" },
  { id: "google", name: "Google", logo: "google" },
  { id: "xai", name: "xAI", logo: "xai" },
  { id: "moonshot", name: "Moonshot", logo: "moonshotai" },
  { id: "zai", name: "Z.ai", logo: "zai" },
  { id: "meta", name: "Meta", logo: "llama" },
] as const

export type AgentProviderId = (typeof agentProviders)[number]["id"]

export const agentModels = [
  { value: "gpt-6-astra", label: "GPT-6 Astra", provider: "openai" },
  { value: "gpt-5.6-sol", label: "GPT-5.6 Sol", provider: "openai" },
  { value: "gpt-5.5", label: "GPT-5.5", provider: "openai" },
  { value: "claude-fable-5.1", label: "Claude Fable 5.1", provider: "anthropic" },
  { value: "claude-opus-5", label: "Claude Opus 5", provider: "anthropic" },
  { value: "claude-sonnet-5", label: "Claude Sonnet 5", provider: "anthropic" },
  { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash", provider: "google" },
  { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro", provider: "google" },
  { value: "grok-4.6", label: "Grok 4.6", provider: "xai" },
  { value: "grok-4.5", label: "Grok 4.5", provider: "xai" },
  { value: "kimi-k3", label: "Kimi K3", provider: "moonshot" },
  { value: "glm-5.3", label: "GLM-5.3", provider: "zai" },
  { value: "glm-5.2", label: "GLM-5.2", provider: "zai" },
  { value: "muse-spark-1.3", label: "Muse Spark 1.3", provider: "meta" },
] as const

export type AgentModel = (typeof agentModels)[number]["value"]

export type AgentModelOption = (typeof agentModels)[number]

export function getAgentModel(value: string): AgentModelOption {
  return (
    agentModels.find((model) => model.value === value) ??
    agentModels.find((model) => model.value === "grok-4.6")!
  )
}

export function getAgentProvider(id: AgentProviderId) {
  return agentProviders.find((provider) => provider.id === id)!
}

export function modelsByProvider() {
  return agentProviders.map((provider) => ({
    provider,
    models: agentModels.filter((model) => model.provider === provider.id),
  }))
}

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
  capabilityIds: AgentCapabilityId[]
  updatedAt: number
}
