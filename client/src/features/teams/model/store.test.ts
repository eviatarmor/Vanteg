import { beforeEach, describe, expect, it } from "vitest"

import {
  addTeamMember,
  connectTeamMembers,
  createTeam,
  getTeam,
  getTeamSnapshot,
  resetTeams,
  updateTeamMember,
} from "./store"
import { resolveMemberRole, roleSelectionFromValue, toggleCapability } from "./types"

describe("teams store", () => {
  beforeEach(() => {
    resetTeams()
  })

  it("seeds a software engineering team that orchestrates lead and senior SWE agents", () => {
    const team = getTeamSnapshot().find((item) => item.id === "team-swe")
    expect(team?.name).toBe("Software engineering")
    expect(team?.nodes.map((node) => node.data.role)).toEqual(
      expect.arrayContaining(["Lead SWE", "Senior SWE"])
    )
    expect(team?.nodes.map((node) => node.data.agentId)).toEqual(
      expect.arrayContaining(["agent-lead-swe", "agent-senior-swe"])
    )
    expect(team?.edges.length).toBeGreaterThan(0)
    expect(team?.nodes[0]?.data.capabilities).toEqual(
      expect.arrayContaining(["Workflows", "Approvals"])
    )
  })

  it("adds an agent member to the selected team", () => {
    const node = addTeamMember("team-swe", "agent-research", "Researcher", [
      "Knowledge",
      "Inbox",
    ])
    const team = getTeam("team-swe")
    expect(node?.data).toEqual({
      agentId: "agent-research",
      role: "Researcher",
      capabilities: ["Knowledge", "Inbox"],
    })
    expect(team?.nodes.some((item) => item.id === node?.id)).toBe(true)
  })

  it("updates member role and capabilities", () => {
    const node = addTeamMember("team-swe", "agent-research", "Specialist")
    updateTeamMember("team-swe", node!.id, {
      role: "Writer",
      capabilities: ["Inbox", "Knowledge"],
    })
    const updated = getTeam("team-swe")?.nodes.find((item) => item.id === node?.id)
    expect(updated?.data.role).toBe("Writer")
    expect(updated?.data.capabilities).toEqual(["Inbox", "Knowledge"])
  })

  it("connects two members for orchestration", () => {
    const team = createTeam("Ops")
    const lead = addTeamMember(team.id, "agent-lead-swe", "Lead")
    const senior = addTeamMember(team.id, "agent-senior-swe", "Senior")
    connectTeamMembers(team.id, lead!.id, senior!.id, "delegates")
    expect(getTeam(team.id)?.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: lead?.id,
          target: senior?.id,
          label: "delegates",
        }),
      ])
    )
  })
})

describe("member role helpers", () => {
  it("resolves presets and custom roles", () => {
    expect(roleSelectionFromValue("Lead")).toEqual({ preset: "Lead", custom: "" })
    expect(roleSelectionFromValue("Lead SWE")).toEqual({
      preset: "Custom",
      custom: "Lead SWE",
    })
    expect(resolveMemberRole("Reviewer", "")).toBe("Reviewer")
    expect(resolveMemberRole("Custom", "  Ops lead  ")).toBe("Ops lead")
  })

  it("toggles capability chips", () => {
    expect(toggleCapability(["Inbox"], "Tools")).toEqual(["Inbox", "Tools"])
    expect(toggleCapability(["Inbox", "Tools"], "Inbox")).toEqual(["Tools"])
  })
})
