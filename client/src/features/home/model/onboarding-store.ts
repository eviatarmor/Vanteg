import { useSyncExternalStore } from "react"

import {
  ONBOARDING_STORAGE_KEY,
  onboardingItemIdsForPath,
  onboardingItems,
  type OnboardingItemId,
} from "./onboarding"

export interface OnboardingState {
  dismissed: boolean
  completed: Partial<Record<OnboardingItemId, true>>
}

const emptyState = (): OnboardingState => ({
  dismissed: false,
  completed: {},
})

const listeners = new Set<() => void>()

let state: OnboardingState = readStorage()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readStorage(): OnboardingState {
  if (!isBrowser()) {
    return emptyState()
  }
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!raw) {
      return emptyState()
    }
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    const completed: OnboardingState["completed"] = {}
    if (parsed.completed && typeof parsed.completed === "object") {
      for (const item of onboardingItems) {
        if (parsed.completed[item.id]) {
          completed[item.id] = true
        }
      }
    }
    return {
      dismissed: Boolean(parsed.dismissed),
      completed,
    }
  } catch {
    return emptyState()
  }
}

function writeStorage(next: OnboardingState): void {
  if (!isBrowser()) {
    return
  }
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore quota / private-mode failures; in-memory state still works.
  }
}

function setState(next: OnboardingState): void {
  state = next
  writeStorage(next)
  emit()
}

export function subscribeOnboarding(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getOnboardingSnapshot(): OnboardingState {
  return state
}

export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(subscribeOnboarding, getOnboardingSnapshot, getOnboardingSnapshot)
}

export function completeOnboardingItem(id: OnboardingItemId): void {
  if (state.completed[id]) {
    return
  }
  setState({
    ...state,
    completed: { ...state.completed, [id]: true },
  })
}

export function completeOnboardingItems(ids: OnboardingItemId[]): void {
  const missing = ids.filter((id) => !state.completed[id])
  if (missing.length === 0) {
    return
  }
  const completed = { ...state.completed }
  for (const id of missing) {
    completed[id] = true
  }
  setState({ ...state, completed })
}

export function dismissOnboarding(): void {
  if (state.dismissed) {
    return
  }
  setState({ ...state, dismissed: true })
}

export function markOnboardingPathVisited(pathname: string): void {
  completeOnboardingItems(onboardingItemIdsForPath(pathname))
}

export function markAssistantOpened(): void {
  completeOnboardingItem("open-assistant")
}

export function getOnboardingProgress(snapshot: OnboardingState = state): {
  done: number
  total: number
  percent: number
  allDone: boolean
} {
  const total = onboardingItems.length
  const done = onboardingItems.filter((item) => snapshot.completed[item.id]).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { done, total, percent, allDone: done === total }
}

export function resetOnboarding(): void {
  state = emptyState()
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    } catch {
      // ignore
    }
  }
  emit()
}

/** Re-read localStorage (e.g. after test setup). */
export function hydrateOnboardingFromStorage(): void {
  state = readStorage()
  emit()
}
