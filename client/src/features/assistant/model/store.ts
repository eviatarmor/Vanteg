import { useSyncExternalStore } from "react"

import type { AssistantConversation, AssistantMessage } from "./types"

export const CONVERSATION_STORAGE_KEY = "vanteg.assistant.conversations"

export type ConversationStoreStatus = "loading" | "ready" | "error"

let conversations: AssistantConversation[] = []
let status: ConversationStoreStatus = "ready"
let errorMessage: string | null = null
let saveWarning: string | null = null
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function isMessage(value: unknown): value is AssistantMessage {
  if (!value || typeof value !== "object") {
    return false
  }
  const message = value as AssistantMessage
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  )
}

function isConversation(value: unknown): value is AssistantConversation {
  if (!value || typeof value !== "object") {
    return false
  }
  const conversation = value as AssistantConversation
  return (
    typeof conversation.id === "string" &&
    typeof conversation.title === "string" &&
    typeof conversation.updatedAt === "number" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isMessage)
  )
}

function readStorage(): AssistantConversation[] {
  if (typeof localStorage === "undefined") {
    return []
  }
  const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY)
  if (!raw) {
    return []
  }
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid conversation history")
  }
  const next = parsed.filter(isConversation)
  if (next.length !== parsed.length) {
    throw new Error("Invalid conversation history")
  }
  return next
}

function writeStorage(next: AssistantConversation[]): void {
  if (typeof localStorage === "undefined") {
    return
  }
  localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(next))
}

function persist(next: AssistantConversation[]): void {
  conversations = next
  try {
    writeStorage(next)
    saveWarning = null
    status = "ready"
    errorMessage = null
  } catch {
    saveWarning = "Could not save conversation history."
    if (conversations.length > 0) {
      status = "ready"
    }
  }
  emit()
}

export function hydrateConversations(options?: { force?: boolean }): void {
  if (hydrated && !options?.force) {
    return
  }
  try {
    conversations = readStorage()
    status = "ready"
    errorMessage = null
    saveWarning = null
  } catch {
    conversations = []
    status = "error"
    errorMessage = "Could not load conversation history."
    saveWarning = null
  }
  hydrated = true
  emit()
}

export function ensureConversationsHydrated(): void {
  if (!hydrated) {
    hydrateConversations()
  }
}

export function getConversationStoreStatus(): ConversationStoreStatus {
  ensureConversationsHydrated()
  return status
}

export function getConversationStoreError(): string | null {
  ensureConversationsHydrated()
  return errorMessage
}

export function getConversationSaveWarning(): string | null {
  ensureConversationsHydrated()
  return saveWarning
}

export function markConversationsLoading(): void {
  status = "loading"
  errorMessage = null
  emit()
}

export function retryConversationStore(): void {
  if (saveWarning && conversations.length > 0) {
    persist(conversations)
    return
  }
  markConversationsLoading()
  hydrateConversations({ force: true })
}

export function clearConversationStoreError(): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY)
    }
    conversations = []
    status = "ready"
    errorMessage = null
    hydrated = true
    emit()
  } catch {
    status = "error"
    errorMessage = "Could not reset conversation history."
    emit()
  }
}

export function createConversation(title = "New conversation"): AssistantConversation {
  ensureConversationsHydrated()
  const conversation: AssistantConversation = {
    id: crypto.randomUUID(),
    title,
    messages: [],
    updatedAt: Date.now(),
  }
  persist([conversation, ...conversations])
  return conversation
}

export function getConversation(id: string): AssistantConversation | undefined {
  ensureConversationsHydrated()
  return conversations.find((conversation) => conversation.id === id)
}

export function listConversations(): AssistantConversation[] {
  ensureConversationsHydrated()
  return conversations
}

export function saveConversation(
  id: string,
  patch: Partial<Pick<AssistantConversation, "title" | "messages" | "titleLocked">>
): AssistantConversation | undefined {
  ensureConversationsHydrated()
  const current = conversations.find((conversation) => conversation.id === id)
  if (!current) {
    return undefined
  }
  const next = { ...current, ...patch, updatedAt: Date.now() }
  persist(
    conversations.map((conversation) => (conversation.id === id ? next : conversation))
  )
  return next
}

export function renameConversation(id: string, title: string): AssistantConversation | undefined {
  const trimmed = title.trim()
  if (!trimmed) {
    return undefined
  }
  return saveConversation(id, { title: trimmed, titleLocked: true })
}

export function deleteConversation(id: string): boolean {
  ensureConversationsHydrated()
  if (!conversations.some((conversation) => conversation.id === id)) {
    return false
  }
  persist(conversations.filter((conversation) => conversation.id !== id))
  return true
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
  ensureConversationsHydrated()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConversationSnapshot(): AssistantConversation[] {
  ensureConversationsHydrated()
  return conversations
}

export function useConversations(): AssistantConversation[] {
  return useSyncExternalStore(
    subscribeConversations,
    getConversationSnapshot,
    getConversationSnapshot
  )
}

export function useConversationStoreStatus(): ConversationStoreStatus {
  return useSyncExternalStore(
    subscribeConversations,
    getConversationStoreStatus,
    getConversationStoreStatus
  )
}

export function useConversationStoreError(): string | null {
  return useSyncExternalStore(
    subscribeConversations,
    getConversationStoreError,
    getConversationStoreError
  )
}

export function useConversationSaveWarning(): string | null {
  return useSyncExternalStore(
    subscribeConversations,
    getConversationSaveWarning,
    getConversationSaveWarning
  )
}

export function resetConversations(): void {
  conversations = []
  status = "ready"
  errorMessage = null
  saveWarning = null
  hydrated = true
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY)
    }
  } catch {
    // ignore cleanup failures in tests
  }
  emit()
}
