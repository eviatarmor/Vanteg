import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { agentModels, getAgentModel } from "@/features/agents/model/types"
import { resetConversations } from "../model/store"
import { AssistantPanel } from "./AssistantPanel"

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

function renderPanel() {
  return render(
    <TooltipProvider>
      <MemoryRouter>
        <AssistantPanel />
      </MemoryRouter>
    </TooltipProvider>
  )
}

describe("AssistantPanel", () => {
  beforeEach(() => {
    resetConversations()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows conversation prompts and history", async () => {
    const user = userEvent.setup()
    renderPanel()

    expect(
      screen.getByRole("complementary", { name: "Assistant" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "History" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open full" })).toHaveAttribute(
      "href",
      "/assistant"
    )
    expect(
      screen.getByRole("button", { name: "What can I do on this page?" })
    ).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add attachments" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Message queue" })
    ).toBeInTheDocument()
    expect(screen.getByText("Ready when you are")).toBeInTheDocument()
    expect(screen.getByRole("log")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "History" }))

    expect(screen.getByText("No conversations yet.")).toBeInTheDocument()
  })

  it("lists a conversation in history after starting one", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("button", { name: "New" }))
    await user.click(screen.getByRole("button", { name: "History" }))

    expect(screen.getByText("New conversation")).toBeInTheDocument()
    expect(screen.getByText("0 messages")).toBeInTheDocument()
  })

  it("deep-links Open full to the active conversation", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("button", { name: "New" }))
    const link = screen.getByRole("link", { name: "Open full" })
    expect(link.getAttribute("href")).toMatch(/^\/assistant\/.+$/)
    expect(link).not.toHaveAttribute("href", "/assistant")
  })

  it("starts a chat with the selected model and attached file", async () => {
    const requests = installChatSpy()
    const selected = otherThanDefaultModel()
    const user = userEvent.setup()
    renderPanel()
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

  it("lists the same model catalog as Agents", async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole("button", { name: "Model" }))
    const picker = screen.getByRole("dialog", { name: "Model Selector" })
    for (const model of agentModels) {
      expect(within(picker).getByText(model.label)).toBeInTheDocument()
    }
  })
})
