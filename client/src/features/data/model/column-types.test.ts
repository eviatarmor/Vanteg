import { describe, expect, it } from "vitest"

import { databaseColumnTypes } from "./column-types"

describe("databaseColumnTypes", () => {
  it("offers a secret type that hides previous characters", () => {
    expect(databaseColumnTypes).toEqual(
      expect.arrayContaining([{ value: "secret", label: "Secret" }])
    )
  })
})
