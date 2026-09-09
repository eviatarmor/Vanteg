import { beforeEach, describe, expect, it } from "vitest"

import {
  completeDataExport,
  defaultComplianceState,
  loadCompliance,
  queuePrivacyRequest,
  requestDataExport,
  resetCompliance,
  saveCompliance,
  signOutOtherSessions,
  upgradePlan,
  usagePercent,
} from "./compliance"

describe("settings compliance", () => {
  beforeEach(() => {
    resetCompliance()
  })

  it("defaults to free plan with mock sessions and invoices", () => {
    const state = defaultComplianceState()
    expect(state.plan).toBe("free")
    expect(state.sessions.length).toBeGreaterThan(0)
    expect(state.invoices.length).toBeGreaterThan(0)
  })

  it("persists upgrades and export status", () => {
    const upgraded = upgradePlan(defaultComplianceState())
    saveCompliance(upgraded)
    expect(loadCompliance().plan).toBe("pro")

    const pending = requestDataExport(upgraded)
    const ready = completeDataExport(pending)
    expect(ready.exportStatus).toBe("ready")
  })

  it("queues privacy requests and signs out other sessions", () => {
    const withRequest = queuePrivacyRequest(defaultComplianceState(), "delete")
    expect(withRequest.privacyRequests[0]?.type).toBe("delete")
    expect(withRequest.privacyRequests[0]?.status).toBe("queued")

    const signedOut = signOutOtherSessions(withRequest)
    expect(signedOut.sessions.every((session) => session.current)).toBe(true)
  })

  it("computes usage percent safely", () => {
    expect(usagePercent(12, 25)).toBe(48)
    expect(usagePercent(10, 0)).toBe(0)
    expect(usagePercent(100, 50)).toBe(100)
  })
})
