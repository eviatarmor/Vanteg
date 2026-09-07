export type NavIconId =
  | "home"
  | "inbox"
  | "workflows"
  | "agents"
  | "teams"
  | "data"
  | "memory"
  | "integrations"
  | "api-keys"
  | "help"

export type NavItemId = NavIconId

export interface NavItem {
  id: NavItemId
  label: string
  path: string
  icon: NavIconId
  badgeCount?: number
}

export interface NavSection {
  id: "work" | "build" | "manage"
  label: string
  items: NavItem[]
}

export interface WorkspaceIdentity {
  productName: string
  assistantActionLabel: string
}

export interface CurrentUser {
  displayName: string
  role: string
  initials: string
}

export type UserMenuItem =
  | { id: "settings"; label: string; href: string }
  | { id: "logout"; label: string; action: "logout" }
