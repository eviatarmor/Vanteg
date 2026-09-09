import { describe, expect, it } from "vitest"

import { err, isIntegrationError, ok } from "./errors.ts"

describe("integration errors", () => {
  it("builds ok and err results", () => {
    expect(ok({ id: "1" })).toEqual({ ok: true, data: { id: "1" } })
    expect(err({ code: "validation", message: "bad" })).toEqual({
      ok: false,
      error: { code: "validation", message: "bad" },
    })
  })

  it("detects IntegrationError shapes", () => {
    expect(isIntegrationError({ code: "not_found", message: "missing" })).toBe(true)
    expect(isIntegrationError({ code: "nope", message: "x" })).toBe(false)
    expect(isIntegrationError(null)).toBe(false)
  })
})
