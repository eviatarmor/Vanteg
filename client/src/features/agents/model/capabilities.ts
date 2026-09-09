export const agentCapabilities = [
  {
    id: "web_search",
    label: "Web search",
    description: "Look up current information on the public web.",
  },
  {
    id: "code_interpreter",
    label: "Code interpreter",
    description: "Run short analysis snippets when helpful.",
  },
  {
    id: "file_retrieval",
    label: "File retrieval",
    description: "Pull passages from assigned knowledge bases.",
  },
  {
    id: "memory_write",
    label: "Write memory",
    description: "Persist notes into assigned memory bases.",
  },
  {
    id: "browser",
    label: "Browser",
    description: "Open pages and extract structured content.",
  },
  {
    id: "image_gen",
    label: "Image generation",
    description: "Create images from text prompts.",
  },
] as const

export type AgentCapabilityId = (typeof agentCapabilities)[number]["id"]

export function isAgentCapabilityId(value: string): value is AgentCapabilityId {
  return agentCapabilities.some((capability) => capability.id === value)
}
