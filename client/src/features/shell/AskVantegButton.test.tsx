import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { AssistantDock } from "@/features/assistant/AssistantDock"
import { getAssistantOpen, resetAssistantOpen } from "@/features/assistant/model/open-store"

import { AskVantegButton } from "./AskVantegButton"

describe("AskVantegButton", () => {
  beforeEach(() => {
    resetAssistantOpen()
  })

  it("toggles the assistant sidebar instead of opening a dialog", async () => {
    const user = userEvent.setup()
    render(<AskVantegButton />)

    const button = screen.getByRole("button", { name: "Ask Vanteg" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(getAssistantOpen()).toBe(false)

    await user.click(button)

    expect(getAssistantOpen()).toBe(true)
    expect(screen.getByRole("button", { name: "Ask Vanteg" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByText(/Chat is not wired up/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ask Vanteg" }))

    expect(getAssistantOpen()).toBe(false)
  })

  it("keeps Ask Vanteg readable on the dark top bar when pressed", async () => {
    const user = userEvent.setup()
    render(<AskVantegButton />)

    const button = screen.getByRole("button", { name: "Ask Vanteg" })
    expect(button).toHaveClass("text-sidebar-foreground/85")

    await user.click(button)

    const pressed = screen.getByRole("button", { name: "Ask Vanteg" })
    expect(pressed).toHaveAttribute("aria-pressed", "true")
    expect(pressed).toHaveClass("bg-sidebar-accent")
    expect(pressed).toHaveClass("text-sidebar-accent-foreground")
    expect(pressed).not.toHaveClass("bg-secondary")
  })

  it("shows the assistant sidebar on the current page", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AskVantegButton />
        <AssistantDock>
          <p>Page body</p>
        </AssistantDock>
      </MemoryRouter>
    )

    expect(screen.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ask Vanteg" }))

    expect(screen.getByRole("complementary", { name: "Assistant" })).toBeInTheDocument()
    expect(screen.getByText("Page body")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "What can I do on this page?" })).toBeInTheDocument()
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="resizable-sidebar-pane"]')).toHaveAttribute(
      "data-state",
      "expanded"
    )
    expect(document.querySelector('[data-slot="resizable-sidebar-pane"]')).toHaveClass(
      "duration-200",
      "ease-linear"
    )

    await user.click(screen.getByRole("button", { name: "Ask Vanteg" }))

    expect(screen.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="resizable-sidebar-pane"]')).toHaveAttribute(
      "data-state",
      "collapsed"
    )
  })
})
