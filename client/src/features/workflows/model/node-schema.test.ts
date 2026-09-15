import { describe, expect, it } from "vitest"

import { isSecretSetupKey } from "@workspace/integrations"

import { createVantegNode } from "./create-node"
import { listFeaturedMethods } from "@workspace/integrations"
import { getNodeType, listNodeTypes } from "./node-catalog"
import { defaultNodeIo } from "./node-io"
import { getNodePorts } from "./node-ports"
import { resolveOutputSchema } from "./infer-output-schema"
import { parseRoutes, serializeRoutes } from "./structured-fields"
import { normalizeWorkflowNode } from "./workflow-migrate"

const GENERIC = new Set(["payload", "result"])

describe("workflow node schema completeness", () => {
  it("declares outputs for every catalog node and never leaks setup secrets", () => {
    const nodes = listNodeTypes()
    expect(nodes.length).toBeGreaterThan(40)
    for (const node of nodes) {
      expect(node.outputs.length, `${node.id} outputs`).toBeGreaterThan(0)
      const keys = node.outputs.map((field) => field.key)
      expect(new Set(keys).size, `${node.id} unique outputs`).toBe(keys.length)
      for (const field of node.outputs) {
        expect(field.label, `${node.id}.${field.key}`).toBeTruthy()
        expect(field.type, `${node.id}.${field.key}`).toBeTruthy()
        expect(isSecretSetupKey(field.key), `${node.id} secret output ${field.key}`).toBe(false)
      }
      for (const field of node.fields) {
        if (field.secret || field.sensitive || isSecretSetupKey(field.key)) {
          expect(keys, `${node.id} leaked ${field.key}`).not.toContain(field.key)
        }
      }
      const onlyGeneric = keys.every((key) => GENERIC.has(key) || key === "ok")
      if (node.id !== "manual" && node.id !== "code") {
        expect(onlyGeneric, `${node.id} undifferentiated payload/result`).toBe(false)
      }
    }
  })

  it("covers every featured integration method in the workflow catalog", () => {
    const catalogIds = new Set(listNodeTypes().map((node) => node.id))
    for (const method of listFeaturedMethods()) {
      expect(catalogIds.has(method.id), method.id).toBe(true)
      expect(getNodeType(method.id)?.outputs.length, method.id).toBeGreaterThan(0)
    }
  })

  it("does not infer webhook outputs from the signing secret", () => {
    const io = defaultNodeIo("webhook")
    expect(io.outVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["body", "rawBody", "headers", "query", "method", "path"])
    )
    expect(io.outVars.map((item) => item.key)).not.toContain("secret")
    expect(io.outVars.map((item) => item.key)).not.toContain("credentialId")
    expect(getNodeType("webhook")?.fields.find((field) => field.key === "secret")?.secret).toBe(
      true
    )
  })

  it("keeps Switch route port ids stable when the label changes", () => {
    const routes = parseRoutes(
      serializeRoutes([
        { id: "won_id", name: "Won", value: "won" },
        { id: "lost_id", name: "Lost", value: "lost" },
      ])
    )
    const renamed = routes.map((row) =>
      row.id === "won_id" ? { ...row, name: "Closed won" } : row
    )
    const ports = getNodePorts("switch", { routes: serializeRoutes(renamed) })
    expect(ports.map((port) => port.id)).toEqual(
      expect.arrayContaining(["in", "won_id", "lost_id", "default"])
    )
    expect(ports.find((port) => port.id === "won_id")?.label).toBe("Closed won")
  })

  it("merges inferred mapping/test schema onto declared outputs without dropping them", () => {
    const catalog = getNodeType("set")
    expect(catalog).toBeDefined()
    const resolved = resolveOutputSchema(
      catalog!,
      {
        mapping: JSON.stringify([
          { id: "1", op: "set", path: "fullName", value: "Ada", type: "string" },
        ]),
      },
      { fullName: "Ada", extra: 1 }
    )
    expect(resolved.map((field) => field.key)).toEqual(
      expect.arrayContaining(["data", "ok", "fullName", "extra"])
    )
  })

  it("migrates saved condition/operator and case maps", () => {
    const ifNode = createVantegNode("if", { x: 0, y: 0 })
    ifNode.data.config = { condition: "status", operator: "eq" }
    const migrated = normalizeWorkflowNode(ifNode, getNodeType("if"))
    expect(migrated.data.config.conditions).toContain("status")
    expect(migrated.data.outVars.map((item) => item.key)).toEqual(
      expect.arrayContaining(["item", "matched", "branch"])
    )

    const sw = createVantegNode("switch", { x: 0, y: 0 })
    sw.data.config = { cases: '{"open":"open","closed":"closed"}' }
    const next = normalizeWorkflowNode(sw, getNodeType("switch"))
    const ports = getNodePorts("switch", next.data.config)
    expect(ports.map((port) => port.id)).toEqual(
      expect.arrayContaining(["in", "a", "b", "default"])
    )
  })

  it("drops setup-field leftovers from outputs and keeps extra test data", () => {
    const webhook = createVantegNode("webhook", { x: 0, y: 0 })
    webhook.data.outVars = [
      { id: "1", key: "secret", value: "shh", secret: true },
      { id: "2", key: "body", value: '{"ok":true}' },
      { id: "3", key: "custom", value: "kept" },
      { id: "4", key: "cors", value: "true" },
    ]
    const migrated = normalizeWorkflowNode(webhook, getNodeType("webhook"))
    const keys = migrated.data.outVars.map((item) => item.key)
    expect(keys).toEqual(expect.arrayContaining(["body", "custom"]))
    expect(keys).not.toContain("secret")
    expect(keys).not.toContain("cors")
    expect(migrated.data.outVars.find((item) => item.key === "custom")?.value).toBe("kept")
  })

  it("resolves file and GitHub outputs from the selected operation", () => {
    const file = getNodeType("file")!
    expect(resolveOutputSchema(file, { operation: "list" }).map((field) => field.key)).toEqual(
      expect.arrayContaining(["entries", "count", "path"])
    )
    expect(resolveOutputSchema(file, { operation: "write" }).map((field) => field.key)).toEqual(
      expect.arrayContaining(["path", "ok"])
    )
    expect(resolveOutputSchema(file, { operation: "write" }).map((field) => field.key)).not.toContain(
      "content"
    )

    const github = getNodeType("github")!
    expect(
      resolveOutputSchema(github, { action: "create_comment" }).map((field) => field.key)
    ).toEqual(expect.arrayContaining(["id", "body", "user"]))
    expect(
      resolveOutputSchema(github, { action: "create_pull_request" }).map((field) => field.key)
    ).toEqual(expect.arrayContaining(["head", "base", "merged"]))
  })

  it("covers formatter type operations and list-style connector outputs", () => {
    const formatter = getNodeType("formatter")
    expect(formatter?.fields.map((field) => field.key)).toEqual(
      expect.arrayContaining(["booleanOp", "arrayOp", "objectOp", "encodingOp"])
    )
    expect(getNodeType("airtable-find-records")?.outputs.map((field) => field.key)).toEqual(
      expect.arrayContaining(["records", "count"])
    )
    expect(getNodeType("microsoft-teams-list-channels")?.outputs.map((field) => field.key)).toEqual(
      expect.arrayContaining(["channels", "count"])
    )
  })
})
