import { beforeEach, describe, expect, it } from "vitest"

import { decideInbox, getPendingInboxCount, listPendingInbox, resetInbox } from "./store"

describe("inbox store", () => {
  beforeEach(() => {
    resetInbox()
  })

  it("seeds three pending approvals", () => {
    expect(listPendingInbox()).toHaveLength(3)
    expect(getPendingInboxCount()).toBe(3)
  })

  it("always-approve marks the item and hides it from pending", async () => {
    const item = listPendingInbox()[0]!
    const next = await decideInbox(item.id, "always")

    expect(next?.status).toBe("always")
    expect(listPendingInbox().some((pending) => pending.id === item.id)).toBe(false)
    expect(getPendingInboxCount()).toBe(2)
  })
})
