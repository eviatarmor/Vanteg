import { describe, expect, it } from "vitest"

import { workflowTabs } from "./tabs"

describe("workflowTabs", () => {
  it("lists Deployed, Drafts, and Runs in that order", () => {
    expect(workflowTabs.map((tab) => tab.label)).toEqual([
      "Deployed",
      "Drafts",
      "Runs",
    ])
  })

  it("offers a new workflow prompt on each tab", () => {
    expect(workflowTabs.map((tab) => tab.newAction.label)).toEqual([
      "New workflow",
      "New workflow",
      "New workflow",
    ])
  })
})
