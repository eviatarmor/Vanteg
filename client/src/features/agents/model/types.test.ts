import { describe, expect, it } from "vitest"

import {
  agentModels,
  agentProviders,
  getAgentModel,
  modelsByProvider,
} from "./types"

describe("agent models", () => {
  it("lists only the supported companies", () => {
    expect(agentProviders.map((provider) => provider.name)).toEqual([
      "OpenAI",
      "Anthropic",
      "Google",
      "xAI",
      "Moonshot",
      "Z.ai",
      "Meta",
    ])
  })

  it("groups every model under one of those companies", () => {
    const providerIds = new Set(agentProviders.map((provider) => provider.id))
    expect(agentModels.length).toBeGreaterThan(agentProviders.length)
    for (const model of agentModels) {
      expect(providerIds.has(model.provider)).toBe(true)
    }
    expect(modelsByProvider().map((group) => group.provider.name)).toEqual(
      agentProviders.map((provider) => provider.name)
    )
  })

  it("keeps Grok 4.6 as a selectable xAI model", () => {
    expect(getAgentModel("grok-4.6")).toMatchObject({
      value: "grok-4.6",
      label: "Grok 4.6",
      provider: "xai",
    })
  })
})
