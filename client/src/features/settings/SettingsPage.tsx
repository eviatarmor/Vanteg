import { useMemo, useState } from "react"
import { Settings } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"

import { useTheme } from "@/components/theme-provider"
import { setSession } from "@/features/auth/model/session"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getCurrentUser, getPageCopy } from "@/features/shell/model/catalog"

import {
  defaultProfile,
  loadPreferences,
  savePreferences,
  type NotificationPreferences,
  type ProfileDraft,
  type SettingsPreferences,
  validateProfile,
  validateWorkspaceName,
} from "./model/preferences"

type ThemeChoice = "light" | "dark" | "system"

export function SettingsPage() {
  const { title, subtitle } = getPageCopy("/settings")
  const catalogUser = getCurrentUser()
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState<ProfileDraft>(() => defaultProfile())
  const [profileErrors, setProfileErrors] = useState<{
    displayName?: string
    email?: string
  }>({})
  const [savedProfile, setSavedProfile] = useState<ProfileDraft>(() =>
    defaultProfile()
  )

  const [preferences, setPreferences] = useState<SettingsPreferences>(() =>
    loadPreferences()
  )
  const [workspaceError, setWorkspaceError] = useState<string | undefined>()
  const [workspaceDraft, setWorkspaceDraft] = useState(
    () => loadPreferences().displayName
  )

  const roleLabel = useMemo(() => catalogUser.role, [catalogUser.role])

  function handleSaveProfile() {
    const errors = validateProfile(profile)
    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error("Fix the highlighted profile fields.")
      return
    }
    const next = {
      displayName: profile.displayName.trim(),
      email: profile.email.trim(),
    }
    if (!setSession({ name: next.displayName, email: next.email })) {
      toast.error("Could not save profile.")
      return
    }
    setProfile(next)
    setSavedProfile(next)
    toast.success("Profile saved.")
  }

  function handleThemeChange(value: string) {
    if (value === "light" || value === "dark" || value === "system") {
      setTheme(value)
      toast.success(
        value === "system"
          ? "Theme follows your system preference."
          : `Theme set to ${value}.`
      )
    }
  }

  function persistNotifications(next: NotificationPreferences) {
    const merged: SettingsPreferences = {
      ...preferences,
      ...next,
    }
    setPreferences(merged)
    savePreferences(merged)
    toast.success("Notification preferences saved.")
  }

  function handleSaveWorkspace() {
    const error = validateWorkspaceName(workspaceDraft)
    setWorkspaceError(error)
    if (error) {
      toast.error(error)
      return
    }
    const trimmed = workspaceDraft.trim()
    const merged: SettingsPreferences = {
      ...preferences,
      displayName: trimmed,
    }
    setWorkspaceDraft(trimmed)
    setPreferences(merged)
    savePreferences(merged)
    toast.success("Workspace settings saved.")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Settings} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Name and email for your Vanteg account ({roleLabel}).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-(--card-spacing)">
              <div className="grid gap-2">
                <Label htmlFor="settings-profile-name">Name</Label>
                <Input
                  id="settings-profile-name"
                  value={profile.displayName}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(profileErrors.displayName)}
                  autoComplete="name"
                />
                {profileErrors.displayName ? (
                  <p className="text-sm text-destructive" role="alert">
                    {profileErrors.displayName}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="settings-profile-email">Email</Label>
                <Input
                  id="settings-profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(profileErrors.email)}
                  autoComplete="email"
                />
                {profileErrors.email ? (
                  <p className="text-sm text-destructive" role="alert">
                    {profileErrors.email}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Signed in as {savedProfile.email}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="button" onClick={handleSaveProfile}>
                Save profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Choose light, dark, or match the system theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 pt-(--card-spacing)">
              <Label htmlFor="settings-theme">Theme</Label>
              <Select
                value={(theme as ThemeChoice) ?? "system"}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="settings-theme" className="w-full sm:w-56">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control email and inbox alerts for this browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-(--card-spacing)">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="settings-email-notifications">
                    Email notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Summaries and approval requests by email.
                  </p>
                </div>
                <Switch
                  id="settings-email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    persistNotifications({
                      emailNotifications: checked,
                      inboxNotifications: preferences.inboxNotifications,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="settings-inbox-notifications">
                    Inbox notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Badge and toast alerts for the Inbox queue.
                  </p>
                </div>
                <Switch
                  id="settings-inbox-notifications"
                  checked={preferences.inboxNotifications}
                  onCheckedChange={(checked) =>
                    persistNotifications({
                      emailNotifications: preferences.emailNotifications,
                      inboxNotifications: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Display name shown in the shell for this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 pt-(--card-spacing)">
              <Label htmlFor="settings-workspace-name">Display name</Label>
              <Input
                id="settings-workspace-name"
                value={workspaceDraft}
                onChange={(event) => setWorkspaceDraft(event.target.value)}
                aria-invalid={Boolean(workspaceError)}
                autoComplete="organization"
              />
              {workspaceError ? (
                <p className="text-sm text-destructive" role="alert">
                  {workspaceError}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="button" onClick={handleSaveWorkspace}>
                Save workspace
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

