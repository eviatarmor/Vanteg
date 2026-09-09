import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SECRET_MASK } from "@/features/data/model/mask-secret"

import {
  resetWorkflowRuns,
  setRunsLoadStateForTests,
  startMockRun,
} from "../model/run-store"
import { WorkflowRunsPanel } from "./WorkflowRunsPanel"

describe("WorkflowRunsPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    resetWorkflowRuns({ seed: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    resetWorkflowRuns()
  })

  it("lists seeded runs and shows detail with masked secrets", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<WorkflowRunsPanel />)

    expect(screen.getByRole("list", { name: "Workflow runs" })).toBeInTheDocument()
    expect(screen.getByText("Lead alerts")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Invoice sync/i }))

    expect(screen.getByText("HTTP Request returned 401 Unauthorized")).toBeInTheDocument()
    expect(screen.getByText(SECRET_MASK)).toBeInTheDocument()
    expect(screen.queryByText("tok_live_abc")).not.toBeInTheDocument()
  })

  it("shows loading and error states", () => {
    act(() => {
      setRunsLoadStateForTests("loading")
    })
    const { rerender } = render(<WorkflowRunsPanel />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading runs")

    act(() => {
      setRunsLoadStateForTests("error")
    })
    rerender(<WorkflowRunsPanel />)
    expect(screen.getByRole("heading", { name: "Couldn't load runs" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })

  it("retries after a corrupt storage error", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    localStorage.setItem("vanteg.workflow-runs", "{not-json")
    resetWorkflowRuns()
    localStorage.setItem("vanteg.workflow-runs", "{not-json")

    render(<WorkflowRunsPanel />)
    expect(screen.getByRole("heading", { name: "Couldn't load runs" })).toBeInTheDocument()

    localStorage.removeItem("vanteg.workflow-runs")
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(screen.getByRole("list", { name: "Workflow runs" })).toBeInTheDocument()
    expect(screen.getByText("Lead alerts")).toBeInTheDocument()
  })

  it("shows empty state for a workflow with no runs and can run now", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <WorkflowRunsPanel
        workflowId="wf-empty"
        workflowName="Fresh flow"
        showRunNow
      />
    )

    expect(screen.getByRole("heading", { name: "No runs yet" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Run now" }))
    expect(screen.getByRole("list", { name: "Workflow runs" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Fresh flow" })).toBeInTheDocument()
  })
})

describe("startMockRun from panel", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetWorkflowRuns()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetWorkflowRuns()
  })

  it("completes a mock run", () => {
    const run = startMockRun({ workflowId: "a", workflowName: "A" })
    expect(run.status).toBe("running")
    vi.advanceTimersByTime(700)
  })
})
