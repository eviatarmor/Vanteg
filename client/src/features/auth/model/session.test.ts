import { afterEach, describe, expect, it } from "vitest"

import {
  AUTH_STORAGE_KEY,
  clearSession,
  getSession,
  isAuthenticated,
  resetAuthSession,
  resolveCurrentUser,
  setSession,
} from "./session"

describe("mock auth session", () => {
  afterEach(() => {
    resetAuthSession()
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
})
