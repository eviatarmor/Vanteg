import { useMemo, useState } from "react"
import { Settings } from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PageHeader } from "@/features/page-header/PageHeader"
import { getCurrentUser, getPageCopy } from "@/features/shell/model/catalog"

import {
  loadCompliance,
  saveCompliance,
  type ComplianceState,
} from "./model/compliance"
import {
  defaultProfile,
  loadPreferences,
  savePreferences,
  type ProfileDraft,
  type SettingsPreferences,
  validateProfile,
  validateWorkspaceName,
} from "./model/preferences"
import {
  isSettingsSectionId,
  SETTINGS_SECTIONS,
  type SettingsSectionId,
} from "./model/sections"
import {
  AppearancePanel,
  BillingPanel,
  CompliancePanel,
  NotificationsPanel,
  PrivacyPanel,
  ProfilePanel,
  SecurityPanel,
  WorkspacePanel,
} from "./ui/SettingsPanels"

export function SettingsPage() {
  const { title, subtitle } = getPageCopy("/settings")
  const catalogUser = getCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()

  const sectionParam = searchParams.get("section")
  const activeSection: SettingsSectionId = isSettingsSectionId(sectionParam)
    ? sectionParam
    : "profile"

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
  const [compliance, setCompliance] = useState<ComplianceState>(() =>
    loadCompliance()
  )

  const roleLabel = useMemo(() => catalogUser.role, [catalogUser.role])

  function selectSection(section: SettingsSectionId) {
    const next = new URLSearchParams(searchParams)
    if (section === "profile") {
      next.delete("section")
    } else {
      next.set("section", section)
    }
    setSearchParams(next, { replace: true })
  }

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
    setProfile(next)
    setSavedProfile(next)
    toast.success("Profile saved.")
  }

  function patchPreferences(
    patch: Partial<SettingsPreferences>,
    message: string
  ) {
    const merged: SettingsPreferences = {
      ...preferences,
      ...patch,
    }
    setPreferences(merged)
    savePreferences(merged)
    toast.success(message)
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

  function persistCompliance(next: ComplianceState, message?: string) {
    setCompliance(next)
    saveCompliance(next)
    if (message) {
      toast.success(message)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Settings} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start sm:px-6">
          <nav
            aria-label="Settings sections"
            className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-48 lg:flex-col lg:overflow-visible"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start whitespace-nowrap",
                  activeSection === section.id && "bg-muted font-medium"
                )}
                aria-current={activeSection === section.id ? "page" : undefined}
                onClick={() => selectSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </nav>

          <div className="min-w-0 flex-1">
            {activeSection === "profile" ? (
              <ProfilePanel
                profile={profile}
                profileErrors={profileErrors}
                savedEmail={savedProfile.email}
                roleLabel={roleLabel}
                onChange={setProfile}
                onSave={handleSaveProfile}
              />
            ) : null}
            {activeSection === "appearance" ? (
              <AppearancePanel
                preferences={preferences}
                onPatch={patchPreferences}
              />
            ) : null}
            {activeSection === "notifications" ? (
              <NotificationsPanel
                preferences={preferences}
                onPatch={patchPreferences}
              />
            ) : null}
            {activeSection === "billing" ? (
              <BillingPanel
                compliance={compliance}
                onCompliance={persistCompliance}
              />
            ) : null}
            {activeSection === "privacy" ? (
              <PrivacyPanel
                preferences={preferences}
                compliance={compliance}
                onPatch={patchPreferences}
                onCompliance={persistCompliance}
              />
            ) : null}
            {activeSection === "security" ? (
              <SecurityPanel
                preferences={preferences}
                compliance={compliance}
                onPatch={patchPreferences}
                onCompliance={persistCompliance}
              />
            ) : null}
            {activeSection === "workspace" ? (
              <WorkspacePanel
                preferences={preferences}
                workspaceDraft={workspaceDraft}
                workspaceError={workspaceError}
                onWorkspaceDraft={setWorkspaceDraft}
                onSaveWorkspace={handleSaveWorkspace}
                onPatch={patchPreferences}
              />
            ) : null}
            {activeSection === "compliance" ? (
              <CompliancePanel
                compliance={compliance}
                onCompliance={persistCompliance}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
