import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomCredential,
  resetIntegrationsStore,
} from "@/features/integrations/model/store"

import { createVantegNode } from "../model/create-node"
import { getNodeType } from "../model/node-catalog"
import type { VantegEdge, VantegNode } from "../model/types"
import { NodeSheet } from "./NodeSheet"

function renderSheet(
  node: VantegNode,
  onChange = vi.fn(),
  extra: { nodes?: VantegNode[]; edges?: VantegEdge[] } = {}
) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <NodeSheet
            node={node}
            nodes={extra.nodes}
            edges={extra.edges}
            onClose={() => {}}
            onChange={onChange}
          />
        ),
      },
      { path: "/integrations", element: <div>Integrations</div> },
    ],
    { initialEntries: ["/"] }
  )
  return { onChange, ...render(<RouterProvider router={router} />) }
}

describe("NodeSheet", () => {
  beforeEach(() => {
    resetIntegrationsStore()
  })

  it("opens from the right with the node fields", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("webhook", { x: 0, y: 0 })

    renderSheet(node, onChange)

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

    renderSheet(node, onChange)

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

    renderSheet(slack, onChange, {
      nodes: [webhook, slack],
      edges: [{ id: "e1", source: webhook.id, target: slack.id }],
    })

    await user.click(screen.getByRole("tab", { name: "In" }))

    expect(screen.getByRole("tree", { name: "In" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: "Webhook" })).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
    expect(screen.getByText("{{Webhook.body}}")).toBeInTheDocument()
  })

  it("lets HTTP Request pick a custom credential and hides the inline secret", async () => {
    const user = userEvent.setup()
    const created = await createCustomCredential({
      name: "API bearer",
      kind: "bearer",
      fields: { token: "tok_abc" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }

    const node = createVantegNode("http", { x: 0, y: 0 })
    expect(getNodeType("http")?.fields.some((field) => field.key === "credentialId")).toBe(
      true
    )

    const first = renderSheet(node)

    expect(screen.getByLabelText("Bearer token / API key")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Credential" })).toBeInTheDocument()

    await user.click(screen.getByRole("combobox", { name: "Credential" }))
    await user.click(screen.getByRole("option", { name: /API bearer/i }))

    expect(first.onChange).toHaveBeenCalled()
    const last = first.onChange.mock.calls.at(-1)
    expect(last?.[0]).toBe(node.id)
    expect(last?.[1]?.config?.credentialId).toBe(created.data.id)

    first.unmount()

    const selected: VantegNode = {
      ...node,
      data: {
        ...node.data,
        config: { ...node.data.config, credentialId: created.data.id },
      },
    }
    renderSheet(selected)
    expect(screen.getByTestId("credential-picker-using")).toHaveTextContent(
      "Using credential: API bearer"
    )
    expect(screen.queryByLabelText("Bearer token / API key")).not.toBeInTheDocument()
  })

  it("persists credentialId on the node config model", async () => {
    const created = await createCustomCredential({
      name: "Keep me",
      kind: "api-key",
      fields: { apiKey: "sk" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }
    const node = createVantegNode("http", { x: 0, y: 0 })
    node.data.config.credentialId = created.data.id

    renderSheet(node)
    expect(screen.getByTestId("credential-picker-using")).toHaveTextContent(
      "Using credential: Keep me"
    )
  })
})
