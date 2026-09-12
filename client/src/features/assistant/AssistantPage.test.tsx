import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getAgentModel, modelsByProvider } from "@/features/agents/model/types"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { AssistantPage } from "./AssistantPage"
import {
  ASSISTANT_SETTINGS_STORAGE_KEY,
  getAssistantSettings,
  hydrateAssistantSettings,
  resetAssistantSettings,
  setAssistantSettings,
} from "./model/settings"
import {
  CONVERSATION_STORAGE_KEY,
  createConversation,
  hydrateConversations,
  markConversationsLoading,
  resetConversations,
  saveConversation,
} from "./model/store"

function installChatSpy(options?: { hold?: boolean; failOnce?: string }) {
  const requests: Record<string, unknown>[] = []
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  let calls = 0
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
        calls += 1
        if (options?.failOnce && calls === 1) {
          return new Response(options.failOnce, {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          })
        }
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'))
            const finish = () => {
              controller.enqueue(
                encoder.encode(
                  'data: {"type":"finish","finishReason":"stop"}\n\n'
                )
              )
              controller.close()
            }
            if (options?.hold) {
              void held.then(finish)
              return
            }
            finish()
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
  return { requests, release }
}

function otherXaiModel() {
  return getAgentModel("grok-4.5")
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

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  name: "Access" | "Effort",
  option: RegExp | string,
  expectedLabel: string,
  expectedValue:
    "read-only" | "supervised" | "full-access" | "low" | "medium" | "high"
) {
  await user.click(screen.getByRole("button", { name }))
  const menu = await screen.findByRole("menu")
  await user.click(within(menu).getByRole("menuitemradio", { name: option }))
  await waitFor(() => {
    const settings = getAssistantSettings()
    expect(name === "Access" ? settings.access : settings.effort).toBe(
      expectedValue
    )
    expect(screen.getByRole("button", { name })).toHaveTextContent(
      expectedLabel
    )
  })
}

