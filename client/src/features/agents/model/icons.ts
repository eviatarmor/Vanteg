export const agentIcons = [
  { id: "bot", label: "Agent" },
  { id: "headset", label: "Support" },
  { id: "search", label: "Research" },
  { id: "code", label: "Engineering" },
  { id: "briefcase", label: "Lead" },
  { id: "graduation-cap", label: "Junior" },
  { id: "shield", label: "Review" },
  { id: "sparkles", label: "Creative" },
  { id: "pen-line", label: "Writer" },
  { id: "chart-line", label: "Analytics" },
  { id: "wrench", label: "Ops" },
  { id: "megaphone", label: "Comms" },
] as const

export type AgentIconId = (typeof agentIcons)[number]["id"]

export function getAgentIcon(id: string): (typeof agentIcons)[number] {
  return agentIcons.find((icon) => icon.id === id) ?? agentIcons[0]
}
