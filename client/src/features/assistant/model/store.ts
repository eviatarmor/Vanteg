import { useSyncExternalStore } from "react"

import type { AssistantConversation, AssistantMessage } from "./types"

let conversations: AssistantConversation[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function createConversation(): AssistantConversation {
  const conversation: AssistantConversation = {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [],
    updatedAt: Date.now(),
  }
  conversations = [conversation, ...conversations]
  emit()
  return conversation
}

export function getConversation(id: string): AssistantConversation | undefined {
  return conversations.find((conversation) => conversation.id === id)
}

export function listConversations(): AssistantConversation[] {
  return conversations
}

export function saveConversation(
  id: string,
  patch: Partial<Pick<AssistantConversation, "title" | "messages">>
): AssistantConversation | undefined {
  const current = getConversation(id)
  if (!current) {
    return undefined
  }
  const next = { ...current, ...patch, updatedAt: Date.now() }
  conversations = conversations.map((conversation) =>
    conversation.id === id ? next : conversation
  )
  emit()
  return next
}

export function titleFromMessages(messages: AssistantMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user")
  if (!firstUser?.content.trim()) {
    return "New conversation"
  }
  const text = firstUser.content.trim()
  return text.length > 48 ? `${text.slice(0, 45)}…` : text
}

export function subscribeConversations(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConversationSnapshot(): AssistantConversation[] {
  return conversations
}

export function useConversations(): AssistantConversation[] {
  return useSyncExternalStore(
    subscribeConversations,
    getConversationSnapshot,
    getConversationSnapshot
  )
}

export function resetConversations(): void {
  conversations = []
  emit()
}
