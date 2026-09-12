import { matchPath } from "react-router"

import { getPageTitle } from "../../shell/model/catalog"
import { toChatContext } from "../../workflows/model/chat-context"
import { getWorkflow } from "../../workflows/model/store"

import { accessGuidance, type AssistantAccessMode } from "./settings"
import {
  defaultAssistantSuggestions,
  workflowAssistantSuggestions,
  type AssistantChatContext,
} from "./types"

export function buildAssistantContext(pathname: string): AssistantChatContext {
  const editor = matchPath("/workflows/:workflowId", pathname)
  const workflowId = editor?.params.workflowId
  const workflow = workflowId ? getWorkflow(workflowId) : undefined

  return {
    path: pathname,
    pageTitle: getPageTitle(pathname),
    workflow: workflow ? toChatContext(workflow) : undefined,
  }
}

export function suggestionsForPath(pathname: string): readonly string[] {
  if (matchPath("/workflows/:workflowId", pathname)) {
    return workflowAssistantSuggestions
  }
  if (pathname.startsWith("/data")) {
    return [
      "How do I add a column?",
      "What belongs in variables vs secrets?",
      "Explain this data page",
    ]
  }
  if (pathname.startsWith("/integrations")) {
    return [
      "When do I use a credential vs an API key?",
      "How do webhooks trigger workflows?",
    ]
  }
  if (pathname.startsWith("/api-keys")) {
    return [
      "When do I use a credential vs an API key?",
      "How do I call Vanteg with an API key?",
    ]
  }
  if (pathname.startsWith("/memory") || pathname.startsWith("/agents")) {
    return [
      "What is a memory base?",
      "How should I assign knowledge to an agent?",
    ]
  }
  return defaultAssistantSuggestions
}

export function buildSystemPrompt(
  context?: AssistantChatContext,
  access: AssistantAccessMode = "supervised"
): string {
  const lines = [
    "You are Vanteg, an assistant for the Vanteg workspace.",
    "Help with workflows, data, integrations, memory, agents, and the rest of the product.",
    "Be concise.",
    accessGuidance(access),
  ]

  if (context) {
    lines.push(`The user is on ${context.pageTitle} (${context.path}).`)
  }

  const workflow = context?.workflow
  if (workflow) {
    const steps = workflow.steps
    const stepList =
      steps.length === 0
        ? "This workflow has no steps yet."
        : steps
            .map(
              (step, index) => `${index + 1}. ${step.label} (${step.catalogId})`
            )
            .join("\n")
    lines.push(
      `They are editing workflow: ${workflow.name}`,
      "Steps:",
      stepList
    )
  }

  return lines.join("\n")
}
