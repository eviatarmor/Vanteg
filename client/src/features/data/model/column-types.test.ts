import { describe, expect, it } from "vitest"

import {
  databaseColumnTypes,
  findColumnTypeId,
  TEXT_FORMAT_REGEX,
  valueMatchesRegex,
} from "./column-types"

describe("databaseColumnTypes", () => {
  it("offers a secret type that hides previous characters", () => {
    expect(databaseColumnTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "secret", label: "Secret" }),
      ])
    )
  })

  it("nests text formats and adds time and datetime", () => {
    expect(databaseColumnTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "email", label: "Email" }),
        expect.objectContaining({ value: "url", label: "URL" }),
        expect.objectContaining({ value: "time", label: "Time" }),
        expect.objectContaining({ value: "datetime", label: "Datetime" }),
      ])
    )
  })

  it("maps a stored column back to a type tree id", () => {
    expect(findColumnTypeId({ variant: "short-text", textFormat: "email" })).toBe("email")
    expect(findColumnTypeId({ variant: "url" })).toBe("url")
    expect(findColumnTypeId({ variant: "time" })).toBe("time")
    expect(findColumnTypeId({ variant: "short-text" })).toBe("plain")
  })

  it("validates text against a regex schema", () => {
    expect(valueMatchesRegex("ada@vanteg.dev", TEXT_FORMAT_REGEX.email)).toBe(true)
    expect(valueMatchesRegex("not-an-email", TEXT_FORMAT_REGEX.email)).toBe(false)
    expect(valueMatchesRegex("", TEXT_FORMAT_REGEX.email)).toBe(true)
  })
})
