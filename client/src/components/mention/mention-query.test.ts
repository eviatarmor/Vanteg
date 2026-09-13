import { describe, expect, it } from "vitest"

import { findMentionQuery } from "./mention-query"

describe("findMentionQuery", () => {
  it("finds an at query beginning at a whitespace token boundary", () => {
    expect(findMentionQuery("hello @ada", 10)).toEqual({
      start: 6,
      end: 10,
      search: "ada",
    })
    expect(findMentionQuery("@ops", 4)).toEqual({
      start: 0,
      end: 4,
      search: "ops",
    })
  })

  it("uses search text through the caret", () => {
    expect(findMentionQuery("hello @adapter", 10)).toEqual({
      start: 6,
      end: 14,
      search: "ada",
    })
  })

  it("opens on a bare at sign at a token boundary", () => {
    expect(findMentionQuery("hello @", 7)).toEqual({
      start: 6,
      end: 7,
      search: "",
    })
  })

  it("does not match email addresses", () => {
    expect(findMentionQuery("me@company.com", 14)).toBeNull()
    expect(findMentionQuery("write me@company.com later", 20)).toBeNull()
  })

  it("does not match at signs mid-token", () => {
    expect(findMentionQuery("foo@bar", 7)).toBeNull()
    expect(findMentionQuery("hello@world", 11)).toBeNull()
  })

  it("closes once the search contains whitespace", () => {
    expect(findMentionQuery("hello @ada more", 11)).toBeNull()
  })
})
