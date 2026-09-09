import { getCurrentUser, getWorkspaceIdentity } from "@/features/shell/model/catalog"

export const SETTINGS_STORAGE_KEY = "vanteg.settings.preferences"

export type NotificationPreferences = {
  emailNotifications: boolean
  inboxNotifications: boolean
}

export type WorkspacePreferences = {
  displayName: string
}

export type ProfileDraft = {
  displayName: string
  email: string
}

export type SettingsPreferences = NotificationPreferences & WorkspacePreferences

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  inboxNotifications: true,
}

function defaultWorkspaceName(): string {
  return getWorkspaceIdentity().productName
}

export function defaultPreferences(): SettingsPreferences {
  return {
    ...DEFAULT_NOTIFICATIONS,
    displayName: defaultWorkspaceName(),
  }
}

export function defaultProfile(): ProfileDraft {
  const user = getCurrentUser()
  return {
    displayName: user.displayName,
    email: user.email,
  }
}

export function loadPreferences(): SettingsPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences()
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return defaultPreferences()
    }
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>
    return {
      emailNotifications:
        typeof parsed.emailNotifications === "boolean"
          ? parsed.emailNotifications
          : DEFAULT_NOTIFICATIONS.emailNotifications,
      inboxNotifications:
        typeof parsed.inboxNotifications === "boolean"
          ? parsed.inboxNotifications
          : DEFAULT_NOTIFICATIONS.inboxNotifications,
      displayName:
        typeof parsed.displayName === "string" && parsed.displayName.trim()
          ? parsed.displayName.trim()
          : defaultWorkspaceName(),
    }
  } catch {
    return defaultPreferences()
  }
}

export function savePreferences(next: SettingsPreferences): void {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
}

export function resetPreferences(): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateProfile(draft: ProfileDraft): {
  displayName?: string
  email?: string
} {
  const errors: { displayName?: string; email?: string } = {}
  const name = draft.displayName.trim()
  const email = draft.email.trim()

  if (!name) {
    errors.displayName = "Name is required."
  } else if (name.length > 80) {
    errors.displayName = "Name must be 80 characters or fewer."
  }

  if (!email) {
    errors.email = "Email is required."
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address."
  }

  return errors
}

export function validateWorkspaceName(displayName: string): string | undefined {
  const trimmed = displayName.trim()
  if (!trimmed) {
    return "Workspace name is required."
  }
  if (trimmed.length > 60) {
    return "Workspace name must be 60 characters or fewer."
  }
  return undefined
}
