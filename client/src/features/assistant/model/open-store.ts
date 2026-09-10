import { useSyncExternalStore } from "react"

let open = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeAssistantOpen(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAssistantOpen(): boolean {
  return open
}

export function setAssistantOpen(next: boolean): void {
  if (open === next) {
    return
  }
  open = next
  emit()
}

export function toggleAssistant(): void {
  setAssistantOpen(!open)
}

export function useAssistantOpen(): boolean {
  return useSyncExternalStore(
    subscribeAssistantOpen,
    getAssistantOpen,
    getAssistantOpen
  )
}

export function resetAssistantOpen(): void {
  open = false
  emit()
}
