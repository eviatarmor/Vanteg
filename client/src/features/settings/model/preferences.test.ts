import { beforeEach, describe, expect, it } from "vitest"

import {
  defaultPreferences,
  defaultProfile,
  loadPreferences,
  resetPreferences,
  savePreferences,
  validateProfile,
  validateWorkspaceName,
} from "./preferences"

describe("settings preferences", () => {
  beforeEach(() => {
    resetPreferences()
  })

  it("defaults profile from the catalog user", () => {
    expect(defaultProfile()).toEqual({
      displayName: "Darren",
      email: "darren@vanteg.app",
    })
  })

  it("persists notification and workspace preferences in localStorage", () => {
    savePreferences({
      emailNotifications: false,
      inboxNotifications: true,
      displayName: "Acme Ops",
    })

    expect(loadPreferences()).toEqual({
      emailNotifications: false,
      inboxNotifications: true,
      displayName: "Acme Ops",
    })
  })

  it("falls back to defaults when storage is empty", () => {
    expect(loadPreferences()).toEqual(defaultPreferences())
  })

  it("validates profile and workspace fields", () => {
    expect(validateProfile({ displayName: "", email: "nope" })).toEqual({
      displayName: "Name is required.",
      email: "Enter a valid email address.",
    })
    expect(
      validateProfile({ displayName: "Ada", email: "ada@vanteg.app" })
    ).toEqual({})
    expect(validateWorkspaceName("")).toBe("Workspace name is required.")
    expect(validateWorkspaceName("Vanteg")).toBeUndefined()
  })
})
