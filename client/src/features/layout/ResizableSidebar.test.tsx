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
})
