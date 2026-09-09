import { beforeEach, describe, expect, it } from "vitest"

import { ONBOARDING_STORAGE_KEY, onboardingItemIdsForPath } from "./onboarding"
import {
  completeOnboardingItem,
  dismissOnboarding,
  getOnboardingProgress,
  getOnboardingSnapshot,
  hydrateOnboardingFromStorage,
  markAssistantOpened,
  markOnboardingPathVisited,
  resetOnboarding,
} from "./onboarding-store"

describe("onboardingItemIdsForPath", () => {
  it("matches integrations and nested paths", () => {
    expect(onboardingItemIdsForPath("/integrations")).toEqual(["connect-integration"])
    expect(onboardingItemIdsForPath("/teams/team-swe")).toEqual(["invite-or-agent"])
    expect(onboardingItemIdsForPath("/agents/agent-support")).toEqual(["invite-or-agent"])
    expect(onboardingItemIdsForPath("/templates")).toEqual(["try-template"])
    expect(onboardingItemIdsForPath("/help")).toEqual([])
    expect(onboardingItemIdsForPath("/")).toEqual([])
  })
})

describe("onboarding store", () => {
  beforeEach(() => {
    resetOnboarding()
    window.localStorage.clear()
  })

  it("starts undismissed with nothing complete", () => {
    const snap = getOnboardingSnapshot()
    expect(snap.dismissed).toBe(false)
    expect(snap.completed).toEqual({})
    expect(getOnboardingProgress(snap)).toMatchObject({ done: 0, total: 5, percent: 0, allDone: false })
  })

  it("persists completed items and dismiss to localStorage", () => {
    completeOnboardingItem("connect-integration")
    dismissOnboarding()

    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toEqual({
      dismissed: true,
      completed: { "connect-integration": true },
    })

    resetOnboarding()
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ dismissed: true, completed: { "create-workflow": true } })
    )
    hydrateOnboardingFromStorage()
    expect(getOnboardingSnapshot()).toEqual({
      dismissed: true,
      completed: { "create-workflow": true },
    })
  })

  it("marks items complete when matching routes are visited", () => {
    markOnboardingPathVisited("/workflows/wf-1")
    markOnboardingPathVisited("/templates")
    markOnboardingPathVisited("/agents")
    expect(getOnboardingSnapshot().completed).toEqual({
      "create-workflow": true,
      "try-template": true,
      "invite-or-agent": true,
    })
  })

  it("marks assistant item when assistant opens", () => {
    markAssistantOpened()
    expect(getOnboardingSnapshot().completed["open-assistant"]).toBe(true)
    expect(getOnboardingProgress().done).toBe(1)
  })

  it("reports allDone when every item is complete", () => {
    completeOnboardingItem("connect-integration")
    completeOnboardingItem("create-workflow")
    completeOnboardingItem("invite-or-agent")
    completeOnboardingItem("try-template")
    completeOnboardingItem("open-assistant")
    expect(getOnboardingProgress().allDone).toBe(true)
    expect(getOnboardingProgress().percent).toBe(100)
  })
})
