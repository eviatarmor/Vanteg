import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"
import { Switch } from "@workspace/ui/components/switch"

import {
  buildExportPayload,
  completeDataExport,
  failDataExport,
  requestDataExport,
  type ComplianceState,
} from "../model/compliance"
import { type SettingsPreferences } from "../model/preferences"

import {
  SettingsContent,
  SettingsDescription,
  SettingsFooter,
  SettingsHeader,
  SettingsLayout,
  SettingsSection,
  SettingsTitle,
} from "./SettingsLayout"

type PrivacyPanelProps = {
  preferences: SettingsPreferences
  compliance: ComplianceState
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
  onCompliance: (next: ComplianceState, message?: string) => void
}

export function PrivacyPanel({
  preferences,
  compliance,
  onPatch,
  onCompliance,
}: PrivacyPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  function startExport() {
    const pending = requestDataExport(compliance)
    onCompliance(pending, "Data export requested.")
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      onCompliance(completeDataExport(pending), "Export is ready to download.")
    }, 600)
  }

  function downloadExport() {
    try {
      const payload = buildExportPayload(compliance)
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "vanteg-data-export.json"
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success("Download started.")
    } catch {
      onCompliance(failDataExport(compliance), "Could not prepare export file.")
    }
  }

  return (
    <>
      <SettingsLayout>
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Data export</SettingsTitle>
            <SettingsDescription>
              Request a JSON package of mock workspace data (GDPR-style access).
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent className="grid gap-3">
            {compliance.exportStatus === "idle" ? (
              <p className="text-sm text-muted-foreground">
                No export in progress. Requests stay in this browser only.
              </p>
            ) : null}
            {compliance.exportStatus === "pending" ? (
              <div className="flex items-center gap-2 text-sm" role="status">
                <Spinner />
                Preparing your export…
              </div>
            ) : null}
            {compliance.exportStatus === "ready" ? (
              <p className="text-sm text-muted-foreground" role="status">
                Export ready
                {compliance.exportReadyAt
                  ? ` · ${new Date(compliance.exportReadyAt).toLocaleString()}`
                  : ""}
              </p>
            ) : null}
            {compliance.exportStatus === "error" ? (
              <p className="text-sm text-destructive" role="alert">
                {compliance.exportError ?? "Export failed."}
              </p>
            ) : null}
          </SettingsContent>
          <SettingsFooter>
            {compliance.exportStatus === "ready" ? (
              <Button type="button" onClick={downloadExport}>
                <Download className="size-4" aria-hidden />
                Download JSON
              </Button>
            ) : (
              <Button
                type="button"
                disabled={compliance.exportStatus === "pending"}
                onClick={startExport}
              >
                Request export
              </Button>
            )}
          </SettingsFooter>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Consent</SettingsTitle>
            <SettingsDescription>
              Cookie and analytics preferences for this workspace demo.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="settings-cookie-consent">Cookie consent</Label>
                <p className="text-sm text-muted-foreground">
                  Allow essential and preference cookies.
                </p>
              </div>
              <Switch
                id="settings-cookie-consent"
                checked={preferences.cookieConsent}
                onCheckedChange={(checked) =>
                  onPatch(
                    { cookieConsent: checked },
                    "Consent preferences saved."
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="settings-analytics-consent">
                  Analytics consent
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anonymous product analytics to improve Vanteg.
                </p>
              </div>
              <Switch
                id="settings-analytics-consent"
                checked={preferences.analyticsConsent}
                onCheckedChange={(checked) =>
                  onPatch(
                    { analyticsConsent: checked },
                    "Consent preferences saved."
                  )
                }
              />
            </div>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Retention</SettingsTitle>
            <SettingsDescription>
              How long Vanteg keeps demo data.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Active workspace data is retained while the account is open.
              Soft-deleted records purge after 30 days. Audit logs retain for 12
              months for security investigations.
            </p>
            <p>
              This copy is informational for the mock Settings surface —
              production retention is defined in the customer DPA.
            </p>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Delete account</SettingsTitle>
            <SettingsDescription>
              Permanently remove this mock account from local storage.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent>
            {compliance.accountDeletionPending ? (
              <p className="text-sm text-destructive" role="status">
                Account deletion is pending. Sign out and contact support to
                finish (mock).
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This cannot be undone in the demo. Confirm before continuing.
              </p>
            )}
          </SettingsContent>
          <SettingsFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={compliance.accountDeletionPending}
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </SettingsFooter>
        </SettingsSection>
      </SettingsLayout>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This marks the mock account for deletion. Workflows, agents, and
              keys in this browser demo will become inaccessible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onCompliance(
                  { ...compliance, accountDeletionPending: true },
                  "Account deletion requested."
                )
                setDeleteOpen(false)
              }}
            >
              Confirm delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
