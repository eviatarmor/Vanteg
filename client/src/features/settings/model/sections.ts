export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
  { id: "privacy", label: "Privacy & data" },
  { id: "security", label: "Security" },
  { id: "workspace", label: "Workspace" },
  { id: "compliance", label: "Compliance" },
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"]

export function isSettingsSectionId(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value)
}
