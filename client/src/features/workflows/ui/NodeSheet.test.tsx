import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { createVantegNode } from "../model/create-node"
import { NodeSheet } from "./NodeSheet"

describe("NodeSheet", () => {
  it("opens from the right with the node fields", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("webhook", { x: 0, y: 0 })

    render(<NodeSheet node={node} onClose={() => {}} onChange={onChange} />)

    expect(screen.getByRole("dialog", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toHaveClass(
      "sm:max-w-4xl",
      "data-[side=right]:sm:max-w-4xl"
    )
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

  it("shows outgoing variables as a read-only explorer tree", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("webhook", { x: 0, y: 0 })

    render(<NodeSheet node={node} onClose={() => {}} onChange={onChange} />)

    await user.click(screen.getByRole("tab", { name: "Out" }))

    const tree = screen.getByRole("tree", { name: "Out" })
    expect(tree).toHaveAttribute("aria-readonly", "true")
    expect(screen.getByRole("treeitem", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
    expect(tree.querySelector(".lucide-braces")).toBeInTheDocument()
    expect(tree.querySelector(".lucide-folder-open, .lucide-folder")).toBeInTheDocument()
    expect(screen.getByText("{{Webhook.body}}")).toBeInTheDocument()
  })

  it("groups incoming variables under previous nodes", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    const slack = createVantegNode("slack", { x: 80, y: 0 })

    render(
      <NodeSheet
        node={slack}
        nodes={[webhook, slack]}
        edges={[{ id: "e1", source: webhook.id, target: slack.id }]}
        onClose={() => {}}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("tab", { name: "In" }))

    expect(screen.getByRole("tree", { name: "In" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
    expect(screen.getByText("{{Webhook.body}}")).toBeInTheDocument()
  })
})

