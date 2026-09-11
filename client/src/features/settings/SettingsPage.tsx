import { useMemo, useState, type ReactNode } from "react"
import {
  Bell,
  Building2,
  CreditCard,
  Lock,
  Palette,
  Scale,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { setSession } from "@/features/auth/model/session"
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

const SETTINGS_NAV_GROUPS = [
  {
    label: "Account",
    ids: [
      "profile",
      "appearance",
      "notifications",
      "security",
      "privacy",
    ] as const satisfies readonly SettingsSectionId[],
  },
  {
    label: "Workspace",
    ids: [
      "workspace",
      "billing",
      "compliance",
    ] as const satisfies readonly SettingsSectionId[],
  },
] as const

const SECTION_ICONS: Record<SettingsSectionId, LucideIcon> = {
  profile: User,
  appearance: Palette,
  notifications: Bell,
  billing: CreditCard,
  privacy: Shield,
  security: Lock,
  workspace: Building2,
  compliance: Scale,
}

const SECTION_BY_ID = new Map(
  SETTINGS_SECTIONS.map((section) => [section.id, section])
)

function resolveActiveSection(sectionParam: string | null): SettingsSectionId {
  if (isSettingsSectionId(sectionParam)) {
    return sectionParam
  }
  return "profile"
}

function nextSectionParams(
  searchParams: URLSearchParams,
  section: SettingsSectionId
) {
  const next = new URLSearchParams(searchParams)
  if (section === "profile") {
    next.delete("section")
    return next
  }
  next.set("section", section)
  return next
}

function sectionButtonClass(active: boolean) {
  if (!active) {
    return "h-9 justify-start gap-2.5 whitespace-nowrap text-muted-foreground hover:text-foreground"
  }
  return "h-9 justify-start gap-2.5 whitespace-nowrap bg-accent font-medium text-accent-foreground"
}

function currentPageAttr(active: boolean) {
  if (!active) {
    return undefined
  }
  return "page" as const
}

function saveProfileDraft(
  profile: ProfileDraft,
  setProfileErrors: (errors: { displayName?: string; email?: string }) => void,
  setProfile: (profile: ProfileDraft) => void,
  setSavedProfile: (profile: ProfileDraft) => void
) {
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

function saveWorkspaceDraft(
  workspaceDraft: string,
  preferences: SettingsPreferences,
  setWorkspaceError: (error: string | undefined) => void,
  setWorkspaceDraft: (value: string) => void,
  setPreferences: (value: SettingsPreferences) => void
) {
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

function persistComplianceState(
  next: ComplianceState,
  setCompliance: (value: ComplianceState) => void,
  message?: string
) {
  setCompliance(next)
  saveCompliance(next)
  if (message) {
    toast.success(message)
  }
}

type SettingsSectionProps = {
  activeSection: SettingsSectionId
  profile: ProfileDraft
  profileErrors: { displayName?: string; email?: string }
  savedEmail: string
  roleLabel: string
  onProfileChange: (next: ProfileDraft) => void
  onSaveProfile: () => void
  preferences: SettingsPreferences
  onPatchPreferences: (
    patch: Partial<SettingsPreferences>,
    message: string
  ) => void
  compliance: ComplianceState
  onCompliance: (next: ComplianceState, message?: string) => void
  workspaceDraft: string
  workspaceError: string | undefined
  onWorkspaceDraft: (value: string) => void
  onSaveWorkspace: () => void
}

function ProfileSection({
  profile,
  profileErrors,
  savedEmail,
  roleLabel,
  onProfileChange,
  onSaveProfile,
}: SettingsSectionProps) {
  return (
    <ProfilePanel
      profile={profile}
      profileErrors={profileErrors}
      savedEmail={savedEmail}
      roleLabel={roleLabel}
      onChange={onProfileChange}
      onSave={onSaveProfile}
    />
  )
}

function AppearanceSection({
  preferences,
  onPatchPreferences,
}: SettingsSectionProps) {
  return (
    <AppearancePanel preferences={preferences} onPatch={onPatchPreferences} />
  )
}

function NotificationsSection({
  preferences,
  onPatchPreferences,
}: SettingsSectionProps) {
  return (
    <NotificationsPanel
      preferences={preferences}
      onPatch={onPatchPreferences}
    />
  )
}

function BillingSection({ compliance, onCompliance }: SettingsSectionProps) {
  return <BillingPanel compliance={compliance} onCompliance={onCompliance} />
}

function PrivacySection({
  preferences,
  compliance,
  onPatchPreferences,
  onCompliance,
}: SettingsSectionProps) {
  return (
    <PrivacyPanel
      preferences={preferences}
      compliance={compliance}
      onPatch={onPatchPreferences}
      onCompliance={onCompliance}
    />
  )
}

function SecuritySection({
  preferences,
  compliance,
  onPatchPreferences,
  onCompliance,
}: SettingsSectionProps) {
  return (
    <SecurityPanel
      preferences={preferences}
      compliance={compliance}
      onPatch={onPatchPreferences}
      onCompliance={onCompliance}
    />
  )
}

function WorkspaceSection({
  preferences,
  workspaceDraft,
  workspaceError,
  onWorkspaceDraft,
  onSaveWorkspace,
  onPatchPreferences,
}: SettingsSectionProps) {
  return (
    <WorkspacePanel
      preferences={preferences}
      workspaceDraft={workspaceDraft}
      workspaceError={workspaceError}
      onWorkspaceDraft={onWorkspaceDraft}
      onSaveWorkspace={onSaveWorkspace}
      onPatch={onPatchPreferences}
    />
  )
}

function ComplianceSection({ compliance, onCompliance }: SettingsSectionProps) {
  return <CompliancePanel compliance={compliance} onCompliance={onCompliance} />
}

const SETTINGS_SECTION_RENDERERS: Record<
  SettingsSectionId,
  (props: SettingsSectionProps) => ReactNode
> = {
  profile: ProfileSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  billing: BillingSection,
  privacy: PrivacySection,
  security: SecuritySection,
  workspace: WorkspaceSection,
  compliance: ComplianceSection,
}

function SettingsSectionPanel(props: SettingsSectionProps) {
  const Renderer = SETTINGS_SECTION_RENDERERS[props.activeSection]
  return <Renderer {...props} />
}

export function SettingsPage() {
  const { title, subtitle } = getPageCopy("/settings")
  const catalogUser = getCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeSection = resolveActiveSection(searchParams.get("section"))

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
    setSearchParams(nextSectionParams(searchParams, section), { replace: true })
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Settings} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:gap-10">
          <nav
            aria-label="Settings sections"
            className="flex w-full shrink-0 flex-col gap-5 border-b pb-6 lg:sticky lg:top-8 lg:w-52 lg:border-0 lg:pb-0"
          >
            {SETTINGS_NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex min-w-0 flex-col gap-1.5">
                <p className="px-2.5 text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex flex-row flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
                  {group.ids.map((id) => {
                    const section = SECTION_BY_ID.get(id)
                    if (!section) {
                      return null
                    }
                    const Icon = SECTION_ICONS[section.id]
                    const active = activeSection === section.id
                    return (
                      <Button
                        key={section.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(sectionButtonClass(active))}
                        aria-current={currentPageAttr(active)}
                        onClick={() => selectSection(section.id)}
                      >
                        <Icon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {section.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="min-w-0 flex-1">
            <SettingsSectionPanel
              activeSection={activeSection}
              profile={profile}
              profileErrors={profileErrors}
              savedEmail={savedProfile.email}
              roleLabel={roleLabel}
              onProfileChange={setProfile}
              onSaveProfile={() =>
                saveProfileDraft(
                  profile,
                  setProfileErrors,
                  setProfile,
                  setSavedProfile
                )
              }
              preferences={preferences}
              onPatchPreferences={patchPreferences}
              compliance={compliance}
              onCompliance={(next, message) =>
                persistComplianceState(next, setCompliance, message)
              }
              workspaceDraft={workspaceDraft}
              workspaceError={workspaceError}
              onWorkspaceDraft={setWorkspaceDraft}
              onSaveWorkspace={() =>
                saveWorkspaceDraft(
                  workspaceDraft,
                  preferences,
                  setWorkspaceError,
                  setWorkspaceDraft,
                  setPreferences
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
