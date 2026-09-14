import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { getAgentModel, modelsByProvider } from "@/features/agents/model/types"
import { getAssistantSettings, resetAssistantSettings } from "../model/settings"
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

function otherXaiModel() {
  return getAgentModel("grok-4.5")
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

describe("AssistantPanel", () => {
  beforeEach(() => {
    resetConversations()
    resetAssistantSettings()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetAssistantSettings()
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
      screen.queryByRole("region", { name: "Message queue" })
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Ready when you are")).not.toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Ask Vanteg" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Access" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Effort" })).toBeInTheDocument()
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

  it("starts a chat with the selected model, access, effort, and attached file", async () => {
    const requests = installChatSpy()
    const selected = otherXaiModel()
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
    await chooseOption(user, "Access", /Supervised/, "Supervised", "supervised")
    await user.upload(screen.getByLabelText("Upload files"), file)
    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "look at this"
    )
    await user.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(
      requests.some(
        (body) =>
          body.model === selected.value &&
          body.access === "supervised" &&
          body.effort === "medium"
      )
    ).toBe(true)
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

  it("starts from a suggestion with the selected settings", async () => {
    const requests = installChatSpy()
    const user = userEvent.setup()
    renderPanel()

    await chooseOption(user, "Access", /Read only/, "Read only", "read-only")
    await chooseOption(user, "Effort", /Low effort/, "Low effort", "low")
    await user.click(
      screen.getByRole("button", { name: "What can I do on this page?" })
    )

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(0)
    })
    expect(requests[0]).toMatchObject({
      access: "read-only",
      effort: "low",
      model: "grok-4.6",
    })
    expect(getAssistantSettings()).toMatchObject({
      access: "read-only",
      effort: "low",
    })
  })

  it("shows the full model catalog with unsupported models disabled", async () => {
    const user = userEvent.setup()
    renderPanel()
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

    await user.click(within(picker).getByRole("option", { name: /Grok 4.5/ }))
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
})
