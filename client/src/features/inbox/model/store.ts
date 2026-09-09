import { useSyncExternalStore } from "react"

import type { InboxAction, InboxItem } from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function createSeed(): InboxItem[] {
  return [
    {
      id: "inbox-slack-message",
      title: "Send a Slack reply in #customers",
      body: "Support copilot wants to post: “We refunded order 1842 and emailed the receipt.”",
      unread: true,
      kind: "agent",
      source: "Support copilot",
      policyKey: "agent:agent-support:slack.postMessage",
      status: "pending",
    },
    {
      id: "inbox-credential",
      title: "Slack credential needs renewal",
      body: "Form intake will fail on the next Slack step unless this login is renewed.",
      unread: true,
      kind: "credential",
      source: "Slack",
      policyKey: "credential:slack:renew",
      status: "pending",
    },
    {
      id: "inbox-table-write",
      title: "Write 12 rows to production / public / users",
      body: "Form intake mapped a webhook payload onto the users table.",
      unread: true,
      kind: "workflow",
      source: "Form intake",
      policyKey: "workflow:form-intake:data.write:users",
      status: "pending",
    },
  ]
}

let items: InboxItem[] = createSeed()
let decideImpl: (
  id: string,
  action: InboxAction
) => Promise<InboxItem | undefined> = defaultDecide
/** Delay for the default async decide path (0 in prod mock; tests can override). */
let decideDelayMs = 0

async function defaultDecide(
  id: string,
  action: InboxAction
): Promise<InboxItem | undefined> {
  if (decideDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, decideDelayMs))
  } else {
    await Promise.resolve()
  }
  const current = items.find((item) => item.id === id)
  if (!current || current.status !== "pending") {
    return undefined
  }
  const next = { ...current, status: action, unread: false }
  items = items.map((item) => (item.id === id ? next : item))
  emit()
  return next
}

export function subscribeInbox(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getInboxSnapshot(): InboxItem[] {
  return items
}

export function listPendingInbox(): InboxItem[] {
  return items.filter((item) => item.status === "pending")
}

export function getPendingInboxCount(): number {
  return listPendingInbox().length
}

export function useInbox(): InboxItem[] {
  return useSyncExternalStore(subscribeInbox, getInboxSnapshot, getInboxSnapshot)
}

export function usePendingInbox(): InboxItem[] {
  const snapshot = useInbox()
  return snapshot.filter((item) => item.status === "pending")
}

export async function decideInbox(
  id: string,
  action: InboxAction
): Promise<InboxItem | undefined> {
  return decideImpl(id, action)
}

/** Test helper: replace the decide implementation (e.g. to force failure). */
export function setDecideInboxImpl(
  impl: (id: string, action: InboxAction) => Promise<InboxItem | undefined>
) {
  decideImpl = impl
}

export function setDecideInboxDelay(ms: number) {
  decideDelayMs = ms
}

export function resetInbox(): void {
  items = createSeed()
  decideImpl = defaultDecide
  decideDelayMs = 0
  emit()
}
