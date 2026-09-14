import {
  BookOpen,
  Bot,
  Braces,
  Brain,
  Database,
  Plug,
  Users,
  Workflow,
} from "lucide-react"

import type { MentionKindMeta } from "@/components/mention"

export const assistantMentionKinds: MentionKindMeta[] = [
  { kind: "agent", label: "Agents", icon: Bot },
  { kind: "team", label: "Teams", icon: Users },
  { kind: "workflow", label: "Workflows", icon: Workflow },
  { kind: "table", label: "Tables", icon: Database },
  { kind: "variable-group", label: "Variables", icon: Braces },
  { kind: "memory", label: "Memories", icon: Brain },
  { kind: "knowledge", label: "Knowledge", icon: BookOpen },
  { kind: "connector", label: "Connectors", icon: Plug },
]
