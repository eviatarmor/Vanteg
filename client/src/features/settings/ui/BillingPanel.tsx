import { useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Progress } from "@workspace/ui/components/progress"

import {
  type ComplianceState,
  updatePaymentMethod,
  upgradePlan,
  usagePercent,
} from "../model/compliance"

import {
  SettingsContent,
  SettingsDescription,
  SettingsFooter,
  SettingsHeader,
  SettingsLayout,
  SettingsSection,
  SettingsTitle,
} from "./SettingsLayout"

type BillingPanelProps = {
  compliance: ComplianceState
  onCompliance: (next: ComplianceState, message?: string) => void
}

export function BillingPanel({ compliance, onCompliance }: BillingPanelProps) {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [last4Draft, setLast4Draft] = useState("")

  const workflowPct = usagePercent(
    compliance.workflowsUsed,
    compliance.workflowsLimit
  )
  const seatsPct = usagePercent(compliance.seatsUsed, compliance.seatsLimit)

  return (
    <>
      <SettingsLayout>
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Current plan</SettingsTitle>
            <SettingsDescription>
              Mock billing for demos — no real charges.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-semibold capitalize">
                {compliance.plan}
              </span>
              <Badge
                variant={compliance.plan === "pro" ? "default" : "secondary"}
              >
                {compliance.plan === "pro" ? "Active" : "Free tier"}
              </Badge>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="flex justify-between text-sm">
                  <span>Workflows</span>
                  <span className="text-muted-foreground">
                    {compliance.workflowsUsed} / {compliance.workflowsLimit}
                  </span>
                </div>
                <Progress value={workflowPct} aria-label="Workflow usage" />
              </div>
              <div className="grid gap-1.5">
                <div className="flex justify-between text-sm">
                  <span>Seats</span>
                  <span className="text-muted-foreground">
                    {compliance.seatsUsed} / {compliance.seatsLimit}
                  </span>
                </div>
                <Progress value={seatsPct} aria-label="Seat usage" />
              </div>
            </div>
          </SettingsContent>
          <SettingsFooter>
            {compliance.plan === "free" ? (
              <Button
                type="button"
                onClick={() =>
                  onCompliance(
                    upgradePlan(compliance),
                    "Upgraded to Pro (mock)."
                  )
                }
              >
                Upgrade to Pro
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pro includes higher limits and priority support.
              </p>
            )}
          </SettingsFooter>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Payment method</SettingsTitle>
            <SettingsDescription>
              Display-only mock card — use Update payment to change the last
              four.
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent>
            {compliance.paymentLast4 ? (
              <p className="font-medium">
                {compliance.paymentBrand ?? "Card"} ending in{" "}
                <span className="font-mono">{compliance.paymentLast4}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment method on file.
              </p>
            )}
          </SettingsContent>
          <SettingsFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLast4Draft("")
                setPaymentOpen(true)
              }}
            >
              Update payment
            </Button>
          </SettingsFooter>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Invoices</SettingsTitle>
            <SettingsDescription>
              Recent billing history (stub).
            </SettingsDescription>
          </SettingsHeader>
          <SettingsContent>
            {compliance.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border">
                {compliance.invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {invoice.id}
                    </span>
                    <span>{invoice.date}</span>
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant="outline" className="capitalize">
                      {invoice.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </SettingsContent>
        </SettingsSection>
      </SettingsLayout>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>
              Mock only — enter the last four digits. No card processor is
              called.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="settings-payment-last4">Last four digits</Label>
            <Input
              id="settings-payment-last4"
              inputMode="numeric"
              maxLength={4}
              value={last4Draft}
              onChange={(event) =>
                setLast4Draft(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="4242"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={last4Draft.length !== 4}
              onClick={() => {
                onCompliance(
                  updatePaymentMethod(compliance, last4Draft),
                  "Payment method updated (mock)."
                )
                setPaymentOpen(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
