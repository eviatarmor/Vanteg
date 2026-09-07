import { describe, expect, it } from "vitest"

import { getNodePorts } from "./node-ports"

describe("node ports", () => {
  it("gives If true and false outputs", () => {
    expect(getNodePorts("if").map((port) => port.id)).toEqual(["in", "true", "false"])
  })

  it("gives Merge two inputs", () => {
    const ports = getNodePorts("merge")
    expect(ports.filter((port) => port.type === "target")).toHaveLength(2)
  })

  it("gives triggers an outbound port only", () => {
    const ports = getNodePorts("inbound-call")
    expect(ports.every((port) => port.type === "source")).toBe(true)
  })
})
