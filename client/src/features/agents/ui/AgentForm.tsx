import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"

import { useMemoryStore } from "@/features/memory/model/store"
import { listWorkflows, useWorkflows } from "@/features/workflows/model/store"

import { agentIcons } from "../model/icons"
import { saveAgent, toggleAgentAssignment } from "../model/store"
import { agentModels, type Agent } from "../model/types"
import { AgentIcon } from "./AgentIcon"

export function AgentForm({ agent }: { agent: Agent }) {
  const memory = useMemoryStore()
  useWorkflows()
  const workflows = listWorkflows()

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8 p-6">
      <section className="grid gap-4">
        <h2 className="text-sm font-medium">Personality</h2>
        <div className="grid gap-2">
          <Label id="agent-icon-label">Icon</Label>
          <div
            role="radiogroup"
            aria-labelledby="agent-icon-label"
            className="flex flex-wrap gap-1.5"
          >
            {agentIcons.map((icon) => {
              const selected = agent.icon === icon.id
              return (
                <button
                  key={icon.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={icon.label}
                  className={
                    selected
                      ? "flex size-8 items-center justify-center rounded-lg border border-foreground bg-muted"
                      : "flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted/70"
                  }
                  onClick={() => saveAgent(agent.id, { icon: icon.id })}
                >
                  <AgentIcon id={icon.id} />
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-name">Name</Label>
          <Input
            id="agent-name"
            value={agent.name}
            onChange={(event) => saveAgent(agent.id, { name: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-description">Description</Label>
          <Input
            id="agent-description"
            value={agent.description}
            placeholder="What this agent is for"
            onChange={(event) =>
              saveAgent(agent.id, { description: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-instructions">Instructions</Label>
          <Textarea
            id="agent-instructions"
            rows={6}
            value={agent.instructions}
            placeholder="How the agent should behave"
            onChange={(event) =>
              saveAgent(agent.id, { instructions: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-model">Model</Label>
          <Select
            value={agent.model}
            onValueChange={(value) => {
              if (!value) {
                return
              }
              saveAgent(agent.id, { model: value as Agent["model"] })
            }}
          >
            <SelectTrigger id="agent-model" className="w-full" aria-label="Model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <AssignmentGroup
        title="Memory bases"
        description="Shared memories this agent can read and write."
        empty="No memory bases yet."
        items={memory.bases.map((base) => ({
          id: base.id,
          label: base.name,
          hint: base.description,
          checked: agent.memoryBaseIds.includes(base.id),
        }))}
        onToggle={(id, checked) =>
          toggleAgentAssignment(agent.id, "memoryBaseIds", id, checked)
        }
      />

      <AssignmentGroup
        title="Knowledge bases"
        description="Uploaded files retrieved as context."
        empty="No knowledge bases yet."
        items={memory.knowledgeBases.map((base) => ({
          id: base.id,
          label: base.name,
          hint: `${memory.documents.filter((document) => document.knowledgeBaseId === base.id).length} files`,
          checked: agent.knowledgeBaseIds.includes(base.id),
        }))}
        onToggle={(id, checked) =>
          toggleAgentAssignment(agent.id, "knowledgeBaseIds", id, checked)
        }
      />

      <AssignmentGroup
        title="Workflows"
        description="Automations this agent can start or inspect."
        empty="No workflows yet. Create one from Workflows."
        items={workflows.map((workflow) => ({
          id: workflow.id,
          label: workflow.name,
          hint: workflow.status,
          checked: agent.workflowIds.includes(workflow.id),
        }))}
        onToggle={(id, checked) =>
          toggleAgentAssignment(agent.id, "workflowIds", id, checked)
        }
      />
    </div>
  )
}

function AssignmentGroup({
  title,
  description,
  empty,
  items,
  onToggle,
}: {
  title: string
  description: string
  empty: string
  items: { id: string; label: string; hint?: string; checked: boolean }[]
  onToggle: (id: string, checked: boolean) => void
}) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-2">
                <Checkbox
                  className="mt-0.5"
                  checked={item.checked}
                  onCheckedChange={(value) => onToggle(item.id, value === true)}
                  aria-label={item.label}
                />
                <span className="min-w-0">
                  <span className="block text-sm">{item.label}</span>
                  {item.hint ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
