import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ResizableSidebar } from "./ResizableSidebar"

describe("ResizableSidebar", () => {
  it("puts a resize handle between the sidebar and the main pane", () => {
    render(
      <div className="flex h-96 w-[800px]">
        <ResizableSidebar id="test-split" sidebar={<p>Sidebar tree</p>}>
          <p>Main pane</p>
        </ResizableSidebar>
      </div>
    )

    expect(screen.getByText("Sidebar tree")).toBeInTheDocument()
    expect(screen.getByText("Main pane")).toBeInTheDocument()
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()
  })

  it("places a right sidebar after the same resize handle", () => {
    render(
      <div className="flex h-96 w-[800px]">
        <ResizableSidebar
          id="assistant-split"
          side="right"
          sidebar={<p>Assistant pane</p>}
        >
          <p>Main pane</p>
        </ResizableSidebar>
      </div>
    )

    const handle = screen.getByRole("separator", { name: "Resize panel" })
    expect(handle.compareDocumentPosition(screen.getByText("Assistant pane"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(handle.compareDocumentPosition(screen.getByText("Main pane"))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    )
  })

  it("animates a collapsible pane closed and open", () => {
    const { container, rerender } = render(
      <div className="flex h-96 w-[800px]">
        <ResizableSidebar
          id="assistant-split"
          side="right"
          collapsed={false}
          sidebar={<p>Assistant pane</p>}
        >
          <p>Main pane</p>
        </ResizableSidebar>
      </div>
    )

    const expanded = container.querySelector('[data-slot="resizable-sidebar-pane"]')
    expect(expanded).toHaveAttribute("data-state", "expanded")
    expect(expanded).toHaveClass("transition-[width]", "duration-200", "ease-linear")
    expect(expanded).not.toHaveAttribute("aria-hidden")
    expect(screen.getByText("Assistant pane")).toBeInTheDocument()
    expect(screen.getByRole("separator", { name: "Resize panel" })).toBeInTheDocument()

    rerender(
      <div className="flex h-96 w-[800px]">
        <ResizableSidebar
          id="assistant-split"
          side="right"
          collapsed
          sidebar={<p>Assistant pane</p>}
        >
          <p>Main pane</p>
        </ResizableSidebar>
      </div>
    )

    const collapsedPane = container.querySelector('[data-slot="resizable-sidebar-pane"]')
    expect(collapsedPane).toHaveAttribute("data-state", "collapsed")
    expect(collapsedPane).toHaveAttribute("aria-hidden", "true")
    expect(collapsedPane).toHaveStyle({ width: "0px" })
    expect(screen.queryByRole("separator", { name: "Resize panel" })).not.toBeInTheDocument()
  })
})