describe("AssistantPage", () => {
  beforeEach(() => {
    resetConversations()
    resetAssistantSettings()
    localStorage.removeItem(CONVERSATION_STORAGE_KEY)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetAssistantSettings()
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
    expect(
      screen.getByRole("heading", { name: "Ask Vanteg" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Ask about this page, or pick a prompt to start.")
    ).toBeInTheDocument()
    expect(screen.queryByText("Ready when you are")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("region", { name: "Message queue" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add attachments" })
    ).toBeInTheDocument()
    const access = screen.getByRole("button", { name: "Access" })
    const effort = screen.getByRole("button", { name: "Effort" })
    expect(access).toHaveTextContent("Supervised")
    expect(access).toBeEnabled()
    expect(effort).toHaveTextContent("Medium effort")
    expect(effort).toBeEnabled()
    expect(screen.getByRole("log")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "What can I do on this page?" })
    ).toBeInTheDocument()
  })

  it("starts a thread with the selected model, access, effort, and attached file", async () => {
    const { requests } = installChatSpy()
    const selected = otherXaiModel()
    const { user } = renderAssistant()
    const file = new File(["look at this"], "brief.txt", { type: "text/plain" })

    await chooseOption(user, "Access", /Read only/, "Read only", "read-only")
    await user.click(screen.getByRole("button", { name: "Model" }))
    await user.click(
      within(screen.getByRole("dialog", { name: "Model Selector" })).getByRole(
        "option",
        { name: new RegExp(selected.label) }
      )
    )
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Model Selector" })
      ).not.toBeInTheDocument()
    })
    await user.upload(screen.getByLabelText("Upload files"), file)
    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "look at this"
    )
    await user.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests[0]).toMatchObject({
      model: selected.value,
      access: "read-only",
      effort: "medium",
    })
    expect(getAssistantSettings()).toMatchObject({
      model: selected.value,
      access: "read-only",
      effort: "medium",
    })
    expect(screen.getByRole("button", { name: "Access" })).toHaveTextContent(
      "Read only"
    )
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

  it("does not reset access or effort when sending", async () => {
    const { requests } = installChatSpy()
    const { user } = renderAssistant()

    await chooseOption(user, "Access", /Read only/, "Read only", "read-only")
    await chooseOption(user, "Effort", /High effort/, "High effort", "high")
    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "keep settings"
    )
    await user.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests[0]).toMatchObject({
      access: "read-only",
      effort: "high",
    })
    expect(getAssistantSettings()).toMatchObject({
      access: "read-only",
      effort: "high",
    })
    expect(screen.getByRole("button", { name: "Access" })).toHaveTextContent(
      "Read only"
    )
    expect(screen.getByRole("button", { name: "Effort" })).toHaveTextContent(
      "High effort"
    )
  })

  it("sends a suggestion with the current settings", async () => {
    const { requests } = installChatSpy()
    const { user } = renderAssistant()

    await chooseOption(
      user,
      "Access",
      /Full access/,
      "Full access",
      "full-access"
    )
    await chooseOption(user, "Effort", /High effort/, "High effort", "high")
    await user.click(
      screen.getByRole("button", { name: "What can I do on this page?" })
    )

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests[0]).toMatchObject({
      model: "grok-4.6",
      access: "full-access",
      effort: "high",
    })
  })

  it("snapshots later settings on subsequent sends", async () => {
    const { requests } = installChatSpy()
    const { user } = renderAssistant()

    await user.type(screen.getByRole("textbox", { name: "Message" }), "first")
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => {
      expect(requests.length).toBe(1)
    })
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
    })

    await chooseOption(user, "Effort", /Low effort/, "Low effort", "low")
    await user.type(screen.getByRole("textbox", { name: "Message" }), "second")
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => {
      expect(requests.length).toBe(2)
    })
    expect(requests[0]).toMatchObject({ effort: "medium", model: "grok-4.6" })
    expect(requests[1]).toMatchObject({ effort: "low", model: "grok-4.6" })
    expect(getAssistantSettings().effort).toBe("low")
    expect(screen.getByRole("button", { name: "Effort" })).toHaveTextContent(
      "Low effort"
    )
  })

  it("persists settings across reloads", async () => {
    const first = renderAssistant()
    await chooseOption(
      first.user,
      "Access",
      /Read only/,
      "Read only",
      "read-only"
    )
    await chooseOption(
      first.user,
      "Effort",
      /High effort/,
      "High effort",
      "high"
    )
    const saved = localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
    first.unmount()
    resetAssistantSettings()
    localStorage.setItem(ASSISTANT_SETTINGS_STORAGE_KEY, saved!)
    hydrateAssistantSettings({ force: true })

    renderAssistant()
    expect(screen.getByRole("button", { name: "Access" })).toHaveTextContent(
      "Read only"
    )
    expect(screen.getByRole("button", { name: "Effort" })).toHaveTextContent(
      "High effort"
    )
  })

  it("keeps a busy draft instead of sending or clearing it", async () => {
    const { requests, release } = installChatSpy({ hold: true })
    const { user } = renderAssistant()

    await user.type(screen.getByRole("textbox", { name: "Message" }), "first")
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => {
      expect(requests.length).toBe(1)
    })
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument()
    })

    const box = screen.getByRole("textbox", { name: "Message" })
    await user.type(box, "hold this draft")
    await user.keyboard("{Enter}")
    expect(box).toHaveValue("hold this draft")
    expect(requests).toHaveLength(1)
    expect(screen.getByText(/keep drafting/i)).toBeInTheDocument()
    release()
  })

  it("mutes empty send without disabling the rest of the composer", async () => {
    const { requests } = installChatSpy()
    const { user } = renderAssistant()

    const send = screen.getByRole("button", { name: "Send" })
    expect(send).toHaveAttribute("aria-disabled", "true")
    expect(send).not.toHaveAttribute("disabled")
    expect(screen.getByRole("button", { name: "Model" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Access" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Effort" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Add attachments" })).toBeEnabled()

    await user.click(send)
    expect(requests).toHaveLength(0)
    expect(
      screen.getByRole("heading", { name: "Ask Vanteg" })
    ).toBeInTheDocument()
  })

  it("enables send for attachment-only input", async () => {
    const { requests } = installChatSpy()
    const { user } = renderAssistant()
    const file = new File(["only file"], "notes.txt", { type: "text/plain" })

    const send = screen.getByRole("button", { name: "Send" })
    expect(send).toHaveAttribute("aria-disabled", "true")
    expect(send).not.toHaveAttribute("disabled")
    await user.upload(screen.getByLabelText("Upload files"), file)
    expect(send).not.toHaveAttribute("aria-disabled", "true")
    expect(send).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(
      requests.some((body) => {
        const messages = body.messages as
          | { role?: string; parts?: { type?: string; filename?: string }[] }[]
          | undefined
        return messages?.some(
          (message) =>
            message.role === "user" &&
            message.parts?.some(
              (part) => part.type === "file" && part.filename === "notes.txt"
            )
        )
      })
    ).toBe(true)
  })

  it("shows a retryable error without discarding messages or the draft", async () => {
    const { requests } = installChatSpy({
      failOnce: "Ask Vanteg currently runs xAI Grok models only.",
    })
    const { user } = renderAssistant()

    await user.type(screen.getByRole("textbox", { name: "Message" }), "hello")
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => {
      expect(
        screen.getByText("Could not complete that reply")
      ).toBeInTheDocument()
    })
    expect(screen.getAllByText("hello").length).toBeGreaterThanOrEqual(1)

    const box = screen.getByRole("textbox", { name: "Message" })
    await user.type(box, "keep me")
    await user.click(screen.getByRole("button", { name: "Retry" }))
    await waitFor(() => {
      expect(requests.length).toBe(2)
    })
    expect(box).toHaveValue("keep me")
    expect(screen.getAllByText("hello").length).toBeGreaterThanOrEqual(1)
  })

  it("shows the full model catalog with unsupported models disabled", async () => {
    const { user } = renderAssistant()

    await user.click(screen.getByRole("button", { name: "Model" }))
    const picker = screen.getByRole("dialog", { name: "Model Selector" })

    for (const { provider, models } of modelsByProvider()) {
      expect(within(picker).getByText(provider.name)).toBeInTheDocument()
      for (const model of models) {
        const option = within(picker).getByRole("option", {
          name: new RegExp(model.label),
        })
        if (model.provider === "xai") {
          expect(option).not.toHaveAttribute("aria-disabled", "true")
        } else {
          expect(option).toHaveAttribute("aria-disabled", "true")
        }
      }
    }

    await user.click(
      within(picker).getByRole("option", { name: /Grok 4.5/ })
    )
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Model Selector" })
      ).not.toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: "Model" })).toHaveTextContent(
      "Grok 4.5"
    )
    expect(getAssistantSettings().model).toBe("grok-4.5")
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

  it("carries stored settings into a new chat", async () => {
    setAssistantSettings({
      model: "grok-4.5",
      access: "full-access",
      effort: "low",
    })
    const { requests } = installChatSpy()
    const { user } = renderAssistant()

    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "from storage"
    )
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests[0]).toMatchObject({
      model: "grok-4.5",
      access: "full-access",
      effort: "low",
    })
  })
})
