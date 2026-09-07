import {
  Bot,
  Briefcase,
  ChartLine,
  Code,
  GraduationCap,
  Headset,
  Megaphone,
  PenLine,
  Search,
  Shield,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { getAgentIcon, type AgentIconId } from "../model/icons"

const icons: Record<AgentIconId, LucideIcon> = {
  bot: Bot,
  headset: Headset,
  search: Search,
  code: Code,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  shield: Shield,
  sparkles: Sparkles,
  "pen-line": PenLine,
  "chart-line": ChartLine,
  wrench: Wrench,
  megaphone: Megaphone,
}

export function AgentIcon({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  const Icon = icons[getAgentIcon(id).id]
  return <Icon aria-hidden className={cn("size-4", className)} />
}
