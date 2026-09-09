import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomCredential,
  resetIntegrationsStore,
} from "@/features/integrations/model/store"

import { createVantegNode } from "../model/create-node"
import { getNodeTypeForEditor } from "../model/auth-fields"
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

  it("renders Slack message as a textarea and unfurl as a switch", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("slack", { x: 0, y: 0 })

    renderSheet(node, onChange)

    expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA")
    expect(screen.getByRole("switch", { name: "Unfurl links" })).toBeChecked()
    expect(node.data.config.unfurlLinks).toBe("true")

    await user.click(screen.getByRole("switch", { name: "Unfurl links" }))
    expect(onChange).toHaveBeenCalledWith(
      node.id,
      expect.objectContaining({
        config: expect.objectContaining({ unfurlLinks: "false" }),
      })
    )
  })

  it("renders SecretInput for the webhook secret without type=password", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("webhook", { x: 0, y: 0 })

    renderSheet(node, onChange)

    const secret = screen.getByLabelText("Secret")
    expect(secret).not.toHaveAttribute("type", "password")
    expect(secret.tagName).toBe("INPUT")
    expect(screen.getByLabelText("Path")).toBeInTheDocument()
    expect(screen.getByLabelText("Method")).toHaveTextContent("POST")

    await user.type(secret, "ab")
    expect(onChange).toHaveBeenCalledWith(
      node.id,
      expect.objectContaining({
        config: expect.objectContaining({ secret: expect.any(String) }),
      })
    )
  })

  it("renders Microsoft Teams message as a textarea", () => {
    const node = createVantegNode("microsoft-teams", { x: 0, y: 0 })

    renderSheet(node)

    expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Team")).toBeInTheDocument()
    expect(screen.getByLabelText("Channel")).toBeInTheDocument()
  })

  it("renders emoji as a select for Slack reactions", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("slack-add-reaction", { x: 0, y: 0 })

    renderSheet(node, onChange)

    expect(screen.getByLabelText("Emoji")).toHaveTextContent(":eyes:")
    await user.click(screen.getByLabelText("Emoji"))
    await user.click(screen.getByRole("option", { name: ":thumbsup:" }))
    expect(onChange).toHaveBeenCalledWith(
      node.id,
      expect.objectContaining({
        config: expect.objectContaining({ emoji: "thumbsup" }),
      })
    )
  })

  it("shows HTTP Request query, timeout, and credential fields", () => {
    const node = createVantegNode("http", { x: 0, y: 0 })

    renderSheet(node)

    expect(screen.getByLabelText("Query").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Timeout (ms)")).toBeInTheDocument()
    expect(screen.getByLabelText("Bearer token / API key")).toBeInTheDocument()
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
    expect(getNodeTypeForEditor("http")?.fields.some((field) => field.key === "credentialId")).toBe(
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

  it("clears the inline token from the patch when a credential is selected", async () => {
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
    node.data.config.token = "pasted-secret"

    const { onChange } = renderSheet(node)
    await user.click(screen.getByRole("combobox", { name: "Credential" }))
    await user.click(screen.getByRole("option", { name: /API bearer/i }))

    const last = onChange.mock.calls.at(-1)
    expect(last?.[1]?.config?.credentialId).toBe(created.data.id)
    expect(last?.[1]?.config?.token).toBeUndefined()
  })

  it("renders Code/Transform/Set/Merge/Loop Setup field controls", () => {
    const code = createVantegNode("code", { x: 0, y: 0 })
    const { unmount: unmountCode } = renderSheet(code)
    expect(screen.getByLabelText("Language")).toHaveTextContent("JavaScript")
    expect(screen.getByRole("textbox", { name: "Code" }).tagName).toBe("TEXTAREA")
    unmountCode()

    const set = createVantegNode("set", { x: 0, y: 0 })
    const { unmount: unmountSet } = renderSheet(set)
    expect(screen.getByLabelText("Mapping").tagName).toBe("TEXTAREA")
    unmountSet()

    const merge = createVantegNode("merge", { x: 0, y: 0 })
    const { unmount: unmountMerge } = renderSheet(merge)
    expect(screen.getByLabelText("Mode")).toHaveTextContent("Append")
    unmountMerge()

    const loop = createVantegNode("loop", { x: 0, y: 0 })
    const { unmount: unmountLoop } = renderSheet(loop)
    expect(screen.getByLabelText("Items").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Concurrency")).toBeInTheDocument()
    unmountLoop()

    const transform = createVantegNode("transform", { x: 0, y: 0 })
    renderSheet(transform)
    expect(screen.getByLabelText("Expression").tagName).toBe("TEXTAREA")
  })

  it("renders If/Switch/Filter/Delay Setup field controls", () => {
    const ifNode = createVantegNode("if", { x: 0, y: 0 })
    const { unmount: unmountIf } = renderSheet(ifNode)
    expect(screen.getByLabelText("Condition").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Operator")).toHaveTextContent("Equals")
    unmountIf()

    const filter = createVantegNode("filter", { x: 0, y: 0 })
    const { unmount: unmountFilter } = renderSheet(filter)
    expect(screen.getByLabelText("Condition").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Operator")).toHaveTextContent("Greater than")
    unmountFilter()

    const sw = createVantegNode("switch", { x: 0, y: 0 })
    const { unmount: unmountSwitch } = renderSheet(sw)
    expect(screen.getByLabelText("Expression")).toBeInTheDocument()
    expect(screen.getByLabelText("Cases").tagName).toBe("TEXTAREA")
    unmountSwitch()

    const delay = createVantegNode("delay", { x: 0, y: 0 })
    renderSheet(delay)
    expect(screen.getByLabelText("Duration")).toBeInTheDocument()
    expect(screen.getByLabelText("Unit")).toHaveTextContent("Minutes")
    expect(screen.getByLabelText("Until")).toBeInTheDocument()
  })

  it("shows the inline secret again when the saved credential is gone", async () => {
    const node = createVantegNode("http", { x: 0, y: 0 })
    node.data.config.credentialId = "cred_deleted"
    node.data.config.token = "still-here"

    renderSheet(node)

    expect(screen.getByTestId("credential-picker-missing")).toBeInTheDocument()
    expect(screen.getByLabelText("Bearer token / API key")).toBeInTheDocument()
  })

  it("renders Schedule cron textarea and timezone select", () => {
    const node = createVantegNode("schedule", { x: 0, y: 0 })
    renderSheet(node)

    expect(screen.getByLabelText("Cron expression").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Timezone")).toHaveTextContent("UTC")
    expect(node.data.config.timezone).toBe("UTC")
  })

  it("renders Poll URL and RSS interval selects", () => {
    const poll = createVantegNode("http-poll", { x: 0, y: 0 })
    const { unmount } = renderSheet(poll)
    expect(screen.getByLabelText("URL")).toBeInTheDocument()
    expect(screen.getByLabelText("Interval")).toHaveTextContent("Every 5 minutes")
    expect(poll.data.config.interval).toBe("5m")
    unmount()

    const rss = createVantegNode("rss", { x: 0, y: 0 })
    renderSheet(rss)
    expect(screen.getByLabelText("Feed URL")).toBeInTheDocument()
    expect(screen.getByLabelText("Interval")).toHaveTextContent("Every 15 minutes")
    expect(rss.data.config.interval).toBe("15m")
  })

  it("keeps Manual setup minimal with a clear empty state", () => {
    const node = createVantegNode("manual", { x: 0, y: 0 })
    renderSheet(node)

    expect(screen.getByRole("dialog", { name: "Manual" })).toBeInTheDocument()
    expect(screen.getByText(/no extra settings/i)).toBeInTheDocument()
    expect(screen.queryByText("Configuration")).not.toBeInTheDocument()
  })

  it("renders Notification/File/Respond-webhook Setup field controls", () => {
    const notification = createVantegNode("notification", { x: 0, y: 0 })
    const { unmount: unmountNotification } = renderSheet(notification)
    expect(screen.getByLabelText("Channel")).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Severity")).toHaveTextContent("Info")
    unmountNotification()

    const file = createVantegNode("file", { x: 0, y: 0 })
    const { unmount: unmountFile } = renderSheet(file)
    expect(screen.getByLabelText("Path")).toBeInTheDocument()
    expect(screen.getByLabelText("Operation")).toHaveTextContent("Read")
    expect(screen.getByLabelText("Content").tagName).toBe("TEXTAREA")
    unmountFile()

    const respond = createVantegNode("respond-webhook", { x: 0, y: 0 })
    renderSheet(respond)
    expect(screen.getByLabelText("Status")).toHaveTextContent("200 OK")
    expect(screen.getByRole("textbox", { name: "Body" }).tagName).toBe("TEXTAREA")
    expect(screen.getByRole("textbox", { name: "Headers" }).tagName).toBe("TEXTAREA")
  })

  it("renders GitHub Repository as a resource-select combobox", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("github", { x: 0, y: 0 })

    renderSheet(node, onChange)

    const repo = await screen.findByRole("combobox", { name: "Repository" })
    expect(repo).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: "Repository" })).not.toBeInTheDocument()
    expect(screen.getByLabelText("Action")).toBeInTheDocument()

    await user.click(repo)
    expect(await screen.findByRole("option", { name: "acme/api" })).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "acme/api" }))
    expect(onChange).toHaveBeenCalled()
    const patch = onChange.mock.calls.at(-1)?.[1]
    expect(patch?.config?.repo).toBe("acme/api")
  })

  it("renders Slack Channel as a resource-select combobox", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const node = createVantegNode("slack", { x: 0, y: 0 })

    renderSheet(node, onChange)

    const channel = await screen.findByRole("combobox", { name: "Channel" })
    expect(channel).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: "Channel" })).not.toBeInTheDocument()

    await user.click(channel)
    expect(await screen.findByText("#ops - Operations")).toBeInTheDocument()
    await user.click(screen.getByText("#ops - Operations"))
    expect(onChange).toHaveBeenCalled()
    const patch = onChange.mock.calls.at(-1)?.[1]
    expect(patch?.config?.channel).toBe("#ops")
  })

  it("renders number and datetime FieldControls", () => {
    const onChange = vi.fn()
    const charge = createVantegNode("stripe-create-charge", { x: 0, y: 0 })
    const { unmount } = renderSheet(charge, onChange)

    const amount = screen.getByLabelText("Amount")
    expect(amount).toHaveAttribute("type", "number")
    fireEvent.change(amount, { target: { value: "2500" } })
    expect(onChange).toHaveBeenCalledWith(
      charge.id,
      expect.objectContaining({ config: expect.objectContaining({ amount: "2500" }) })
    )
    unmount()

    const delay = createVantegNode("delay", { x: 40, y: 0 })
    renderSheet(delay, onChange)
    const until = screen.getByLabelText("Until")
    expect(until).toHaveAttribute("type", "datetime-local")
    fireEvent.change(until, { target: { value: "2026-09-08T09:00" } })
    expect(onChange).toHaveBeenCalledWith(
      delay.id,
      expect.objectContaining({
        config: expect.objectContaining({ until: "2026-09-08T09:00" }),
      })
    )
  })

  it("renders calendar Start as datetime-local", () => {
    const node = createVantegNode("google-calendar-create-event", { x: 0, y: 0 })
    renderSheet(node)
    expect(screen.getByLabelText("Start")).toHaveAttribute("type", "datetime-local")
  })

  it("shows the Test webhook panel for webhook trigger nodes", () => {
    const node = createVantegNode("webhook", { x: 0, y: 0 })
    renderSheet(node)

    expect(screen.getByRole("heading", { name: "Test webhook" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send test" })).toBeInTheDocument()
    expect(screen.getByLabelText("Signing secret")).toBeInTheDocument()
    expect(screen.getByText("POST /hooks/vanteg")).toBeInTheDocument()
  })

  it("hides the Test webhook panel for non-webhook nodes", () => {
    const node = createVantegNode("manual", { x: 0, y: 0 })
    renderSheet(node)

    expect(screen.queryByRole("heading", { name: "Test webhook" })).not.toBeInTheDocument()
  })
})
