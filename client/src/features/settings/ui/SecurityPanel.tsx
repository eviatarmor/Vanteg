import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { SecretInput } from "@/components/secret-input"

import { signOutOtherSessions, type ComplianceState } from "../model/compliance"
import { type SettingsPreferences } from "../model/preferences"

import {
  SettingsContent,
  SettingsDescription,
  SettingsField,
  SettingsFooter,
  SettingsHeader,
  SettingsLayout,
  SettingsSection,
  SettingsTitle,
} from "./SettingsLayout"

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
    <SettingsLayout>
      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Sessions</SettingsTitle>
          <SettingsDescription>
            Devices signed in to this workspace (mock list).
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent>
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
        </SettingsContent>
        <SettingsFooter>
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
        </SettingsFooter>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Two-factor authentication</SettingsTitle>
          <SettingsDescription>
            Stub toggle — wire a real authenticator later.
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent className="flex items-center justify-between gap-4">
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
        </SettingsContent>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Change password</SettingsTitle>
          <SettingsDescription>
            Uses SecretInput — never a native password field.
          </SettingsDescription>
        </SettingsHeader>
        <SettingsContent className="grid gap-4">
          <SettingsField>
            <Label htmlFor="settings-current-password" className="sm:w-40">
              Current password
            </Label>
            <SecretInput
              id="settings-current-password"
              className="max-w-sm"
              value={currentPassword}
              onValueChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </SettingsField>
          <SettingsField>
            <Label htmlFor="settings-new-password" className="sm:w-40">
              New password
            </Label>
            <SecretInput
              id="settings-new-password"
              className="max-w-sm"
              value={nextPassword}
              onValueChange={setNextPassword}
              autoComplete="new-password"
            />
          </SettingsField>
          <SettingsField>
            <Label htmlFor="settings-confirm-password" className="sm:w-40">
              Confirm new password
            </Label>
            <div className="grid max-w-sm gap-2">
              <SecretInput
                id="settings-confirm-password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                autoComplete="new-password"
              />
              {passwordError ? (
                <p className="text-sm text-destructive" role="alert">
                  {passwordError}
                </p>
              ) : null}
            </div>
          </SettingsField>
        </SettingsContent>
        <SettingsFooter>
          <Button type="button" onClick={handlePasswordChange}>
            Update password
          </Button>
        </SettingsFooter>
      </SettingsSection>
    </SettingsLayout>
  )
}
