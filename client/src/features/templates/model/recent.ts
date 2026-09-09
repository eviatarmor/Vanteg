const STORAGE_KEY = "vanteg.templates.recent"

export function readRecentTemplateIds(limit = 8): string[] {
  if (typeof localStorage === "undefined") {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((id): id is string => typeof id === "string").slice(0, limit)
  } catch {
    return []
  }
}

export function rememberTemplateId(id: string, limit = 8): string[] {
  const next = [id, ...readRecentTemplateIds(limit).filter((item) => item !== id)].slice(
    0,
    limit
  )
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore quota / private mode failures.
    }
  }
  return next
}

export function clearRecentTemplateIds(): void {
  if (typeof localStorage === "undefined") {
    return
  }
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore.
  }
}
