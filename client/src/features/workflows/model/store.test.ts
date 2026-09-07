import { beforeEach, describe, expect, it } from "vitest"

import {
  createDraft,
  getWorkflow,
  listWorkflows,
  resetWorkflows,
  saveWorkflow,
} from "./store"

describe("workflow store", () => {
  beforeEach(() => {
    resetWorkflows()
  })

  it("creates a named draft with a manual trigger", () => {
    const workflow = createDraft()

    expect(workflow.status).toBe("draft")
    expect(workflow.name).toBe("Untitled workflow")
    expect(getWorkflow(workflow.id)?.id).toBe(workflow.id)
    expect(listWorkflows("draft")).toHaveLength(1)
    expect(workflow.nodes[0]?.data.catalogId).toBe("manual")
  })

  it("increments untitled names", () => {
    createDraft()
    expect(createDraft().name).toBe("Untitled workflow 2")
  })

  it("saves name changes", () => {
    const workflow = createDraft()
    saveWorkflow(workflow.id, { name: "Lead alerts" })
    expect(getWorkflow(workflow.id)?.name).toBe("Lead alerts")
  })
})
