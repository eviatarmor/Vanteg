export const COMPLIANCE_STORAGE_KEY = "vanteg.settings.compliance"

export type PlanId = "free" | "pro"
export type ExportStatus = "idle" | "pending" | "ready" | "error"
export type PrivacyRequestType = "access" | "export" | "delete" | "rectify"
export type PrivacyRequestStatus = "queued" | "in_progress" | "completed" | "rejected"

export type BillingInvoice = {
  id: string
  date: string
  amount: string
  status: "paid" | "open" | "void"
}

export type SessionRow = {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export type AuditLogRow = {
  id: string
  at: string
  actor: string
  action: string
  target: string
}

export type PrivacyRequest = {
  id: string
  type: PrivacyRequestType
  status: PrivacyRequestStatus
  createdAt: string
  note: string
}

export type Subprocessor = {
  id: string
  name: string
  purpose: string
  region: string
}

export type ComplianceState = {
  plan: PlanId
  paymentLast4: string | null
  paymentBrand: string | null
  workflowsUsed: number
  workflowsLimit: number
  seatsUsed: number
  seatsLimit: number
  invoices: BillingInvoice[]
  exportStatus: ExportStatus
  exportRequestedAt: string | null
  exportReadyAt: string | null
  exportError: string | null
  accountDeletionPending: boolean
  sessions: SessionRow[]
  auditLog: AuditLogRow[]
  privacyRequests: PrivacyRequest[]
}

export const SUBPROCESSORS: Subprocessor[] = [
  {
    id: "vercel",
    name: "Vercel",
    purpose: "Application hosting and edge delivery",
    region: "US / EU",
  },
  {
    id: "neon",
    name: "Neon",
    purpose: "Managed Postgres for workspace data",
    region: "US",
  },
  {
    id: "resend",
    name: "Resend",
    purpose: "Transactional email delivery",
    region: "US",
  },
  {
    id: "stripe",
    name: "Stripe",
    purpose: "Billing and payment processing",
    region: "US / EU",
  },
]

export const DPA_HREF = "https://vanteg.app/legal/dpa"
export const STATUS_PAGE_HREF = "https://status.vanteg.app"

function isoDaysAgo(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

export function defaultComplianceState(): ComplianceState {
  return {
    plan: "free",
    paymentLast4: "4242",
    paymentBrand: "Visa",
    workflowsUsed: 12,
    workflowsLimit: 25,
    seatsUsed: 2,
    seatsLimit: 5,
    invoices: [
      {
        id: "inv_2026_08",
        date: "2026-08-01",
        amount: "$0.00",
        status: "paid",
      },
      {
        id: "inv_2026_07",
        date: "2026-07-01",
        amount: "$0.00",
        status: "paid",
      },
    ],
    exportStatus: "idle",
    exportRequestedAt: null,
    exportReadyAt: null,
    exportError: null,
    accountDeletionPending: false,
    sessions: [
      {
        id: "sess_current",
        device: "Chrome on macOS",
        location: "Sydney, AU",
        lastActive: "Just now",
        current: true,
      },
      {
        id: "sess_laptop",
        device: "Safari on iPhone",
        location: "Sydney, AU",
        lastActive: "2 hours ago",
        current: false,
      },
      {
        id: "sess_office",
        device: "Firefox on Windows",
        location: "Melbourne, AU",
        lastActive: "3 days ago",
        current: false,
      },
    ],
    auditLog: [
      {
        id: "aud_1",
        at: isoDaysAgo(0),
        actor: "darren@vanteg.app",
        action: "settings.view",
        target: "Settings",
      },
      {
        id: "aud_2",
        at: isoDaysAgo(1),
        actor: "darren@vanteg.app",
        action: "integration.connect",
        target: "Slack",
      },
      {
        id: "aud_3",
        at: isoDaysAgo(3),
        actor: "system",
        action: "billing.invoice",
        target: "inv_2026_08",
      },
      {
        id: "aud_4",
        at: isoDaysAgo(5),
        actor: "darren@vanteg.app",
        action: "api_key.create",
        target: "Production key",
      },
    ],
    privacyRequests: [
      {
        id: "pr_seed_access",
        type: "access",
        status: "completed",
        createdAt: isoDaysAgo(14),
        note: "Access package emailed.",
      },
    ],
  }
}

function isPlan(value: unknown): value is PlanId {
  return value === "free" || value === "pro"
}

function isExportStatus(value: unknown): value is ExportStatus {
  return (
    value === "idle" ||
    value === "pending" ||
    value === "ready" ||
    value === "error"
  )
}

export function loadCompliance(): ComplianceState {
  if (typeof window === "undefined") {
    return defaultComplianceState()
  }

  try {
    const raw = window.localStorage.getItem(COMPLIANCE_STORAGE_KEY)
    if (!raw) {
      return defaultComplianceState()
    }
    const parsed = JSON.parse(raw) as Partial<ComplianceState>
    const defaults = defaultComplianceState()
    return {
      ...defaults,
      ...parsed,
      plan: isPlan(parsed.plan) ? parsed.plan : defaults.plan,
      exportStatus: isExportStatus(parsed.exportStatus)
        ? parsed.exportStatus
        : defaults.exportStatus,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : defaults.invoices,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : defaults.sessions,
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : defaults.auditLog,
      privacyRequests: Array.isArray(parsed.privacyRequests)
        ? parsed.privacyRequests
        : defaults.privacyRequests,
    }
  } catch {
    return defaultComplianceState()
  }
}

export function saveCompliance(next: ComplianceState): void {
  window.localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(next))
}

export function resetCompliance(): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(COMPLIANCE_STORAGE_KEY)
}

