export function validateAgentName(name: string): string | undefined {
  if (!name.trim()) {
    return "Name is required."
  }
  if (name.trim().length > 80) {
    return "Name must be 80 characters or fewer."
  }
  return undefined
}
