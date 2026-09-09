import { getCurrentUser, getWorkspaceIdentity } from "@/features/shell/model/catalog"

export const SETTINGS_STORAGE_KEY = "vanteg.settings.preferences"

export type DensityPreference = "comfortable" | "compact"

export type NotificationPreferences = {
  emailNotifications: boolean
  inboxNotifications: boolean
  productNotifications: boolean
}

export type AppearancePreferences = {
  density: DensityPreference
  sidebarCompact: boolean
}

export type PrivacyConsentPreferences = {
  cookieConsent: boolean
  analyticsConsent: boolean
}

export type SecurityPreferences = {
  twoFactorEnabled: boolean
}

export type WorkspacePreferences = {
  displayName: string
  timezone: string
  locale: string
}

export type ProfileDraft = {
  displayName: string
  email: string
}

export type SettingsPreferences = NotificationPreferences &
  AppearancePreferences &
  PrivacyConsentPreferences &
  SecurityPreferences &
  WorkspacePreferences

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  inboxNotifications: true,
  productNotifications: true,
}

const DEFAULT_APPEARANCE: AppearancePreferences = {
  density: "comfortable",
  sidebarCompact: false,
}

const DEFAULT_PRIVACY: PrivacyConsentPreferences = {
  cookieConsent: true,
  analyticsConsent: false,
}

const DEFAULT_SECURITY: SecurityPreferences = {
  twoFactorEnabled: false,
}

export const WORKSPACE_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const

export const WORKSPACE_LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "German" },
  { value: "fr-FR", label: "French" },
  { value: "ja-JP", label: "Japanese" },
  { value: "en-AU", label: "English (AU)" },
] as const

function defaultWorkspaceName(): string {
  return getWorkspaceIdentity().productName
}

export function defaultPreferences(): SettingsPreferences {
  return {
    ...DEFAULT_NOTIFICATIONS,
    ...DEFAULT_APPEARANCE,
    ...DEFAULT_PRIVACY,
    ...DEFAULT_SECURITY,
    displayName: defaultWorkspaceName(),
    timezone: "UTC",
    locale: "en-US",
  }
}

export function defaultProfile(): ProfileDraft {
  const user = getCurrentUser()
  return {
    displayName: user.displayName,
    email: user.email,
  }
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asDensity(value: unknown): DensityPreference {
  return value === "compact" ? "compact" : "comfortable"
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
    const defaults = defaultPreferences()
    return {
      emailNotifications: asBoolean(
        parsed.emailNotifications,
        defaults.emailNotifications
      ),
      inboxNotifications: asBoolean(
        parsed.inboxNotifications,
        defaults.inboxNotifications
      ),
      productNotifications: asBoolean(
        parsed.productNotifications,
        defaults.productNotifications
      ),
      density: asDensity(parsed.density),
      sidebarCompact: asBoolean(parsed.sidebarCompact, defaults.sidebarCompact),
      cookieConsent: asBoolean(parsed.cookieConsent, defaults.cookieConsent),
      analyticsConsent: asBoolean(
        parsed.analyticsConsent,
        defaults.analyticsConsent
      ),
      twoFactorEnabled: asBoolean(
        parsed.twoFactorEnabled,
        defaults.twoFactorEnabled
      ),
      displayName:
        typeof parsed.displayName === "string" && parsed.displayName.trim()
          ? parsed.displayName.trim()
          : defaults.displayName,
      timezone:
        typeof parsed.timezone === "string" && parsed.timezone.trim()
          ? parsed.timezone.trim()
          : defaults.timezone,
      locale:
        typeof parsed.locale === "string" && parsed.locale.trim()
          ? parsed.locale.trim()
          : defaults.locale,
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
