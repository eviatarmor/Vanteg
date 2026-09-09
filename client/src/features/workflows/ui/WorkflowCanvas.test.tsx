import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { createDraft, getWorkflow, resetWorkflows } from "../model/store"
import { WorkflowCanvas } from "./WorkflowCanvas"

function renderCanvas(workflow = createDraft()) {
  render(
    <TooltipProvider>
      <div style={{ width: 960, height: 640 }}>
        <WorkflowCanvas workflow={workflow} />
      </div>
    </TooltipProvider>
  )
  return workflow
}

function openPaneMenu() {
  const pane = document.querySelector(".react-flow__pane")
  if (!pane) {
    throw new Error("canvas pane missing")
  }
  fireEvent.contextMenu(pane)
}

describe("WorkflowCanvas", () => {
  beforeEach(() => {
    resetWorkflows()
  })

  it("has no side palette and opens a right-click menu on the pane", () => {
    renderCanvas()

    expect(document.querySelector(".react-flow__controls")).toBeNull()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Fit view" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lock canvas" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Test" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Deploy" })).toBeInTheDocument()

    openPaneMenu()

    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Inbound call" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "If" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Send message" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "More" })).toBeInTheDocument()
  })

  it("adds a node from the pane menu without opening the sheet", async () => {
    const user = userEvent.setup()
    renderCanvas()
    openPaneMenu()

    await user.click(screen.getByRole("menuitem", { name: "HTTP Request" }))

    expect(screen.queryByRole("dialog", { name: "HTTP Request" })).not.toBeInTheDocument()
    expect(screen.getByText("HTTP Request")).toBeInTheDocument()
  })

  it("opens the sheet on double-click", () => {
    renderCanvas()

    const node = document.querySelector(".react-flow__node")
    if (!node) {
      throw new Error("node missing")
    }
    fireEvent.dblClick(node)

    expect(screen.getByRole("dialog", { name: "Manual" })).toBeInTheDocument()
    expect(screen.getByText("Ports")).toBeInTheDocument()
    expect(screen.getByLabelText("Notes")).toBeInTheDocument()
  })

  it("opens a node menu with duplicate and delete", async () => {
    const user = userEvent.setup()
    renderCanvas()

    const node = document.querySelector(".react-flow__node")
    if (!node) {
      throw new Error("node missing")
    }
    fireEvent.contextMenu(node)

    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument()

    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }))
    expect(screen.getAllByText("Manual")).toHaveLength(2)
  })

  it("opens the more picker with triggers, logic gates, and connectors", async () => {
    const user = userEvent.setup()
    renderCanvas()
    openPaneMenu()

    await user.click(screen.getByRole("menuitem", { name: "More" }))

    expect(screen.getByRole("dialog", { name: "Add a step" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Triggers" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Logic gates" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Connectors" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /RSS/ })).toBeInTheDocument()
  })

  it("deploys the workflow from the canvas toolbar", async () => {
    const user = userEvent.setup()
    const workflow = renderCanvas()

    await user.click(screen.getByRole("button", { name: "Deploy" }))

    expect(getWorkflow(workflow.id)?.status).toBe("prod")
  })
})
