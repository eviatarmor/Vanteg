import { useEffect } from "react"
import { useLocation } from "react-router"

import { useAssistantOpen } from "@/features/assistant/model/open-store"

import { markAssistantOpened, markOnboardingPathVisited } from "../model/onboarding-store"

/** Marks checklist items complete when matching routes (or Assistant) are opened. */
export function OnboardingRouteTracker() {
  const { pathname } = useLocation()
  const assistantOpen = useAssistantOpen()

  useEffect(() => {
    markOnboardingPathVisited(pathname)
  }, [pathname])

  useEffect(() => {
    if (assistantOpen) {
      markAssistantOpened()
    }
  }, [assistantOpen])

  return null
}
