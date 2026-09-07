let items: string[] = []

export function addFeedback(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) {
    return
  }
  items = [...items, trimmed]
}

export function listFeedback(): readonly string[] {
  return items
}

export function resetFeedback(): void {
  items = []
}
