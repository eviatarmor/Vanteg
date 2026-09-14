import { useSyncExternalStore } from "react"

import {
  agentModels,
  getAgentModel,
  type AgentModel,
} from "../../agents/model/types"

export const ASSISTANT_SETTINGS_STORAGE_KEY = "vanteg.assistant.settings"

export const ASSISTANT_ACCESS_MODES = [
  "read-only",
  "supervised",
  "full-access",
] as const

export const ASSISTANT_EFFORTS = ["low", "medium", "high"] as const

export type AssistantAccessMode = (typeof ASSISTANT_ACCESS_MODES)[number]
export type AssistantEffort = (typeof ASSISTANT_EFFORTS)[number]

export interface AssistantSettings {
  model: AgentModel
  access: AssistantAccessMode
  effort: AssistantEffort
}

export const assistantAccessOptions: {
  value: AssistantAccessMode
  label: string
  description: string
}[] = [
  {
    value: "read-only",
    label: "Read only",
    description: "Explore and explain.",
  },
  {
    value: "supervised",
    label: "Supervised",
    description: "Ask before making changes.",
  },
  {
    value: "full-access",
    label: "Full access",
    description: "Proceed without asking.",
  },
]

export const assistantEffortOptions: {
  value: AssistantEffort
  label: string
  description: string
}[] = [
  {
    value: "low",
    label: "Low",
    description: "Faster replies with lighter reasoning.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced reasoning for most questions.",
  },
  {
    value: "high",
    label: "High",
    description: "Deeper reasoning when the model supports it.",
  },
]

export const assistantAccessHint =
  "Chat currently provides guidance only. Execution controls apply when tools are available."

export const assistantGrokOnlyHint =
  "Ask Vanteg currently chats with Grok. Select Grok 4.6 or Grok 4.5 to send."

export const assistantEffortGrokHint =
  "Effort is available for Grok in this chat."

export function assistantEffortTriggerLabel(effort: AssistantEffort): string {
  const option =
    assistantEffortOptions.find((item) => item.value === effort) ??
    assistantEffortOptions[1]!
  return `${option.label} effort`
}

const GROK_WITHOUT_REASONING_EFFORT = /^grok-4\.20(-\d{4})?-(non-)?reasoning$/

export function defaultAssistantSettings(): AssistantSettings {
  return {
    model: getAgentModel("grok-4.6").value,
    access: "supervised",
    effort: "medium",
  }
}

export function isAssistantAccessMode(
  value: unknown
): value is AssistantAccessMode {
  return (
    typeof value === "string" &&
    (ASSISTANT_ACCESS_MODES as readonly string[]).includes(value)
  )
}

export function isAssistantEffort(value: unknown): value is AssistantEffort {
  return (
    typeof value === "string" &&
    (ASSISTANT_EFFORTS as readonly string[]).includes(value)
  )
}

export function isAgentModelValue(value: unknown): value is AgentModel {
  return (
    typeof value === "string" &&
    agentModels.some((model) => model.value === value)
  )
}

export function isXaiAssistantModel(model: AgentModel): boolean {
  return getAgentModel(model).provider === "xai"
}

export function modelSupportsEffort(model: AgentModel): boolean {
  return (
    isXaiAssistantModel(model) && !GROK_WITHOUT_REASONING_EFFORT.test(model)
  )
}

export function parseAssistantSettings(value: unknown): AssistantSettings {
  const defaults = defaultAssistantSettings()
  if (!value || typeof value !== "object") {
    return defaults
  }
  const raw = value as Partial<AssistantSettings>
  return {
    model:
      isAgentModelValue(raw.model) && isXaiAssistantModel(raw.model)
        ? raw.model
        : defaults.model,
    access: isAssistantAccessMode(raw.access) ? raw.access : defaults.access,
    effort: isAssistantEffort(raw.effort) ? raw.effort : defaults.effort,
  }
}

export function accessGuidance(access: AssistantAccessMode): string {
  switch (access) {
    case "read-only":
      return "Access preference: read only. Explore, explain, and propose ideas or plans. Do not execute writes, deletions, or other state changes."
    case "supervised":
      return "Access preference: supervised. You may propose next steps, but ask for confirmation before making changes."
    case "full-access":
      return "Access preference: full access. Prefer direct, complete help. This chat cannot execute tools or change workspace state."
  }
}

function readStorage(): AssistantSettings {
  try {
    if (typeof localStorage === "undefined") {
      return defaultAssistantSettings()
    }
    const raw = localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return defaultAssistantSettings()
    }
    return parseAssistantSettings(JSON.parse(raw) as unknown)
  } catch {
    return defaultAssistantSettings()
  }
}

function writeStorage(next: AssistantSettings): void {
  if (typeof localStorage === "undefined") {
    return
  }
  localStorage.setItem(ASSISTANT_SETTINGS_STORAGE_KEY, JSON.stringify(next))
}

let settings = defaultAssistantSettings()
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function hydrateAssistantSettings(options?: {
  force?: boolean
}): AssistantSettings {
  if (hydrated && !options?.force) {
    return settings
  }
  settings = readStorage()
  hydrated = true
  emit()
  return settings
}

function ensureHydrated(): void {
  hydrateAssistantSettings()
}

export function getAssistantSettings(): AssistantSettings {
  ensureHydrated()
  return settings
}

export function setAssistantSettings(
  patch: Partial<AssistantSettings>
): AssistantSettings {
  ensureHydrated()
  const next = parseAssistantSettings({ ...settings, ...patch })
  settings = next
  try {
    writeStorage(next)
  } catch {
    // keep in-memory settings if storage is unavailable
  }
  emit()
  return next
}

export function subscribeAssistantSettings(listener: () => void): () => void {
  ensureHydrated()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAssistantSettings(): AssistantSettings {
  return useSyncExternalStore(
    subscribeAssistantSettings,
    getAssistantSettings,
    getAssistantSettings
  )
}

export function resetAssistantSettings(): void {
  settings = defaultAssistantSettings()
  hydrated = true
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(ASSISTANT_SETTINGS_STORAGE_KEY)
    }
  } catch {
    // ignore cleanup failures in tests
  }
  emit()
}
