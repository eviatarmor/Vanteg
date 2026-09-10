import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AUTH_STORAGE_KEY,
  clearSession,
  getSession,
  isAuthenticated,
  resetAuthSession,
  resolveCurrentUser,
  safeReturnPath,
  setSession,
} from "./session"

describe("mock auth session", () => {
  afterEach(() => {
    resetAuthSession()
    vi.unstubAllEnvs()
  })

  it("defaults to authenticated in test/DEV when storage is empty", () => {
    resetAuthSession()
    expect(isAuthenticated()).toBe(true)
    expect(getSession()).toBeNull()
    expect(resolveCurrentUser().displayName).toBe("Darren")
  })

  it("stores and clears a mock session", () => {
    expect(setSession({ email: "alex@vanteg.test", name: "Alex V" })).toBe(true)
    expect(isAuthenticated()).toBe(true)
    expect(getSession()).toEqual({
      email: "alex@vanteg.test",
      name: "Alex V",
    })
    expect(resolveCurrentUser()).toEqual({
      displayName: "Alex V",
      email: "alex@vanteg.test",
      role: "Owner",
      initials: "AV",
    })

    expect(clearSession()).toBe(true)
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe("logged-out")
    expect(isAuthenticated()).toBe(false)
    expect(getSession()).toBeNull()
  })

  it("returns false when localStorage cannot persist the session", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    expect(setSession({ email: "alex@vanteg.test", name: "Alex" })).toBe(false)
    expect(getSession()).toBeNull()
    vi.restoreAllMocks()
  })

  it("returns false when logout cannot persist the logged-out marker", () => {
    setSession({ email: "alex@vanteg.test", name: "Alex" })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    expect(clearSession()).toBe(false)
    vi.restoreAllMocks()
    expect(getSession()).toEqual({ email: "alex@vanteg.test", name: "Alex" })
  })

  it("treats missing key as logged out when VITE_REQUIRE_AUTH=true", () => {
    vi.stubEnv("VITE_REQUIRE_AUTH", "true")
    resetAuthSession()
    expect(isAuthenticated()).toBe(false)

    expect(setSession({ email: "alex@vanteg.test", name: "Alex" })).toBe(true)
    expect(isAuthenticated()).toBe(true)

    expect(clearSession()).toBe(true)
    expect(isAuthenticated()).toBe(false)
  })

  it("allows only in-app return paths", () => {
    expect(safeReturnPath("/workflows")).toBe("/workflows")
    expect(safeReturnPath("/integrations/oauth/callback?code=x")).toBe(
      "/integrations/oauth/callback?code=x"
    )
    expect(safeReturnPath("/login")).toBe("/")
    expect(safeReturnPath("/sign-up")).toBe("/")
    expect(safeReturnPath("//evil.example")).toBe("/")
    expect(safeReturnPath("https://evil.example")).toBe("/")
    expect(safeReturnPath("\\windows")).toBe("/")
    expect(safeReturnPath(undefined)).toBe("/")
  })
})
