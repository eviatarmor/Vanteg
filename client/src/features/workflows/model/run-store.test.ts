import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  WORKFLOW_RUNS_STORAGE_KEY,
  appendWorkflowRun,
  getRunsLoadState,
  getWorkflowRun,
  hydrateWorkflowRuns,
  listWorkflowRuns,
  resetWorkflowRuns,
  retryWorkflowRunsLoad,
  startMockRun,
  updateWorkflowRun,
} from "./run-store"
import type { WorkflowRun } from "./run-types"

describe("workflow run store", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetWorkflowRuns()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetWorkflowRuns()
  })

  it("seeds demo runs when storage is empty", () => {
    hydrateWorkflowRuns()
    const runs = listWorkflowRuns()
    expect(getRunsLoadState()).toBe("ready")
    expect(runs.length).toBeGreaterThanOrEqual(3)
    expect(runs.some((run) => run.status === "success")).toBe(true)
    expect(runs.some((run) => run.status === "failed")).toBe(true)
    expect(runs.some((run) => run.status === "running")).toBe(true)
    expect(localStorage.getItem(WORKFLOW_RUNS_STORAGE_KEY)).toBeTruthy()
  })

  it("filters runs by workflow id", () => {
    hydrateWorkflowRuns()
    const all = listWorkflowRuns()
    const first = all[0]!
    expect(listWorkflowRuns(first.workflowId).every((run) => run.workflowId === first.workflowId)).toBe(
      true
    )
  })

  it("persists appended runs", () => {
    hydrateWorkflowRuns()
    const run: WorkflowRun = {
      id: "run-new",
      workflowId: "wf-1",
      workflowName: "Custom",
      status: "success",
      startedAt: Date.now(),
      durationMs: 100,
      triggerLabel: "Manual",
      steps: [],
      inputs: [],
      outputs: [],
    }
    appendWorkflowRun(run)
    expect(getWorkflowRun("run-new")?.workflowName).toBe("Custom")

    const raw = localStorage.getItem(WORKFLOW_RUNS_STORAGE_KEY)
    expect(raw).toContain("run-new")
  })

  it("starts a mock run that completes successfully", () => {
    const run = startMockRun({
      workflowId: "wf-live",
      workflowName: "Live flow",
      triggerLabel: "Manual",
    })
    expect(run.status).toBe("running")
    expect(getWorkflowRun(run.id)?.status).toBe("running")

    vi.advanceTimersByTime(700)
    const done = getWorkflowRun(run.id)
    expect(done?.status).toBe("success")
    expect(done?.durationMs).toBe(640)
    expect(done?.outputs.some((entry) => entry.key === "status")).toBe(true)
  })

  it("updates run patches", () => {
    hydrateWorkflowRuns()
    const run = listWorkflowRuns().find((item) => item.status === "running")!
    updateWorkflowRun(run.id, {
      status: "failed",
      errorMessage: "boom",
      durationMs: 12,
    })
    expect(getWorkflowRun(run.id)?.errorMessage).toBe("boom")
  })

  it("surfaces an error load state when storage is corrupt", () => {
    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, "{not-json")
    resetWorkflowRuns()
    // force re-hydrate against corrupt storage
    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, "{not-json")
    hydrateWorkflowRuns()
    expect(getRunsLoadState()).toBe("error")
    expect(listWorkflowRuns()).toEqual([])
  })

  it("retries hydration after storage is repaired", () => {
    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, "{not-json")
    resetWorkflowRuns()
    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, "{not-json")
    hydrateWorkflowRuns()
    expect(getRunsLoadState()).toBe("error")

    localStorage.removeItem(WORKFLOW_RUNS_STORAGE_KEY)
    retryWorkflowRunsLoad()
    expect(getRunsLoadState()).toBe("ready")
    expect(listWorkflowRuns().length).toBeGreaterThanOrEqual(3)
  })
})
