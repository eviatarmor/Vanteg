import { describe, expect, it } from "vitest"

import {
  getAllNavItems,
  getCurrentUser,
  getFooterNav,
  getNavSections,
  getPageCopy,
  getPageTitle,
  getUserMenuItems,
  getWorkspaceIdentity,
} from "./catalog"

describe("workspace identity", () => {
  it("uses Freeze as the product name, not Bay", () => {
    const identity = getWorkspaceIdentity()
    expect(identity.productName).toBe("Freeze")
    expect(identity.assistantActionLabel).toBe("Ask Freeze")
    expect(identity).not.toHaveProperty("organizationName")
    expect(identity.productName.toLowerCase()).not.toContain("bay")
    expect(identity.assistantActionLabel.toLowerCase()).not.toContain("bay")
  })
})

describe("current user", () => {
  it("exposes the owner shown in the shell footer", () => {
    expect(getCurrentUser()).toEqual({
      displayName: "Darren",
      role: "Owner",
      initials: "DH",
    })
  })

  it("lists Settings and Log out on the avatar menu", () => {
    expect(getUserMenuItems().map((item) => item.label)).toEqual([
      "Settings",
      "Log out",
    ])
  })
})

describe("nav catalog", () => {
  it("groups Work, Build, and Manage items in screenshot order", () => {
    const sections = getNavSections()
    expect(sections.map((section) => section.label)).toEqual([
      "Work",
      "Build",
      "Manage",
    ])
    expect(sections[0]?.items.map((item) => item.label)).toEqual([
      "Home",
      "Inbox",
    ])
    expect(sections[1]?.items.map((item) => item.label)).toEqual([
      "Workflows",
      "Agents",
      "Teams",
      "Data",
      "Memory",
    ])
    expect(sections[2]?.items.map((item) => item.label)).toEqual([
      "Integrations",
      "API Keys",
    ])
  })

  it("puts Help in the footer, not in Work, Build, or Manage", () => {
    expect(getFooterNav().map((item) => item.label)).toEqual(["Help"])
    const sectionLabels = getNavSections().flatMap((section) =>
      section.items.map((item) => item.label)
    )
    expect(sectionLabels).not.toContain("Help")
    expect(sectionLabels).not.toContain("Settings")
  })

  it("shows three unread items on Inbox", () => {
    const inbox = getAllNavItems().find((item) => item.id === "inbox")
    expect(inbox?.badgeCount).toBe(3)
  })

  it("maps each item to a unique path", () => {
    const paths = getAllNavItems().map((item) => item.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe("getPageTitle", () => {
  it("returns the nav label for a known path", () => {
    expect(getPageTitle("/")).toBe("Home")
    expect(getPageTitle("/inbox")).toBe("Inbox")
    expect(getPageTitle("/workflows")).toBe("Workflows")
    expect(getPageTitle("/data")).toBe("Data")
    expect(getPageTitle("/memory")).toBe("Memory")
    expect(getPageTitle("/agents")).toBe("Agents")
    expect(getPageTitle("/agents/abc")).toBe("Agents")
    expect(getPageTitle("/teams")).toBe("Teams")
    expect(getPageTitle("/teams/abc")).toBe("Teams")
    expect(getPageTitle("/integrations")).toBe("Integrations")
    expect(getPageTitle("/api-keys")).toBe("API Keys")
    expect(getPageTitle("/help")).toBe("Help")
    expect(getPageTitle("/settings")).toBe("Settings")
    expect(getPageTitle("/inbox/42")).toBe("Inbox")
    expect(getPageTitle("/workflows/abc")).toBe("Workflows")
  })

  it("returns Page not found for unknown paths", () => {
    expect(getPageTitle("/missing")).toBe("Page not found")
  })
})

describe("getPageCopy", () => {
  it("pairs each page with a subtitle", () => {
    expect(getPageCopy("/")).toEqual({
      title: "Home",
      subtitle: "Your workspace at a glance.",
    })
    expect(getPageCopy("/workflows")).toEqual({
      title: "Workflows",
      subtitle: "Build, draft, and run automations.",
    })
    expect(getPageCopy("/integrations")).toEqual({
      title: "Integrations",
      subtitle: "Connect apps used by workflow steps.",
    })
    expect(getPageCopy("/api-keys")).toEqual({
      title: "API Keys",
      subtitle: "API keys for calling Freeze from outside this workspace.",
    })
    expect(getPageCopy("/missing")).toEqual({
      title: "Page not found",
      subtitle: "This page does not exist.",
    })
  })
})