export function buildExportPayload(state: ComplianceState): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    plan: state.plan,
    sessions: state.sessions.map((session) => ({
      id: session.id,
      device: session.device,
      location: session.location,
    })),
    privacyRequests: state.privacyRequests,
    note: "Mock Vanteg data export for compliance demos.",
  }
}

export function requestDataExport(state: ComplianceState): ComplianceState {
  return {
    ...state,
    exportStatus: "pending",
    exportRequestedAt: new Date().toISOString(),
    exportReadyAt: null,
    exportError: null,
  }
}

export function completeDataExport(state: ComplianceState): ComplianceState {
  return {
    ...state,
    exportStatus: "ready",
    exportReadyAt: new Date().toISOString(),
    exportError: null,
  }
}

export function failDataExport(
  state: ComplianceState,
  message = "Export failed. Try again."
): ComplianceState {
  return {
    ...state,
    exportStatus: "error",
    exportError: message,
  }
}

export function upgradePlan(state: ComplianceState): ComplianceState {
  return {
    ...state,
    plan: "pro",
    workflowsLimit: 500,
    seatsLimit: 25,
    invoices: [
      {
        id: `inv_pro_${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        amount: "$49.00",
        status: "open",
      },
      ...state.invoices,
    ],
  }
}

export function updatePaymentMethod(
  state: ComplianceState,
  last4: string,
  brand = "Visa"
): ComplianceState {
  const digits = last4.replace(/\D/g, "").slice(-4)
  return {
    ...state,
    paymentLast4: digits.length === 4 ? digits : state.paymentLast4,
    paymentBrand: brand,
  }
}

export function signOutOtherSessions(state: ComplianceState): ComplianceState {
  return {
    ...state,
    sessions: state.sessions.filter((session) => session.current),
  }
}

export function queuePrivacyRequest(
  state: ComplianceState,
  type: PrivacyRequestType
): ComplianceState {
  const labels: Record<PrivacyRequestType, string> = {
    access: "Access request queued.",
    export: "Export request queued.",
    delete: "Deletion request queued.",
    rectify: "Rectification request queued.",
  }
  const request: PrivacyRequest = {
    id: `pr_${type}_${Date.now()}`,
    type,
    status: "queued",
    createdAt: new Date().toISOString(),
    note: labels[type],
  }
  return {
    ...state,
    privacyRequests: [request, ...state.privacyRequests],
  }
}

export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0
  }
  return Math.min(100, Math.round((used / limit) * 100))
}
