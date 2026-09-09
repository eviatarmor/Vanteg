export type OnboardingItemId =
  | "connect-integration"
  | "create-workflow"
  | "invite-or-agent"
  | "try-template"
  | "open-assistant"

export type OnboardingItemAction = "navigate" | "assistant"

export interface OnboardingItem {
  id: OnboardingItemId
  title: string
  description: string
  /** Target route when action is navigate; null for assistant. */
  href: string | null
  /** Extra paths that also complete this item (prefix match). */
  matchHrefs?: readonly string[]
  action: OnboardingItemAction
  cta: string
}

export const ONBOARDING_STORAGE_KEY = "vanteg.onboarding.checklist.v1"

export const onboardingItems: readonly OnboardingItem[] = [
  {
    id: "connect-integration",
    title: "Connect an integration",
    description: "Link Slack, GitHub, or another app your workflows will use.",
    href: "/integrations",
    action: "navigate",
    cta: "Open Integrations",
  },
  {
    id: "create-workflow",
    title: "Create a workflow",
    description: "Draft an automation with triggers and actions.",
    href: "/workflows",
    action: "navigate",
    cta: "Open Workflows",
  },
  {
    id: "invite-or-agent",
    title: "Invite a teammate or create an agent",
    description: "Add people to a team graph, or personalize an agent.",
    href: "/teams",
    matchHrefs: ["/agents"],
    action: "navigate",
    cta: "Open Teams",
  },
  {
    id: "try-template",
    title: "Try a template",
    description: "Start from an industry template instead of a blank canvas.",
    href: "/templates",
    action: "navigate",
    cta: "Browse templates",
  },
  {
    id: "open-assistant",
    title: "Open Assistant",
    description: "Ask Vanteg about the current page or your workspace.",
    href: null,
    action: "assistant",
    cta: "Ask Vanteg",
  },
] as const

export function pathMatchesOnboardingHref(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function onboardingItemIdsForPath(pathname: string): OnboardingItemId[] {
  return onboardingItems
    .filter((item) => {
      const hrefs = [item.href, ...(item.matchHrefs ?? [])].filter(
        (href): href is string => href !== null
      )
      return hrefs.some((href) => pathMatchesOnboardingHref(pathname, href))
    })
    .map((item) => item.id)
}
