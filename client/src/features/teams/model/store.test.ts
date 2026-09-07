import { beforeEach, describe, expect, it } from "vitest"

import {
  addTeamMember,
  connectTeamMembers,
  createTeam,
  getTeam,
  getTeamSnapshot,
  resetTeams,
} from "./store"

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
  })

  it("adds an agent member to the selected team", () => {
    const node = addTeamMember("team-swe", "agent-research", "Researcher")
    const team = getTeam("team-swe")
    expect(node?.data).toEqual({ agentId: "agent-research", role: "Researcher" })
    expect(team?.nodes.some((item) => item.id === node?.id)).toBe(true)
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
