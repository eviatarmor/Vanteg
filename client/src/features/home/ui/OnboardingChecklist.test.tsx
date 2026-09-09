import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { getAssistantOpen, resetAssistantOpen } from "@/features/assistant/model/open-store"

import {
  completeOnboardingItem,
  getOnboardingSnapshot,
  resetOnboarding,
} from "../model/onboarding-store"
import { OnboardingChecklist } from "./OnboardingChecklist"

function renderChecklist() {
  return render(
    <MemoryRouter>
      <OnboardingChecklist />
    </MemoryRouter>
  )
}

describe("OnboardingChecklist", () => {
  beforeEach(() => {
    resetOnboarding()
    resetAssistantOpen()
    window.localStorage.clear()
  })

  it("renders the five first-run items with progress", () => {
    renderChecklist()

    expect(screen.getByRole("heading", { name: "Getting started" })).toBeInTheDocument()
    expect(screen.getByText("0 of 5 complete")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open Integrations" })).toHaveAttribute(
      "href",
      "/integrations"
    )
    expect(screen.getByRole("link", { name: "Open Workflows" })).toHaveAttribute("href", "/workflows")
    expect(screen.getByRole("link", { name: "Open Teams" })).toHaveAttribute("href", "/teams")
    expect(screen.getByRole("link", { name: "Browse guides" })).toHaveAttribute("href", "/help")
    expect(screen.getByRole("button", { name: "Ask Vanteg" })).toBeInTheDocument()
  })

  it("marks an item done and opens the assistant from the checklist", async () => {
    const user = userEvent.setup()
    renderChecklist()

    await user.click(screen.getAllByRole("button", { name: "Mark done" })[0]!)
    expect(getOnboardingSnapshot().completed["connect-integration"]).toBe(true)
    expect(screen.getByText("1 of 5 complete")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ask Vanteg" }))
    expect(getAssistantOpen()).toBe(true)
    expect(getOnboardingSnapshot().completed["open-assistant"]).toBe(true)
  })

  it("shows success state when all items are complete and dismisses permanently", async () => {
    const user = userEvent.setup()
    completeOnboardingItem("connect-integration")
    completeOnboardingItem("create-workflow")
    completeOnboardingItem("invite-or-agent")
    completeOnboardingItem("try-template")
    completeOnboardingItem("open-assistant")

    renderChecklist()

    expect(screen.getByRole("heading", { name: "You're all set" })).toBeInTheDocument()
    expect(screen.getByText("5 of 5 complete")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Dismiss checklist" }))
    expect(getOnboardingSnapshot().dismissed).toBe(true)
    expect(screen.queryByRole("heading", { name: "You're all set" })).not.toBeInTheDocument()
  })

  it("hides after dismiss from the header control", async () => {
    const user = userEvent.setup()
    renderChecklist()

    await user.click(screen.getByRole("button", { name: "Dismiss getting started checklist" }))
    expect(screen.queryByRole("heading", { name: "Getting started" })).not.toBeInTheDocument()
    expect(getOnboardingSnapshot().dismissed).toBe(true)
  })
})
