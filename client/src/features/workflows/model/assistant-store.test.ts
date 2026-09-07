import { beforeEach, describe, expect, it } from "vitest"

import {
  createConversation,
  listConversations,
  resetConversations,
  saveConversation,
  titleFromMessages,
} from "./assistant-store"

describe("assistant store", () => {
  beforeEach(() => {
    resetConversations()
  })

  it("creates workspace conversations", () => {
    createConversation()
    createConversation()

    expect(listConversations()).toHaveLength(2)
    expect(listConversations()[0]?.title).toBe("New conversation")
  })

  it("titles a conversation from the first user message", () => {
    expect(
      titleFromMessages([
        { id: "1", role: "user", content: "Explain this workflow" },
      ])
    ).toBe("Explain this workflow")
  })

  it("saves messages", () => {
    const conversation = createConversation()
    saveConversation(conversation.id, {
      messages: [{ id: "m1", role: "user", content: "Hello" }],
      title: "Hello",
    })
    expect(listConversations()[0]?.title).toBe("Hello")
  })
})
