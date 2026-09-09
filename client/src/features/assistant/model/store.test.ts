import { beforeEach, describe, expect, it } from "vitest"

import {
  CONVERSATION_STORAGE_KEY,
  createConversation,
  deleteConversation,
  getConversation,
  getConversationStoreError,
  getConversationStoreStatus,
  hydrateConversations,
  listConversations,
  renameConversation,
  resetConversations,
  saveConversation,
  titleFromMessages,
} from "./store"

describe("assistant conversation store", () => {
  beforeEach(() => {
    resetConversations()
    localStorage.removeItem(CONVERSATION_STORAGE_KEY)
  })

  it("persists created conversations in localStorage", () => {
    const conversation = createConversation("Saved chat")
    const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toEqual([
      expect.objectContaining({ id: conversation.id, title: "Saved chat" }),
    ])
  })

  it("hydrates conversations from localStorage", () => {
    const seed = [
      {
        id: "c1",
        title: "From disk",
        messages: [],
        updatedAt: 1,
      },
    ]
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(seed))
    hydrateConversations({ force: true })
    expect(listConversations()).toEqual(seed)
    expect(getConversation("c1")?.title).toBe("From disk")
  })

  it("renames and deletes conversations", () => {
    const conversation = createConversation()
    renameConversation(conversation.id, "Renamed")
    expect(getConversation(conversation.id)?.title).toBe("Renamed")
    expect(deleteConversation(conversation.id)).toBe(true)
    expect(getConversation(conversation.id)).toBeUndefined()
  })

  it("marks store error when storage payload is invalid", () => {
    localStorage.setItem(CONVERSATION_STORAGE_KEY, '{"nope":true}')
    hydrateConversations({ force: true })
    expect(getConversationStoreStatus()).toBe("error")
    expect(getConversationStoreError()).toMatch(/Could not load/i)
  })

  it("builds titles from the first user message", () => {
    expect(
      titleFromMessages([{ id: "1", role: "user", content: "Draft a workflow for invoices" }])
    ).toBe("Draft a workflow for invoices")
    expect(titleFromMessages([])).toBe("New conversation")
  })

  it("saves message patches", () => {
    const conversation = createConversation()
    saveConversation(conversation.id, {
      messages: [{ id: "1", role: "user", content: "Hi" }],
      title: "Hi",
    })
    expect(getConversation(conversation.id)?.messages).toHaveLength(1)
  })
})
