import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { HelpPage } from "./HelpPage"
import { HELP_DOC_LINKS, HELP_FAQ } from "./model/faq"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}))

function renderHelp() {
  return render(
    <MemoryRouter>
      <HelpPage />
    </MemoryRouter>
  )
}

describe("HelpPage", () => {
  it("renders search, FAQ accordion, docs links, and support CTA", () => {
    renderHelp()

    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "No help articles yet" })).not.toBeInTheDocument()
    expect(screen.getByLabelText("Search help")).toBeInTheDocument()
    expect(screen.getByText("FAQ")).toBeInTheDocument()

    for (const item of HELP_FAQ) {
      expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument()
    }

    for (const doc of HELP_DOC_LINKS) {
      const link = screen.getByRole("link", { name: new RegExp(doc.title, "i") })
      expect(link).toHaveAttribute("href", doc.href)
      expect(screen.getByText(doc.path)).toBeInTheDocument()
    }

    expect(screen.getByRole("button", { name: /Contact support/i })).toBeInTheDocument()
  })

  it("filters FAQ results and shows empty state when nothing matches", async () => {
    const user = userEvent.setup()
    renderHelp()

    await user.type(screen.getByLabelText("Search help"), "secretinput")
    expect(screen.getByRole("button", { name: /secrets and tokens/i })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "What is Vanteg?" })
    ).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Search help"))
    await user.type(screen.getByLabelText("Search help"), "zzzz-no-match")
    expect(screen.getByRole("heading", { name: "No matching articles" })).toBeInTheDocument()
  })

  it("expands an FAQ answer and stubs the support contact toast", async () => {
    const user = userEvent.setup()
    const { toast } = await import("sonner")
    renderHelp()

    await user.click(screen.getByRole("button", { name: "What is Vanteg?" }))
    expect(
      screen.getByText(/workspace for building workflows, agents, and teams/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Contact support/i }))
    expect(toast.message).toHaveBeenCalled()
  })
})
