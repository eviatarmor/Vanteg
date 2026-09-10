import { resolveCurrentUser } from "../../auth/model/session"

import { matchActivePath } from "./match-path"
import type {
  NavItem,
  NavSection,
  UserMenuItem,
  WorkspaceIdentity,
} from "./types"

const workspaceIdentity: WorkspaceIdentity = {
  productName: "Vanteg",
  assistantActionLabel: "Ask Vanteg",
}

const navSections: NavSection[] = [
  {
    id: "work",
    label: "Work",
    items: [
      { id: "home", label: "Home", path: "/", icon: "home" },
      {
        id: "assistant",
        label: "Assistant",
        path: "/assistant",
        icon: "assistant",
      },
      {
        id: "inbox",
        label: "Inbox",
        path: "/inbox",
        icon: "inbox",
        badgeCount: 3,
      },
    ],
  },
  {
    id: "build",
    label: "Build",
    items: [
      {
        id: "workflows",
        label: "Workflows",
        path: "/workflows",
        icon: "workflows",
      },
      { id: "agents", label: "Agents", path: "/agents", icon: "agents" },
      { id: "teams", label: "Teams", path: "/teams", icon: "teams" },
      { id: "data", label: "Data", path: "/data", icon: "data" },
      { id: "memory", label: "Memory", path: "/memory", icon: "memory" },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      {
        id: "integrations",
        label: "Connectors",
        path: "/integrations",
        icon: "integrations",
      },
      {
        id: "api-keys",
        label: "API Keys",
        path: "/api-keys",
        icon: "api-keys",
      },
    ],
  },
]

const footerNav: NavItem[] = [
  { id: "help", label: "Help", path: "/help", icon: "help" },
]

const userMenuItems: UserMenuItem[] = [
  { id: "settings", label: "Settings", href: "/settings" },
  { id: "logout", label: "Log out", action: "logout" },
]

export function getWorkspaceIdentity(): WorkspaceIdentity {
  return workspaceIdentity
}

export function getCurrentUser() {
  return resolveCurrentUser()
}

export function getNavSections(): NavSection[] {
  return navSections
}

export function getFooterNav(): NavItem[] {
  return footerNav
}

export function getUserMenuItems(): UserMenuItem[] {
  return userMenuItems
}

export function getAllNavItems(): NavItem[] {
  return [...navSections.flatMap((section) => section.items), ...footerNav]
}

const pageSubtitles: Record<string, string> = {
  "/": "Your workspace at a glance.",
  "/assistant": "Full-page chat with Vanteg and your conversation history.",
  "/inbox": "Approve, deny, or always allow work from agents and workflows.",
  "/workflows": "Build, draft, and run automations.",
  "/agents": "Personalize agents and assign shared memory and knowledge.",
  "/teams":
    "Orchestrate multiple agents as a graph, like a lead and senior SWE.",
  "/data": "Tables, variables, and secrets used by workflows.",
  "/memory": "Shared memory bases and knowledge files.",
  "/integrations":
    "Connect Google apps and MCP servers used by workflow steps.",
  "/api-keys": "API keys for calling Vanteg from outside this workspace.",
  "/help": "Guides and answers for Vanteg.",
  "/settings": "Workspace and account preferences.",
}

export function getPageCopy(pathname: string): {
  title: string
  subtitle: string
} {
  const navMatch = getAllNavItems().find((item) =>
    matchActivePath(pathname, item.path)
  )
  if (navMatch) {
    return {
      title: navMatch.label,
      subtitle: pageSubtitles[navMatch.path] ?? "",
    }
  }

  const menuMatch = getUserMenuItems().find(
    (item) => "href" in item && matchActivePath(pathname, item.href)
  )
  if (menuMatch && "href" in menuMatch) {
    return {
      title: menuMatch.label,
      subtitle: pageSubtitles[menuMatch.href] ?? "",
    }
  }

  return {
    title: "Page not found",
    subtitle: "This page does not exist.",
  }
}

export function getPageTitle(pathname: string): string {
  return getPageCopy(pathname).title
}
