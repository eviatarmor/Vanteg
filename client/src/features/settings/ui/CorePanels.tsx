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

import {
  type ProfileDraft,
  type SettingsPreferences,
} from "../model/preferences"

type ThemeChoice = "light" | "dark" | "system"

type ProfilePanelProps = {
  profile: ProfileDraft
  profileErrors: { displayName?: string; email?: string }
  savedEmail: string
  roleLabel: string
  onChange: (next: ProfileDraft) => void
  onSave: () => void
}

export function ProfilePanel({
  profile,
  profileErrors,
  savedEmail,
  roleLabel,
  onChange,
  onSave,
}: ProfilePanelProps) {
  return (
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
              onChange({ ...profile, displayName: event.target.value })
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
              onChange({ ...profile, email: event.target.value })
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
              Signed in as {savedEmail}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" onClick={onSave}>
          Save profile
        </Button>
      </CardFooter>
    </Card>
  )
}

type AppearancePanelProps = {
  preferences: SettingsPreferences
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
}

export function AppearancePanel({ preferences, onPatch }: AppearancePanelProps) {
  const { theme, setTheme } = useTheme()

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

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Theme, density, and sidebar layout for this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 pt-(--card-spacing)">
        <div className="grid gap-2">
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="settings-density">Density</Label>
          <Select
            value={preferences.density}
            onValueChange={(value) => {
              if (value === "comfortable" || value === "compact") {
                onPatch({ density: value }, "Density preference saved.")
              }
            }}
          >
            <SelectTrigger id="settings-density" className="w-full sm:w-56">
              <SelectValue placeholder="Select density" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="settings-sidebar-compact">Compact sidebar</Label>
            <p className="text-sm text-muted-foreground">
              Prefer icon-first navigation when space is tight.
            </p>
          </div>
          <Switch
            id="settings-sidebar-compact"
            checked={preferences.sidebarCompact}
            onCheckedChange={(checked) =>
              onPatch({ sidebarCompact: checked }, "Sidebar preference saved.")
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

type NotificationsPanelProps = {
  preferences: SettingsPreferences
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
}

export function NotificationsPanel({
  preferences,
  onPatch,
}: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Control email, product, and inbox alerts for this browser.
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
              onPatch(
                { emailNotifications: checked },
                "Notification preferences saved."
              )
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="settings-product-notifications">
              Product notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Release notes, tips, and feature announcements.
            </p>
          </div>
          <Switch
            id="settings-product-notifications"
            checked={preferences.productNotifications}
            onCheckedChange={(checked) =>
              onPatch(
                { productNotifications: checked },
                "Notification preferences saved."
              )
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
              onPatch(
                { inboxNotifications: checked },
                "Notification preferences saved."
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
