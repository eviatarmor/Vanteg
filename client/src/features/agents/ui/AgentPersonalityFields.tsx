import { ExternalLink } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  agentCapabilities,
  type AgentCapabilityId,
} from "../model/capabilities"
import { agentIcons } from "../model/icons"
import { AgentIcon } from "./AgentIcon"
import { AgentModelSelect } from "./AgentModelSelect"
import type { AgentDraft } from "./agent-draft"
import type { AgentModel } from "../model/types"

export function AgentPersonalityFields({
  draft,
  pending,
  nameError,
  onPatch,
  onNameChange,
  onToggleCapability,
}: {
  draft: AgentDraft
  pending: boolean
  nameError?: string
  onPatch: (patch: Partial<AgentDraft>) => void
  onNameChange: (value: string) => void
  onToggleCapability: (id: AgentCapabilityId) => void
}) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <Label id="agent-icon-label">Icon</Label>
        <div
          role="radiogroup"
          aria-labelledby="agent-icon-label"
          className="flex flex-wrap gap-1.5"
        >
          {agentIcons.map((icon) => {
            const selected = draft.icon === icon.id
            return (
              <button
                key={icon.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={icon.label}
                disabled={pending}
                className={
                  selected
                    ? "flex size-8 items-center justify-center rounded-lg border border-foreground bg-muted"
                    : "flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted/70"
                }
                onClick={() => onPatch({ icon: icon.id })}
              >
                <AgentIcon id={icon.id} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agent-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="agent-name"
          value={draft.name}
          required
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "agent-name-error" : undefined}
          disabled={pending}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {nameError ? (
          <p id="agent-name-error" className="text-sm text-destructive" role="alert">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agent-description">Description</Label>
        <Input
          id="agent-description"
          value={draft.description}
          placeholder="What this agent is for"
          disabled={pending}
          onChange={(event) => onPatch({ description: event.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agent-instructions">System prompt</Label>
        <Textarea
          id="agent-instructions"
          rows={6}
          value={draft.instructions}
          placeholder="How the agent should behave"
          disabled={pending}
          onChange={(event) => onPatch({ instructions: event.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Sent as the agent's system instructions on every turn.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agent-model">Model</Label>
        <AgentModelSelect
          value={draft.model}
          onChange={(model: AgentModel) => onPatch({ model })}
        />
      </div>

      <div className="grid gap-2">
        <Label id="agent-capabilities-label">Tools & capabilities</Label>
        <p className="text-xs text-muted-foreground">
          Toggle which tools this agent may use at runtime.
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby="agent-capabilities-label"
        >
          {agentCapabilities.map((capability) => {
            const selected = draft.capabilityIds.includes(capability.id)
            return (
              <button
                key={capability.id}
                type="button"
                disabled={pending}
                aria-pressed={selected}
                title={capability.description}
                onClick={() => onToggleCapability(capability.id)}
                className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
              >
                <Badge
                  variant={selected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer select-none",
                    !selected && "bg-card"
                  )}
                >
                  {capability.label}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm">
        <p className="font-medium">Connectors</p>
        <p className="mt-1 text-xs text-muted-foreground">
          App credentials and OAuth connectors live under Connectors.
          Wire them into workflows this agent can start.
        </p>
        <Button asChild variant="link" className="mt-1 h-auto px-0">
          <Link to="/integrations">
            Open Connectors
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
