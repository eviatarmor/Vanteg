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

import {
  type SettingsPreferences,
  WORKSPACE_LOCALES,
  WORKSPACE_TIMEZONES,
} from "../model/preferences"

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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Workspace</CardTitle>
        <CardDescription>
          Display name, timezone, and default locale for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-(--card-spacing)">
        <div className="grid gap-2">
          <Label htmlFor="settings-workspace-name">Display name</Label>
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
        <div className="grid gap-2">
          <Label htmlFor="settings-timezone">Timezone</Label>
          <Select
            value={preferences.timezone}
            onValueChange={(value) =>
              onPatch({ timezone: value }, "Timezone saved.")
            }
          >
            <SelectTrigger id="settings-timezone" className="w-full sm:w-72">
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="settings-locale">Default locale</Label>
          <Select
            value={preferences.locale}
            onValueChange={(value) =>
              onPatch({ locale: value }, "Locale saved.")
            }
          >
            <SelectTrigger id="settings-locale" className="w-full sm:w-72">
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
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" onClick={onSaveWorkspace}>
          Save workspace
        </Button>
      </CardFooter>
    </Card>
  )
}
