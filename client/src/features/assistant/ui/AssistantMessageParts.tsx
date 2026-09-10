import type { ToolUIPart } from "ai"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint"
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "@/components/ai-elements/confirmation"
import {
  Context,
  ContextContent,
  ContextContentHeader,
  ContextTrigger,
} from "@/components/ai-elements/context"
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationSource,
  InlineCitationText,
} from "@/components/ai-elements/inline-citation"
import { MessageResponse } from "@/components/ai-elements/message"
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
} from "@/components/ai-elements/plan"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Shimmer } from "@/components/ai-elements/shimmer"
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources"
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool"

export type AssistantRenderPart =
  | { type: "text"; text: string }
  | { type: "shimmer"; text: string }
  | { type: "reasoning"; text: string; streaming?: boolean }
  | {
      type: "chain-of-thought"
      steps: {
        label: string
        description?: string
        status?: "complete" | "active" | "pending"
      }[]
    }
  | { type: "checkpoint"; label?: string }
  | {
      type: "confirmation"
      request: string
      state: ToolUIPart["state"]
      approval: { id: string; approved?: boolean }
    }
  | { type: "context"; usedTokens: number; maxTokens: number; modelId?: string }
  | { type: "inline-citation"; text: string; sources: string[] }
  | { type: "plan"; title: string; description?: string; content: string }
  | { type: "sources"; sources: { href: string; title: string }[] }
  | { type: "task"; title: string; items: string[] }
  | {
      type: "tool"
      name: string
      state: ToolUIPart["state"]
      input?: unknown
      output?: unknown
      errorText?: string
    }

function renderPart(part: AssistantRenderPart, index: number) {
  switch (part.type) {
    case "text":
      return <MessageResponse key={index}>{part.text}</MessageResponse>
    case "shimmer":
      return <Shimmer key={index}>{part.text}</Shimmer>
    case "reasoning":
      return (
        <Reasoning key={index} defaultOpen isStreaming={part.streaming}>
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      )
    case "chain-of-thought":
      return (
        <ChainOfThought key={index} defaultOpen>
          <ChainOfThoughtHeader />
          <ChainOfThoughtContent>
            {part.steps.map((step) => (
              <ChainOfThoughtStep
                key={step.label}
                label={step.label}
                description={step.description}
                status={step.status}
              />
            ))}
          </ChainOfThoughtContent>
        </ChainOfThought>
      )
    case "checkpoint":
      return (
        <Checkpoint key={index}>
          <CheckpointIcon />
          <CheckpointTrigger>
            {part.label ?? "Restore checkpoint"}
          </CheckpointTrigger>
        </Checkpoint>
      )
    case "confirmation":
      return (
        <Confirmation key={index} approval={part.approval} state={part.state}>
          <ConfirmationRequest>{part.request}</ConfirmationRequest>
          <ConfirmationAccepted>
            You approved this tool execution
          </ConfirmationAccepted>
          <ConfirmationRejected>
            You rejected this tool execution
          </ConfirmationRejected>
          <ConfirmationActions>
            <ConfirmationAction variant="outline">Reject</ConfirmationAction>
            <ConfirmationAction>Approve</ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      )
    case "context":
      return (
        <Context
          key={index}
          usedTokens={part.usedTokens}
          maxTokens={part.maxTokens}
          modelId={part.modelId}
        >
          <ContextTrigger />
          <ContextContent>
            <ContextContentHeader />
          </ContextContent>
        </Context>
      )
    case "inline-citation":
      return (
        <InlineCitation key={index}>
          <InlineCitationText>{part.text}</InlineCitationText>
          <InlineCitationCard>
            <InlineCitationCardTrigger sources={part.sources} />
            <InlineCitationCardBody>
              {part.sources.map((source) => (
                <InlineCitationSource
                  key={source}
                  url={source}
                  title={source}
                />
              ))}
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      )
    case "plan":
      return (
        <Plan key={index} defaultOpen>
          <PlanHeader>
            <PlanTitle>{part.title}</PlanTitle>
            {part.description ? (
              <PlanDescription>{part.description}</PlanDescription>
            ) : null}
          </PlanHeader>
          <PlanContent>{part.content}</PlanContent>
        </Plan>
      )
    case "sources":
      return (
        <Sources key={index} defaultOpen>
          <SourcesTrigger count={part.sources.length} />
          <SourcesContent>
            {part.sources.map((source) => (
              <Source
                key={source.href}
                href={source.href}
                title={source.title}
              />
            ))}
          </SourcesContent>
        </Sources>
      )
    case "task":
      return (
        <Task key={index} defaultOpen>
          <TaskTrigger title={part.title} />
          <TaskContent>
            {part.items.map((item) => (
              <TaskItem key={item}>{item}</TaskItem>
            ))}
          </TaskContent>
        </Task>
      )
    case "tool":
      return (
        <Tool key={index} defaultOpen>
          <ToolHeader
            type={`tool-${part.name}`}
            state={part.state}
            title={part.name}
          />
          <ToolContent>
            {part.input !== undefined ? <ToolInput input={part.input} /> : null}
            {part.output !== undefined || part.errorText ? (
              <ToolOutput output={part.output} errorText={part.errorText} />
            ) : null}
          </ToolContent>
        </Tool>
      )
  }
}

export function AssistantMessageParts({
  parts,
}: {
  parts: AssistantRenderPart[]
}) {
  return <>{parts.map((part, index) => renderPart(part, index))}</>
}
