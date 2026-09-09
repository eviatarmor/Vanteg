export type InboxDecision = "pending" | "approved" | "denied" | "always"

export type InboxKind = "agent" | "workflow" | "credential"

export interface InboxItem {
  id: string
  title: string
  body: string
  unread: boolean
  kind: InboxKind
  source: string
  policyKey: string
  status: InboxDecision
}

export type InboxAction = Exclude<InboxDecision, "pending">
