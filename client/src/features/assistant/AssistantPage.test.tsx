import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { AssistantPage } from "./AssistantPage"
import {
  CONVERSATION_STORAGE_KEY,
  createConversation,
  hydrateConversations,
  markConversationsLoading,
  resetConversations,
  saveConversation,
} from "./model/store"

function renderAssistant(path = "/assistant") {
  const router = createMemoryRouter(
    [{ path: "/assistant/:threadId?", Component: AssistantPage }],
    { initialEntries: [path] }
  )
  return {
    user: userEvent.setup(),
    ...render(<RouterProvider router={router} />),
    router,
  }
}

describe("AssistantPage", () => {
  beforeEach(() => {
    resetConversations()
    localStorage.removeItem(CONVERSATION_STORAGE_KEY)
  })

  it("renders the assistant route with history and empty chat", () => {
    renderAssistant()

    expect(screen.getByRole("heading", { name: "Assistant" })).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "Chat history" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Assistant chat" })).toBeInTheDocument()
    expect(screen.getByText("No chats yet")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "New chat" }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Ask Vanteg")).toBeInTheDocument()
  })

  it("creates a conversation from the empty history CTA", async () => {
    const { user, router } = renderAssistant()

    const buttons = screen.getAllByRole("button", { name: "New chat" })
    await user.click(buttons[0]!)

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/assistant\//)
    })
    expect(screen.queryByText("No chats yet")).not.toBeInTheDocument()
    expect(screen.getByText("New conversation")).toBeInTheDocument()
  })

  it("shows loading state for history", () => {
    markConversationsLoading()
    renderAssistant()

    expect(screen.getByRole("status", { name: "Loading history" })).toBeInTheDocument()
    expect(screen.getByText("Loading history…")).toBeInTheDocument()
  })

  it("shows error state when stored history is invalid", () => {
    localStorage.setItem(CONVERSATION_STORAGE_KEY, "{not-json")
    hydrateConversations({ force: true })

    renderAssistant()

    expect(screen.getByText("Could not load history")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
  })

  it("opens an existing thread from the route", () => {
    const conversation = createConversation("Prior chat")
    saveConversation(conversation.id, {
      title: "Prior chat",
      messages: [
        { id: "m1", role: "user", content: "Hello there" },
        { id: "m2", role: "assistant", content: "Hi" },
      ],
    })

    renderAssistant(`/assistant/${conversation.id}`)

    expect(
      screen.getByRole("link", { name: /Prior chat|Hello there/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Assistant chat" })).toBeInTheDocument()
    expect(screen.getAllByText("Hello there").length).toBeGreaterThanOrEqual(1)
  })

  it("shows not-found when the thread id is missing", () => {
    renderAssistant("/assistant/missing-thread")

    expect(screen.getByText("Conversation not found")).toBeInTheDocument()
  })

  it("renames a conversation from history actions", async () => {
    const conversation = createConversation("Old title")
    const { user } = renderAssistant(`/assistant/${conversation.id}`)

    await user.click(screen.getByRole("button", { name: `Actions for Old title` }))
    await user.click(screen.getByRole("menuitem", { name: "Rename" }))
    const input = screen.getByRole("textbox", { name: "Conversation title" })
    await user.clear(input)
    await user.type(input, "Custom name")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(screen.getByText("Custom name")).toBeInTheDocument()
  })

  it("deletes the open empty thread and returns to /assistant", async () => {
    const conversation = createConversation("Empty chat")
    const { user, router } = renderAssistant(`/assistant/${conversation.id}`)

    await user.click(screen.getByRole("button", { name: `Actions for Empty chat` }))
    await user.click(screen.getByRole("menuitem", { name: "Delete" }))

    expect(router.state.location.pathname).toBe("/assistant")
    expect(screen.queryByText("Empty chat")).not.toBeInTheDocument()
  })
})
