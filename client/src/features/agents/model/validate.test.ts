import { describe, expect, it } from "vitest"

import { validateAgentName } from "./validate"

describe("validateAgentName", () => {
  it("requires a non-empty name", () => {
    expect(validateAgentName("")).toBe("Name is required.")
    expect(validateAgentName("   ")).toBe("Name is required.")
    expect(validateAgentName("Support")).toBeUndefined()
  })

  it("rejects overly long names", () => {
    expect(validateAgentName("x".repeat(81))).toBe(
      "Name must be 80 characters or fewer."
    )
  })
})
