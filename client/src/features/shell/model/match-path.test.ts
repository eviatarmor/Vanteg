import { describe, expect, it } from "vitest"

import { matchActivePath } from "./match-path"

describe("matchActivePath", () => {
  it("treats only the exact root as Home", () => {
    expect(matchActivePath("/", "/")).toBe(true)
    expect(matchActivePath("/inbox", "/")).toBe(false)
    expect(matchActivePath("/workflows", "/")).toBe(false)
  })

  it("matches a feature path and its nested routes", () => {
    expect(matchActivePath("/inbox", "/inbox")).toBe(true)
    expect(matchActivePath("/inbox/42", "/inbox")).toBe(true)
    expect(matchActivePath("/workflows", "/inbox")).toBe(false)
  })

  it("does not treat a prefix sibling as a match", () => {
    expect(matchActivePath("/inbox-archive", "/inbox")).toBe(false)
  })
})
