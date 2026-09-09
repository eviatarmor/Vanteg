export type AssistantRole = "user" | "assistant"

export interface AssistantMessage {
  id: string
  role: AssistantRole
  content: string
}

export interface AssistantConversation {
  id: string
  title: string
  messages: AssistantMessage[]
  updatedAt: number
  titleLocked?: boolean
}

export interface WorkflowChatContext {
  id: string
  name: string
  steps: { label: string; catalogId: string }[]
}

export interface AssistantChatContext {
  path: string
  pageTitle: string
  workflow?: WorkflowChatContext
}

export const defaultAssistantSuggestions = [
  "What can I do on this page?",
  "Give me a quick tour of Vanteg",
  "Help me decide what to build next",
] as const

export const workflowAssistantSuggestions = [
  "Explain this workflow",
  "Suggest the next step",
  "Check for missing connections",
] as const
