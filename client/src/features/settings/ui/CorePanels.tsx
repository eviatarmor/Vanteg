import type { ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
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
import { cn } from "@workspace/ui/lib/utils"

import { useTheme } from "@/components/theme-provider"

import {
  type ProfileDraft,
  type SettingsPreferences,
} from "../model/preferences"
import {
  SettingsSection as Section,
  SettingsHeader,
  SettingsTitle,
  SettingsDescription,
  SettingsContent,
  SettingsFooter,
} from "./SettingsLayout"

type ThemeChoice = "light" | "dark" | "system"

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

function SettingsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Section>
      <SettingsHeader>
        <SettingsTitle>{title}</SettingsTitle>
        {description ? (
          <SettingsDescription>{description}</SettingsDescription>
        ) : null}
      </SettingsHeader>
      <SettingsContent className="flex flex-col gap-5">
        {children}
      </SettingsContent>
      {footer ? (
        <SettingsFooter className="border-t border-border pt-4">
          {footer}
        </SettingsFooter>
      ) : null}
    </Section>
  )
}

function SettingsFieldRow({
  htmlFor,
  label,
  children,
  align = "start",
}: {
  htmlFor: string
  label: string
  children: ReactNode
  align?: "start" | "center"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:gap-6",
        align === "center" ? "sm:items-center" : "sm:items-start"
      )}
    >
      <Label
        htmlFor={htmlFor}
        className={cn("sm:w-40 sm:shrink-0", align === "start" && "sm:pt-2")}
      >
        {label}
      </Label>
      <div className="min-w-0 flex-1 sm:max-w-sm">{children}</div>
    </div>
  )
}

function SettingsToggleRow({
  htmlFor,
  label,
  description,
  children,
}: {
  htmlFor: string
  label: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 sm:gap-6">
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

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
  const initials = profileInitials(profile.displayName)

  return (
    <SettingsSection
      title="Profile"
      description={`Name and email for your Vanteg account (${roleLabel}).`}
      footer={
        <Button type="button" onClick={onSave}>
          Save profile
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vanteg-avatar text-sm font-medium text-primary-foreground"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {profile.displayName.trim() || "—"}
          </p>
          <p className="truncate text-sm text-muted-foreground">{savedEmail}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">{roleLabel}</p>
      </div>

      <SettingsFieldRow htmlFor="settings-profile-name" label="Name">
        <Input
          id="settings-profile-name"
          value={profile.displayName}
          onChange={(event) =>
            onChange({ ...profile, displayName: event.target.value })
          }
          aria-invalid={Boolean(profileErrors.displayName)}
          aria-describedby={
            profileErrors.displayName
              ? "settings-profile-name-error"
              : undefined
          }
          autoComplete="name"
        />
        {profileErrors.displayName ? (
          <p
            id="settings-profile-name-error"
            className="mt-1.5 text-sm text-destructive"
            role="alert"
          >
            {profileErrors.displayName}
          </p>
        ) : null}
      </SettingsFieldRow>

      <SettingsFieldRow htmlFor="settings-profile-email" label="Email">
        <Input
          id="settings-profile-email"
          type="email"
          value={profile.email}
          onChange={(event) =>
            onChange({ ...profile, email: event.target.value })
          }
          aria-invalid={Boolean(profileErrors.email)}
          aria-describedby="settings-profile-email-description"
          autoComplete="email"
        />
        {profileErrors.email ? (
          <p
            id="settings-profile-email-description"
            className="mt-1.5 text-sm text-destructive"
            role="alert"
          >
            {profileErrors.email}
          </p>
        ) : (
          <p
            id="settings-profile-email-description"
            className="mt-1.5 text-xs break-words text-muted-foreground"
          >
            Signed in as {savedEmail}
          </p>
        )}
      </SettingsFieldRow>
    </SettingsSection>
  )
}

type AppearancePanelProps = {
  preferences: SettingsPreferences
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
}

export function AppearancePanel({
  preferences,
  onPatch,
}: AppearancePanelProps) {
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
    <SettingsSection
      title="Appearance"
      description="Theme, density, and sidebar layout for this browser."
    >
      <SettingsFieldRow htmlFor="settings-theme" label="Theme" align="center">
        <Select
          value={(theme as ThemeChoice) ?? "system"}
          onValueChange={handleThemeChange}
        >
          <SelectTrigger id="settings-theme" className="w-full">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </SettingsFieldRow>

      <SettingsFieldRow
        htmlFor="settings-density"
        label="Density"
        align="center"
      >
        <Select
          value={preferences.density}
          onValueChange={(value) => {
            if (value === "comfortable" || value === "compact") {
              onPatch({ density: value }, "Density preference saved.")
            }
          }}
        >
          <SelectTrigger id="settings-density" className="w-full">
            <SelectValue placeholder="Select density" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </SettingsFieldRow>

      <SettingsToggleRow
        htmlFor="settings-sidebar-compact"
        label="Compact sidebar"
        description="Prefer icon-first navigation when space is tight."
      >
        <Switch
          id="settings-sidebar-compact"
          checked={preferences.sidebarCompact}
          onCheckedChange={(checked) =>
            onPatch({ sidebarCompact: checked }, "Sidebar preference saved.")
          }
        />
      </SettingsToggleRow>
    </SettingsSection>
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
    <SettingsSection
      title="Notifications"
      description="Control email, product, and inbox alerts for this browser."
    >
      <SettingsToggleRow
        htmlFor="settings-email-notifications"
        label="Email notifications"
        description="Summaries and approval requests by email."
      >
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
      </SettingsToggleRow>

      <SettingsToggleRow
        htmlFor="settings-product-notifications"
        label="Product notifications"
        description="Release notes, tips, and feature announcements."
      >
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
      </SettingsToggleRow>

      <SettingsToggleRow
        htmlFor="settings-inbox-notifications"
        label="Inbox notifications"
        description="Badge and toast alerts for the Inbox queue."
      >
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
      </SettingsToggleRow>
    </SettingsSection>
  )
}
