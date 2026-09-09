import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { SecretInput } from "@/components/secret-input"

import {
  signOutOtherSessions,
  type ComplianceState,
} from "../model/compliance"
import { type SettingsPreferences } from "../model/preferences"

type SecurityPanelProps = {
  preferences: SettingsPreferences
  compliance: ComplianceState
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
  onCompliance: (next: ComplianceState, message?: string) => void
}

export function SecurityPanel({
  preferences,
  compliance,
  onPatch,
  onCompliance,
}: SecurityPanelProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [nextPassword, setNextPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | undefined>()

  function handlePasswordChange() {
    if (!currentPassword || !nextPassword) {
      setPasswordError("Enter current and new passwords.")
      toast.error("Enter current and new passwords.")
      return
    }
    if (nextPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      toast.error("New password must be at least 8 characters.")
      return
    }
    if (nextPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      toast.error("New passwords do not match.")
      return
    }
    setPasswordError(undefined)
    setCurrentPassword("")
    setNextPassword("")
    setConfirmPassword("")
    toast.success("Password updated (mock).")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Devices signed in to this workspace (mock list).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-(--card-spacing)">
          {compliance.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border">
              {compliance.sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{session.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} · {session.lastActive}
                    </p>
                  </div>
                  {session.current ? (
                    <Badge>Current</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onCompliance(
                signOutOtherSessions(compliance),
                "Signed out of other sessions."
              )
            }
          >
            Sign out all other sessions
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Stub toggle — wire a real authenticator later.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 pt-(--card-spacing)">
          <div className="space-y-1">
            <Label htmlFor="settings-2fa">Require 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Prompt for a second factor at sign-in.
            </p>
          </div>
          <Switch
            id="settings-2fa"
            checked={preferences.twoFactorEnabled}
            onCheckedChange={(checked) =>
              onPatch(
                { twoFactorEnabled: checked },
                checked ? "2FA enabled (stub)." : "2FA disabled (stub)."
              )
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Uses SecretInput — never a native password field.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-(--card-spacing)">
          <div className="grid gap-2">
            <Label htmlFor="settings-current-password">Current password</Label>
            <SecretInput
              id="settings-current-password"
              value={currentPassword}
              onValueChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-new-password">New password</Label>
            <SecretInput
              id="settings-new-password"
              value={nextPassword}
              onValueChange={setNextPassword}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
            <SecretInput
              id="settings-confirm-password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>
          {passwordError ? (
            <p className="text-sm text-destructive" role="alert">
              {passwordError}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="button" onClick={handlePasswordChange}>
            Update password
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
