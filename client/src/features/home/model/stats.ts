import { getAgentSnapshot } from "@/features/agents/model/store"
import { getPendingInboxCount } from "@/features/inbox/model/store"
import { getTeamSnapshot } from "@/features/teams/model/store"
import { listWorkflows } from "@/features/workflows/model/store"

export interface HomeStat {
  id: string
  label: string
  value: string
  trend: "up" | "down" | "neutral"
  trendLabel: string
  description: string
  indicator: "success" | "info" | "warning" | "default"
}

export function getHomeStats(): HomeStat[] {
  const waiting = getPendingInboxCount()
  const agents = getAgentSnapshot().length
  const workflows = listWorkflows().length
  const teams = getTeamSnapshot().length

  return [
    {
      id: "waiting",
      label: "Waiting on you",
      value: String(waiting),
      trend: waiting > 0 ? "neutral" : "down",
      trendLabel: waiting > 0 ? "Open Inbox to decide" : "Nothing pending",
      description: "Agent and workflow approvals",
      indicator: waiting > 0 ? "warning" : "success",
    },
    {
      id: "runs",
      label: "Runs this week",
      value: "18",
      trend: "up",
      trendLabel: "+12% vs last week",
      description: "Workflow executions across the workspace",
      indicator: "success",
    },
    {
      id: "agents",
      label: "Agents",
      value: String(agents),
      trend: "neutral",
      trendLabel: `${teams} team${teams === 1 ? "" : "s"} using them`,
      description: "Personalized agents in this workspace",
      indicator: "info",
    },
    {
      id: "workflows",
      label: "Workflows",
      value: String(workflows),
      trend: workflows > 0 ? "up" : "neutral",
      trendLabel: workflows > 0 ? "Includes drafts and production" : "Create your first automation",
      description: "Draft and deployed automations",
      indicator: "default",
    },
  ]
}
