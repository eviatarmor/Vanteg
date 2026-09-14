import type { LucideIcon } from "lucide-react"

export interface MentionItem {
  kind: string
  id: string
  label: string
  description?: string
}

export interface MentionKindMeta {
  kind: string
  label: string
  icon: LucideIcon
}

export type MentionSegment =
  | { type: "text"; text: string }
  | { type: "mention"; item: MentionItem; uid: string }
