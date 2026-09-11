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

import {
  type SettingsPreferences,
  WORKSPACE_LOCALES,
  WORKSPACE_TIMEZONES,
} from "../model/preferences"

import {
  SettingsContent,
  SettingsDescription,
  SettingsField,
  SettingsFooter,
  SettingsHeader,
  SettingsSection,
  SettingsTitle,
} from "./SettingsLayout"

type WorkspacePanelProps = {
  preferences: SettingsPreferences
  workspaceDraft: string
  workspaceError?: string
  onWorkspaceDraft: (value: string) => void
  onSaveWorkspace: () => void
  onPatch: (patch: Partial<SettingsPreferences>, message: string) => void
}

export function WorkspacePanel({
  preferences,
  workspaceDraft,
  workspaceError,
  onWorkspaceDraft,
  onSaveWorkspace,
  onPatch,
}: WorkspacePanelProps) {
  return (
    <SettingsSection>
      <SettingsHeader>
        <SettingsTitle>Workspace</SettingsTitle>
        <SettingsDescription>
          Display name, timezone, and default locale for this workspace.
        </SettingsDescription>
      </SettingsHeader>
      <SettingsContent className="grid gap-4">
        <SettingsField>
          <Label htmlFor="settings-workspace-name" className="sm:w-40">
            Display name
          </Label>
          <div className="grid max-w-sm gap-2">
            <Input
              id="settings-workspace-name"
              value={workspaceDraft}
              onChange={(event) => onWorkspaceDraft(event.target.value)}
              aria-invalid={Boolean(workspaceError)}
              autoComplete="organization"
            />
            {workspaceError ? (
              <p className="text-sm text-destructive" role="alert">
                {workspaceError}
              </p>
            ) : null}
          </div>
        </SettingsField>
        <SettingsField>
          <Label htmlFor="settings-timezone" className="sm:w-40">
            Timezone
          </Label>
          <Select
            value={preferences.timezone}
            onValueChange={(value) =>
              onPatch({ timezone: value }, "Timezone saved.")
            }
          >
            <SelectTrigger id="settings-timezone" className="w-full max-w-sm">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {WORKSPACE_TIMEZONES.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
        <SettingsField>
          <Label htmlFor="settings-locale" className="sm:w-40">
            Default locale
          </Label>
          <Select
            value={preferences.locale}
            onValueChange={(value) =>
              onPatch({ locale: value }, "Locale saved.")
            }
          >
            <SelectTrigger id="settings-locale" className="w-full max-w-sm">
              <SelectValue placeholder="Select locale" />
            </SelectTrigger>
            <SelectContent>
              {WORKSPACE_LOCALES.map((locale) => (
                <SelectItem key={locale.value} value={locale.value}>
                  {locale.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </SettingsContent>
      <SettingsFooter>
        <Button type="button" onClick={onSaveWorkspace}>
          Save workspace
        </Button>
      </SettingsFooter>
    </SettingsSection>
  )
}
