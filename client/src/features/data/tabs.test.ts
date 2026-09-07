import { describe, expect, it } from "vitest"

import { dataTabs } from "./tabs"

describe("dataTabs", () => {
  it("lists Database, Variables, and Secrets in that order", () => {
    expect(dataTabs.map((tab) => tab.label)).toEqual([
      "Database",
      "Variables",
      "Secrets",
    ])
  })

  it("offers a new prompt for each data tab", () => {
    expect(dataTabs.map((tab) => tab.newAction.label)).toEqual([
      "New table",
      "New variable",
      "New secret",
    ])
  })
})
