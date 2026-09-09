import { describe, expect, it } from "vitest"

import { SECRET_MASK } from "@/features/data/model/mask-secret"

import { displayRunIoValue, summarizeRunIo } from "./mask-run-io"

describe("displayRunIoValue", () => {
  it("returns plaintext for non-secret entries", () => {
    expect(displayRunIoValue({ key: "email", value: "a@b.com" })).toBe("a@b.com")
  })

  it("masks secret values with the shared secret mask", () => {
    expect(
      displayRunIoValue({ key: "apiKey", value: "sk-live-secret", secret: true })
    ).toBe(SECRET_MASK)
  })

  it("keeps empty secrets empty", () => {
    expect(displayRunIoValue({ key: "token", value: "", secret: true })).toBe("")
  })
})

describe("summarizeRunIo", () => {
  it("maps entries through display masking", () => {
    expect(
      summarizeRunIo([
        { key: "email", value: "a@b.com" },
        { key: "token", value: "secret", secret: true },
      ])
    ).toEqual([
      { key: "email", value: "a@b.com" },
      { key: "token", value: SECRET_MASK },
    ])
  })
})
