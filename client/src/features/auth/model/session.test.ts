import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AUTH_STORAGE_KEY,
  clearSession,
  getSession,
  isAuthenticated,
  resetAuthSession,
  resolveCurrentUser,
  resolvePostAuthPath,
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
    setSession({ email: "alex@vanteg.test", name: "Alex V" })
    expect(isAuthenticated()).toBe(true)
    expect(getSession()).toEqual({
      email: "alex@vanteg.test",
      name: "Alex V",
    })
    expect(resolveCurrentUser()).toEqual({
      displayName: "Alex V",
      role: "Owner",
      initials: "AV",
    })

    clearSession()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe("logged-out")
    expect(isAuthenticated()).toBe(false)
    expect(getSession()).toBeNull()
  })

  it("treats missing key as logged out when VITE_REQUIRE_AUTH=true", () => {
    vi.stubEnv("VITE_REQUIRE_AUTH", "true")
    resetAuthSession()
    expect(isAuthenticated()).toBe(false)

    setSession({ email: "alex@vanteg.test", name: "Alex" })
    expect(isAuthenticated()).toBe(true)

    clearSession()
    expect(isAuthenticated()).toBe(false)
  })
})

describe("resolvePostAuthPath", () => {
  it("defaults to home and rejects open redirects", () => {
    expect(resolvePostAuthPath(null)).toBe("/")
    expect(resolvePostAuthPath("")).toBe("/")
    expect(resolvePostAuthPath("https://evil.example")).toBe("/")
    expect(resolvePostAuthPath("//evil.example")).toBe("/")
    expect(resolvePostAuthPath("/login")).toBe("/")
    expect(resolvePostAuthPath("/sign-up")).toBe("/")
  })

  it("accepts same-app deep links", () => {
    expect(resolvePostAuthPath("/workflows")).toBe("/workflows")
    expect(resolvePostAuthPath("/inbox?tab=all")).toBe("/inbox?tab=all")
  })
})
