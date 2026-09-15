import { getNodeType } from "./node-catalog"
import { parseRoutes } from "./structured-fields"
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

const ROUTE_COLORS: PortColor[] = ["violet", "sky", "emerald", "orange", "teal"]

export function getNodePorts(
  catalogId: string,
  config: Record<string, string> = {}
): NodePort[] {
  const catalog = getNodeType(catalogId)
  const kind = catalog?.kind ?? "action"
  const declared = catalog?.ports
  const dynamic = catalog?.dynamicPorts

  let ports: NodePort[]
  if (dynamic) {
    const targets =
      declared?.filter((port) => port.type === "target") ??
      (kind === "trigger"
        ? []
        : [{ id: "in", type: "target" as const, label: "In", color: "slate" as const }])
    const routes = parseRoutes(config[dynamic.fieldKey])
    const routePorts: NodePort[] = routes.map((route, index) => ({
      id: route.id,
      type: dynamic.type,
      label: route.name || `Route ${index + 1}`,
      color: dynamic.color ?? ROUTE_COLORS[index % ROUTE_COLORS.length]!,
    }))
    const fallback =
      routePorts.length > 0
        ? routePorts
        : dynamic.fallbackPorts
    const extra = declared?.filter(
      (port) => port.type !== "target" && !fallback.some((item) => item.id === port.id)
    )
    ports = [...targets, ...fallback, ...(extra ?? [])]
  } else if (declared?.length) {
    ports = [...declared]
  } else {
    ports = defaultPorts(kind)
  }

  if (config.errorOutput === "true" && !ports.some((port) => port.id === "error")) {
    ports.push({
      id: "error",
      type: "source",
      label: "Error",
      color: "rose",
    })
  }

  return ports
}
