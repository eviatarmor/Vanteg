export interface InboxItem {
  id: string
  title: string
  body: string
  unread: boolean
}

export const inboxItems: InboxItem[] = [
  {
    id: "inbox-run-failed",
    title: "Run failed",
    body: "A workflow run stopped on HTTP Request.",
    unread: true,
  },
  {
    id: "inbox-credential",
    title: "Credential needs attention",
    body: "Slack login should be renewed.",
    unread: true,
  },
  {
    id: "inbox-webhook",
    title: "Webhook delivery",
    body: "New inbound request on Form intake.",
    unread: true,
  },
]
