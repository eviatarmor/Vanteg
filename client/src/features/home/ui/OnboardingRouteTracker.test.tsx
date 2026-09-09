import { render, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { resetAssistantOpen, setAssistantOpen } from "@/features/assistant/model/open-store"

import { getOnboardingSnapshot, resetOnboarding } from "../model/onboarding-store"
import { OnboardingRouteTracker } from "./OnboardingRouteTracker"

describe("OnboardingRouteTracker", () => {
  beforeEach(() => {
    resetOnboarding()
    resetAssistantOpen()
    window.localStorage.clear()
  })

  it("completes matching items from the current route and assistant dock", async () => {
    render(
      <MemoryRouter initialEntries={["/integrations"]}>
        <OnboardingRouteTracker />
        <Routes>
          <Route path="/integrations" element={<div>Integrations</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(getOnboardingSnapshot().completed["connect-integration"]).toBe(true)

    setAssistantOpen(true)
    await waitFor(() => {
      expect(getOnboardingSnapshot().completed["open-assistant"]).toBe(true)
    })
  })
})

