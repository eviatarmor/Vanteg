import type { WorkflowChatContext } from "@/features/assistant/model/types"
import type { Workflow } from "./types"

export function toChatContext(workflow: Workflow): WorkflowChatContext {
  return {
    id: workflow.id,
    name: workflow.name,
    steps: workflow.nodes.map((node) => ({
      label: node.data.label,
      catalogId: node.data.catalogId,
    })),
  }
}
