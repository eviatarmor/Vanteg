import { ExternalLink, Shield } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import {
  DPA_HREF,
  queuePrivacyRequest,
  SUBPROCESSORS,
  type ComplianceState,
  type PrivacyRequestType,
} from "../model/compliance"

import {
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsLayout,
  SettingsSection,
  SettingsTitle,
} from "./SettingsLayout"

type CompliancePanelProps = {
  compliance: ComplianceState
  onCompliance: (next: ComplianceState, message?: string) => void
}

const PRIVACY_TYPES: { type: PrivacyRequestType; label: string }[] = [
  { type: "access", label: "Access" },
  { type: "export", label: "Export" },
  { type: "delete", label: "Delete" },
  { type: "rectify", label: "Rectify" },
]

export function CompliancePanel({
  compliance,
  onCompliance,
}: CompliancePanelProps) {
  return (
    <SettingsLayout>
      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Data processing agreement</SettingsTitle>
          <SettingsDescription>
            Review the stub DPA covering controller / processor terms.
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent>
          <a
            href={DPA_HREF}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View DPA
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </SettingsContent>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Subprocessors</SettingsTitle>
          <SettingsDescription>
            Vendors that may process customer data on Vanteg&apos;s behalf.
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent>
          <ul className="divide-y divide-border rounded-lg border">
            {SUBPROCESSORS.map((vendor) => (
              <li key={vendor.id} className="grid gap-0.5 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{vendor.name}</span>
                  <Badge variant="outline">{vendor.region}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {vendor.purpose}
                </p>
              </li>
            ))}
          </ul>
        </SettingsContent>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Audit log</SettingsTitle>
          <SettingsDescription>
            Recent security-relevant events (mock).
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent>
          {compliance.auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border">
              {compliance.auditLog.map((row) => (
                <li key={row.id} className="grid gap-0.5 px-3 py-2.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Shield
                      className="size-3.5 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="font-medium">{row.action}</span>
                    <span className="text-muted-foreground">
                      → {row.target}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {row.actor} · {new Date(row.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SettingsContent>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>GDPR / CCPA requests</SettingsTitle>
          <SettingsDescription>
            Queue access, export, delete, or rectify requests with status
            tracking.
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {PRIVACY_TYPES.map((item) => (
              <Button
                key={item.type}
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onCompliance(
                    queuePrivacyRequest(compliance, item.type),
                    `${item.label} request queued.`
                  )
                }
              >
                Request {item.label.toLowerCase()}
              </Button>
            ))}
          </div>
          {compliance.privacyRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No privacy requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border">
              {compliance.privacyRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{request.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.note}
                    </p>
                  </div>
                  <Badge
                    variant={
                      request.status === "completed" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {request.status.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </SettingsContent>
      </SettingsSection>
    </SettingsLayout>
  )
}
