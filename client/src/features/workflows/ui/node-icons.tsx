import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BookOpen,
  ClipboardList,
  Clock,
  Code,
  Database,
  File,
  Filter,
  GitBranch,
  GitPullRequest,
  Globe,
  Grid3x3,
  Hash,
  Inbox,
  Merge,
  MessageCircle,
  Pencil,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Repeat,
  Reply,
  Rss,
  Send,
  Shuffle,
  Sparkles,
  Split,
  Table,
  Timer,
  Webhook,
} from "lucide-react"

const icons: Record<string, LucideIcon> = {
  manual: Play,
  webhook: Webhook,
  schedule: Clock,
  email: Inbox,
  form: ClipboardList,
  "app-event": Bell,
  rss: Rss,
  "inbound-call": PhoneIncoming,
  "outbound-call": PhoneOutgoing,
  http: Globe,
  "email-send": Send,
  notification: Bell,
  file: File,
  "respond-webhook": Reply,
  ai: Sparkles,
  slack: Hash,
  spreadsheet: Table,
  google: Table,
  database: Database,
  github: GitPullRequest,
  notion: BookOpen,
  airtable: Grid3x3,
  discord: MessageCircle,
  if: GitBranch,
  switch: Split,
  filter: Filter,
  delay: Timer,
  code: Code,
  set: Pencil,
  merge: Merge,
  loop: Repeat,
  transform: Shuffle,
}

export function NodeIcon({
  catalogId,
  className,
}: {
  catalogId: string
  className?: string
}) {
  const Icon =
    icons[catalogId] ??
    icons[catalogId.split("-")[0] ?? ""] ??
    Sparkles
  return <Icon className={className} />
}
