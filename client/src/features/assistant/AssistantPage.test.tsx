import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { agentModels, getAgentModel } from "@/features/agents/model/types"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { AssistantPage } from "./AssistantPage"
import {
  CONVERSATION_STORAGE_KEY,
  createConversation,
  hydrateConversations,
  markConversationsLoading,
  resetConversations,
  saveConversation,
} from "./model/store"

function installChatSpy() {
  const requests: Record<string, unknown>[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url
      if (url.includes("/api/chat")) {
        const raw = init?.body
        requests.push(typeof raw === "string" ? JSON.parse(raw) : {})
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'))
            controller.enqueue(
              encoder.encode(
                'data: {"type":"finish","finishReason":"stop"}\n\n'
              )
            )
            controller.close()
          },
        })
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        })
      }
      return new Response("not found", { status: 404 })
    })
  )
  return requests
}

function otherThanDefaultModel() {
  const fallback = getAgentModel("not-a-real-model")
  const selected = agentModels.find((model) => model.value !== fallback.value)
  if (!selected) {
    throw new Error("agentModels must include more than the fallback model")
  }
  return selected
}

function renderAssistant(path = "/assistant") {
  const router = createMemoryRouter(
    [{ path: "/assistant/:threadId?", Component: AssistantPage }],
    { initialEntries: [path] }
  )
  return {
    user: userEvent.setup(),
    ...render(
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    ),
    router,
  }
}

describe("AssistantPage", () => {
  beforeEach(() => {
    resetConversations()
    localStorage.removeItem(CONVERSATION_STORAGE_KEY)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders the assistant route with history and empty chat", () => {
    renderAssistant()

    expect(
      screen.getByRole("heading", { name: "Assistant" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("complementary", { name: "Chat history" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Assistant chat" })
    ).toBeInTheDocument()
    expect(screen.getByText("No chats yet")).toBeInTheDocument()
    const history = screen.getByRole("complementary", { name: "Chat history" })
    const emptyHeading = within(history).getByRole("heading", {
      name: "No chats yet",
    })
    const emptyRoot = emptyHeading.parentElement?.parentElement
    expect(emptyRoot?.className).toContain("items-start")
    expect(emptyRoot?.className).not.toContain("flex-1")
    expect(emptyHeading.parentElement?.className).not.toContain("border-dashed")
    expect(
      screen.getAllByRole("button", { name: "New chat" }).length
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Ask Vanteg")).toBeInTheDocument()
    expect(screen.getByText("Ready when you are")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add attachments" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Message queue" })
    ).toBeInTheDocument()
    expect(screen.getByRole("log")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "What can I do on this page?" })
    ).toBeInTheDocument()
  })

  it("starts a thread with the selected model and attached file", async () => {
    const requests = installChatSpy()
    const selected = otherThanDefaultModel()
    const { user } = renderAssistant()
    const file = new File(["look at this"], "brief.txt", { type: "text/plain" })

    await user.click(screen.getByRole("button", { name: "Model" }))
    await user.click(
      within(screen.getByRole("dialog", { name: "Model Selector" })).getByRole(
        "option",
        { name: new RegExp(selected.label) }
      )
    )
    await user.upload(screen.getByLabelText("Upload files"), file)
    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "look at this"
    )
    await user.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests.some((body) => body.model === selected.value)).toBe(true)
    expect(
      requests.some((body) => {
        const messages = body.messages as
          | { role?: string; parts?: { type?: string; filename?: string }[] }[]
          | undefined
        return messages?.some(
          (message) =>
            message.role === "user" &&
            message.parts?.some(
              (part) => part.type === "file" && part.filename === "brief.txt"
            )
        )
      })
    ).toBe(true)
  })

  it("lists the same model catalog as Agents in the chat composer", async () => {
    const { user } = renderAssistant()

    await user.click(screen.getByRole("button", { name: "Model" }))
    const picker = screen.getByRole("dialog", { name: "Model Selector" })
    for (const model of agentModels) {
      expect(within(picker).getByText(model.label)).toBeInTheDocument()
    }
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

    expect(
      screen.getByRole("status", { name: "Loading history" })
    ).toBeInTheDocument()
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
    expect(
      screen.getByRole("region", { name: "Assistant chat" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("Hello there").length).toBeGreaterThanOrEqual(1)
  })

  it("shows not-found when the thread id is missing", () => {
    renderAssistant("/assistant/missing-thread")

    expect(screen.getByText("Conversation not found")).toBeInTheDocument()
  })

  it("renames a conversation from history actions", async () => {
    const conversation = createConversation("Old title")
    const { user } = renderAssistant(`/assistant/${conversation.id}`)

    await user.click(
      screen.getByRole("button", { name: `Actions for Old title` })
    )
    const rename = screen.getByRole("menuitem", { name: "Rename" })
    expect(rename.querySelector("svg")).not.toBeNull()
    await user.click(rename)
    const input = screen.getByRole("textbox", { name: "Conversation title" })
    await user.clear(input)
    await user.type(input, "Custom name")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(screen.getByText("Custom name")).toBeInTheDocument()
  })

  it("deletes the open empty thread and returns to /assistant", async () => {
    const conversation = createConversation("Empty chat")
    const { user, router } = renderAssistant(`/assistant/${conversation.id}`)

    await user.click(
      screen.getByRole("button", { name: `Actions for Empty chat` })
    )
    await user.click(screen.getByRole("menuitem", { name: "Delete" }))

    expect(router.state.location.pathname).toBe("/assistant")
    expect(screen.queryByText("Empty chat")).not.toBeInTheDocument()
  })
})
