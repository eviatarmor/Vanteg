import { getNodeType } from "./node-catalog"
import type { NodeKind, NodePort, PortColor } from "./types"

export const portColorValue: Record<PortColor, string> = {
  slate: "#64748b",
  teal: "#0f766e",
  sky: "#0284c7",
  amber: "#d97706",
  emerald: "#059669",
  rose: "#e11d48",
  violet: "#7c3aed",
  orange: "#ea580c",
}

function kindSourceColor(kind: NodeKind): PortColor {
  if (kind === "trigger") {
    return "teal"
  }
  if (kind === "logic") {
    return "amber"
  }
  return "sky"
}

function defaultPorts(kind: NodeKind): NodePort[] {
  const ports: NodePort[] = []
  if (kind !== "trigger") {
    ports.push({ id: "in", type: "target", label: "In", color: "slate" })
  }
  ports.push({
    id: "out",
    type: "source",
    label: "Out",
    color: kindSourceColor(kind),
  })
  return ports
}

export function getNodePorts(catalogId: string): NodePort[] {
  const kind = getNodeType(catalogId)?.kind ?? "action"

  switch (catalogId) {
    case "if":
      return [
        { id: "in", type: "target", label: "In", color: "slate" },
        { id: "true", type: "source", label: "True", color: "emerald" },
        { id: "false", type: "source", label: "False", color: "rose" },
      ]
    case "switch":
    case "paths":
      return [
        { id: "in", type: "target", label: "In", color: "slate" },
        { id: "a", type: "source", label: "A", color: "violet" },
        { id: "b", type: "source", label: "B", color: "sky" },
        { id: "default", type: "source", label: "Default", color: "amber" },
      ]
    case "filter":
      return [
        { id: "in", type: "target", label: "In", color: "slate" },
        { id: "pass", type: "source", label: "Pass", color: "emerald" },
        { id: "drop", type: "source", label: "Drop", color: "rose" },
      ]
    case "merge":
      return [
        { id: "a", type: "target", label: "A", color: "slate" },
        { id: "b", type: "target", label: "B", color: "slate" },
        { id: "out", type: "source", label: "Out", color: "sky" },
      ]
    case "loop":
      return [
        { id: "in", type: "target", label: "In", color: "slate" },
        { id: "each", type: "source", label: "Each", color: "sky" },
        { id: "done", type: "source", label: "Done", color: "amber" },
      ]
    default:
      return defaultPorts(kind)
  }
}
