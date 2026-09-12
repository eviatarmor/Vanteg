import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getAgentModel } from "@/features/agents/model/types"

import {
  ASSISTANT_SETTINGS_STORAGE_KEY,
  defaultAssistantSettings,
  getAssistantSettings,
  hydrateAssistantSettings,
  isXaiAssistantModel,
  modelSupportsEffort,
  parseAssistantSettings,
  resetAssistantSettings,
  setAssistantSettings,
} from "./settings"

describe("assistant settings", () => {
  beforeEach(() => {
    resetAssistantSettings()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetAssistantSettings()
  })

  it("defaults to Grok 4.6, supervised access, and medium effort", () => {
    expect(defaultAssistantSettings()).toEqual({
      model: getAgentModel("grok-4.6").value,
      access: "supervised",
      effort: "medium",
    })
  })

  it("persists valid settings and ignores malformed values", () => {
    setAssistantSettings({
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })
    expect(getAssistantSettings()).toEqual({
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })
    expect(
      JSON.parse(localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)!)
    ).toEqual({
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })

    expect(
      parseAssistantSettings({
        model: "not-a-model",
        access: "root",
        effort: "max",
      })
    ).toEqual(defaultAssistantSettings())
  })

  it("rehydrates stored settings after a reload", () => {
    setAssistantSettings({
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })
    const saved = localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
    resetAssistantSettings()
    expect(getAssistantSettings()).toEqual(defaultAssistantSettings())
    localStorage.setItem(ASSISTANT_SETTINGS_STORAGE_KEY, saved!)
    hydrateAssistantSettings({ force: true })
    expect(getAssistantSettings()).toEqual({
      model: "grok-4.5",
      access: "read-only",
      effort: "high",
    })
  })

  it("migrates a stored model that this chat cannot use back to Grok", () => {
    localStorage.setItem(
      ASSISTANT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        model: "muse-spark-1.3",
        access: "supervised",
        effort: "medium",
      })
    )

    hydrateAssistantSettings({ force: true })

    expect(getAssistantSettings().model).toBe("grok-4.6")
  })

  it("falls back to defaults when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied")
    })
    hydrateAssistantSettings({ force: true })
    expect(getAssistantSettings()).toEqual(defaultAssistantSettings())
  })

  it("treats Grok as the connected chat models", () => {
    expect(isXaiAssistantModel("grok-4.6")).toBe(true)
    expect(isXaiAssistantModel("grok-4.5")).toBe(true)
    expect(modelSupportsEffort("grok-4.6")).toBe(true)
    expect(modelSupportsEffort("grok-4.5")).toBe(true)
    expect(isXaiAssistantModel("gpt-6-astra")).toBe(false)
  })
})
