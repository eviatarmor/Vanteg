import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { AssistantDock } from "@/features/assistant/AssistantDock"
import { getAssistantOpen, resetAssistantOpen } from "@/features/assistant/model/open-store"

import { AskFreezeButton } from "./AskFreezeButton"

describe("AskFreezeButton", () => {
  beforeEach(() => {
    resetAssistantOpen()
  })

  it("toggles the assistant sidebar instead of opening a dialog", async () => {
    const user = userEvent.setup()
    render(<AskFreezeButton />)

    const button = screen.getByRole("button", { name: "Ask Freeze" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(getAssistantOpen()).toBe(false)

    await user.click(button)

    expect(getAssistantOpen()).toBe(true)
    expect(screen.getByRole("button", { name: "Ask Freeze" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByText(/Chat is not wired up/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ask Freeze" }))

    expect(getAssistantOpen()).toBe(false)
  })

  it("keeps Ask Freeze readable on the dark top bar when pressed", async () => {
    const user = userEvent.setup()
    render(<AskFreezeButton />)

    const button = screen.getByRole("button", { name: "Ask Freeze" })
    expect(button).toHaveClass("text-sidebar-foreground/85")

    await user.click(button)

    const pressed = screen.getByRole("button", { name: "Ask Freeze" })
    expect(pressed).toHaveAttribute("aria-pressed", "true")
    expect(pressed).toHaveClass("bg-sidebar-accent")
    expect(pressed).toHaveClass("text-sidebar-accent-foreground")
    expect(pressed).not.toHaveClass("bg-secondary")
  })

  it("shows the assistant sidebar on the current page", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AskFreezeButton />
        <AssistantDock>
          <p>Page body</p>
        </AssistantDock>
      </MemoryRouter>
    )

    expect(screen.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ask Freeze" }))

    expect(screen.getByRole("complementary", { name: "Assistant" })).toBeInTheDocument()
    expect(screen.getByText("Page body")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "What can I do on this page?" })).toBeInTheDocument()
  })
})
