import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetConversations } from "../model/store"
import { AssistantPanel } from "./AssistantPanel"

describe("AssistantPanel", () => {
  beforeEach(() => {
    resetConversations()
  })

  it("shows conversation prompts and history", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AssistantPanel />
      </MemoryRouter>
    )

    expect(screen.getByRole("complementary", { name: "Assistant" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "History" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open full" })).toHaveAttribute("href", "/assistant")
    expect(screen.getByRole("button", { name: "What can I do on this page?" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "History" }))

    expect(screen.getByText("No conversations yet.")).toBeInTheDocument()
  })

  it("lists a conversation in history after starting one", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AssistantPanel />
      </MemoryRouter>
    )

    await user.click(screen.getByRole("button", { name: "New" }))
    await user.click(screen.getByRole("button", { name: "History" }))

    expect(screen.getByText("New conversation")).toBeInTheDocument()
    expect(screen.getByText("0 messages")).toBeInTheDocument()
  })
})
