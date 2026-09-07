import { describe, expect, it } from "vitest"

import { applySecretInput, maskSecretLast, SECRET_MASK } from "./mask-secret"

describe("SECRET_MASK", () => {
  it("is a fixed run of asterisks", () => {
    expect(SECRET_MASK).toBe("*****")
  })
})

describe("maskSecretLast", () => {
  it("hides every character except the last", () => {
    expect(maskSecretLast("")).toBe("")
    expect(maskSecretLast("a")).toBe("a")
    expect(maskSecretLast("ab")).toBe("*b")
    expect(maskSecretLast("hidden")).toBe("*****n")
    expect(maskSecretLast("dev-jwt-secret")).toBe("*************t")
  })
})

describe("applySecretInput", () => {
  it("appends the last typed character to the real value", () => {
    expect(applySecretInput("ab", "*bc")).toBe("abc")
  })

  it("deletes from the real value when the display shortens", () => {
    expect(applySecretInput("abc", "**")).toBe("ab")
    expect(applySecretInput("abc", "")).toBe("")
  })

  it("replaces the value when the display is plaintext", () => {
    expect(applySecretInput("abc", "h")).toBe("h")
    expect(applySecretInput("abc", "hello")).toBe("hello")
  })
})
