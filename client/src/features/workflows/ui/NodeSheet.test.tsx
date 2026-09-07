import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { createFreezeNode } from "../model/create-node"
import { NodeSheet } from "./NodeSheet"

describe("NodeSheet", () => {
  it("opens from the right with the node fields", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createFreezeNode("webhook", { x: 0, y: 0 })

    render(<NodeSheet node={node} onClose={() => {}} onChange={onChange} />)

    expect(screen.getByRole("dialog", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Webhook" }))
    expect(screen.getByLabelText("Name")).toHaveValue("Webhook")
    expect(screen.getByLabelText("Path")).toBeInTheDocument()
    expect(screen.getByLabelText("Method")).toBeInTheDocument()
    expect(screen.getByLabelText("Method")).toHaveTextContent("POST")
    expect(screen.getByText("Ports")).toBeInTheDocument()
    expect(screen.getByLabelText("Notes")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "In" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Out" })).toBeInTheDocument()

    await user.type(screen.getByLabelText("Path"), "/hooks/test")
    expect(onChange).toHaveBeenCalled()
  })

  it("lets the user edit output variables that downstream nodes can consume", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createFreezeNode("webhook", { x: 0, y: 0 })

    render(<NodeSheet node={node} onClose={() => {}} onChange={onChange} />)

    await user.click(screen.getByRole("tab", { name: "Out" }))

    expect(screen.getByRole("columnheader", { name: /Key/ })).toBeInTheDocument()
    expect(screen.getByDisplayValue("body")).toBeInTheDocument()
  })
})

