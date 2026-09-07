import { describe, expect, it } from "vitest"

import { integrationTabs } from "./tabs"

describe("integrationTabs", () => {
  it("has no page tabs", () => {
    expect(integrationTabs).toEqual([])
  })
})

