import {
  Bot,
  Brain,
  CircleHelp,
  Database,
  Home,
  Inbox,
  KeyRound,
  LayoutTemplate,
  Plug,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import type { NavIconId } from "./model/types"

export const navIcons: Record<NavIconId, LucideIcon> = {
  home: Home,
  inbox: Inbox,
  workflows: Workflow,
  agents: Bot,
  teams: Users,
  templates: LayoutTemplate,
  data: Database,
  memory: Brain,
  integrations: Plug,
  "api-keys": KeyRound,
  help: CircleHelp,
}
