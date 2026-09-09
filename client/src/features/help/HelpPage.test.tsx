import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { HelpPage } from "./HelpPage"
import { HELP_DOC_LINKS, HELP_FAQ, HELP_STATUS_HREF } from "./model/faq"

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
  it("renders search, FAQ accordion, docs links, support CTA, and status stub", () => {
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
    const status = screen.getByRole("link", { name: /Status page/i })
    expect(status).toHaveAttribute("href", HELP_STATUS_HREF)
  })

  it("filters FAQ results including compliance topics", async () => {
    const user = userEvent.setup()
    renderHelp()

    await user.type(screen.getByLabelText("Search help"), "gdpr")
    expect(
      screen.getByRole("button", { name: /export my data/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /delete my account/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "What is Vanteg?" })
    ).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Search help"))
    await user.type(screen.getByLabelText("Search help"), "billing")
    expect(
      screen.getByRole("button", { name: /billing and upgrading/i })
    ).toBeInTheDocument()

    await user.clear(screen.getByLabelText("Search help"))
    await user.type(screen.getByLabelText("Search help"), "dpa")
    expect(
      screen.getByRole("button", { name: /Data Processing Agreement/i })
    ).toBeInTheDocument()

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
