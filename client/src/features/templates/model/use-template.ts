import {
  createConversation,
  saveConversation,
} from "@/features/assistant/model/store"
import { createTeam, saveTeam } from "@/features/teams/model/store"
import { createVantegNode } from "@/features/workflows/model/create-node"
import { createDraft, saveWorkflow } from "@/features/workflows/model/store"
import type { VantegEdge, VantegNode } from "@/features/workflows/model/types"

import { rememberTemplateId } from "./recent"
import type { SubTemplate } from "./types"

export type UseTemplateResult =
  | { kind: "assistant"; path: string; id: string }
  | { kind: "workflow"; path: string; id: string }
  | { kind: "team"; path: string; id: string }

function stubWorkflowGraph(nodeIds: string[]): {
  nodes: VantegNode[]
  edges: VantegEdge[]
} {
  const ids = nodeIds.length > 0 ? nodeIds : ["manual"]
  const nodes = ids.map((catalogId, index) =>
    createVantegNode(catalogId, { x: 80 + index * 240, y: 160 })
  )
  const edges: VantegEdge[] = []
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const source = nodes[index]!
    const target = nodes[index + 1]!
    edges.push({
      id: crypto.randomUUID(),
      source: source.id,
      target: target.id,
    })
  }
  return { nodes, edges }
}

export function useTemplate(template: SubTemplate): UseTemplateResult {
  rememberTemplateId(template.id)

  if (template.type === "assistant") {
    const conversation = createConversation(template.title)
    saveConversation(conversation.id, { titleLocked: true })
    return {
      kind: "assistant",
      id: conversation.id,
      path: `/assistant/${conversation.id}`,
    }
  }

  if (template.type === "workflow") {
    const draft = createDraft()
    const graph = stubWorkflowGraph(template.workflowNodeIds ?? ["manual"])
    saveWorkflow(draft.id, {
      name: template.title,
      nodes: graph.nodes,
      edges: graph.edges,
      status: "draft",
    })
    return { kind: "workflow", id: draft.id, path: `/workflows/${draft.id}` }
  }

  const team = createTeam(template.title)
  saveTeam(team.id, { description: template.description })
  return { kind: "team", id: team.id, path: `/teams/${team.id}` }
}
