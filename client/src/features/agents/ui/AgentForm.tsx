import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { useMemoryStore } from "@/features/memory/model/store"
import { listWorkflows, useWorkflows } from "@/features/workflows/model/store"
import { CredentialMultiPicker } from "@/features/workflows/ui/CredentialMultiPicker"

import type { AgentCapabilityId } from "../model/capabilities"
import { saveAgent } from "../model/store"
import type { Agent } from "../model/types"
import { validateAgentName } from "../model/validate"
import { sameAgentIds, toAgentDraft, type AgentDraft } from "./agent-draft"
import { AgentPersonalityFields } from "./AgentPersonalityFields"
import { AssignmentGroup } from "./AssignmentGroup"
import { DeleteAgentDialog } from "./DeleteAgentDialog"

export function AgentForm({ agent }: { agent: Agent }) {
  const memory = useMemoryStore()
  useWorkflows()
  const workflows = listWorkflows()
  const navigate = useNavigate()

  const [draft, setDraft] = useState<AgentDraft>(() => toAgentDraft(agent))
  const [nameError, setNameError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setDraft(toAgentDraft(agent))
    setNameError(undefined)
    setPending(false)
  }, [agent])

  const dirty = useMemo(() => {
    const baseline = toAgentDraft(agent)
    return (
      draft.name !== baseline.name ||
      draft.description !== baseline.description ||
      draft.instructions !== baseline.instructions ||
      draft.model !== baseline.model ||
      draft.icon !== baseline.icon ||
      !sameAgentIds(draft.memoryBaseIds, baseline.memoryBaseIds) ||
      !sameAgentIds(draft.knowledgeBaseIds, baseline.knowledgeBaseIds) ||
      !sameAgentIds(draft.workflowIds, baseline.workflowIds) ||
      !sameAgentIds(draft.capabilityIds, baseline.capabilityIds) ||
      !sameAgentIds(draft.credentialIds, baseline.credentialIds)
    )
  }, [agent, draft])

  function patchDraft(patch: Partial<AgentDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function onNameChange(value: string) {
    patchDraft({ name: value })
    if (nameError) {
      setNameError(validateAgentName(value))
    }
  }

  function toggleId(
    field: "memoryBaseIds" | "knowledgeBaseIds" | "workflowIds" | "credentialIds",
    id: string,
    checked: boolean
  ) {
    setDraft((current) => {
      const next = new Set(current[field])
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return { ...current, [field]: [...next] }
    })
  }

  function toggleCapability(id: AgentCapabilityId) {
    setDraft((current) => {
      const next = new Set(current.capabilityIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { ...current, capabilityIds: [...next] }
    })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = validateAgentName(draft.name)
    setNameError(error)
    if (error) {
      toast.error("Fix the highlighted fields.")
      return
    }

    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 160))
      const saved = saveAgent(agent.id, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        instructions: draft.instructions,
        model: draft.model,
        icon: draft.icon,
        memoryBaseIds: draft.memoryBaseIds,
        knowledgeBaseIds: draft.knowledgeBaseIds,
        workflowIds: draft.workflowIds,
        capabilityIds: draft.capabilityIds,
        credentialIds: draft.credentialIds,
      })
      if (!saved) {
        toast.error("Could not save this agent.")
        return
      }
      setDraft(toAgentDraft(saved))
      toast.success("Agent saved.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-6 sm:px-6"
        noValidate
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Personality</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Name, voice, model, and tools for this agent.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>

        <AgentPersonalityFields
          draft={draft}
          pending={pending}
          nameError={nameError}
          onPatch={patchDraft}
          onNameChange={onNameChange}
          onToggleCapability={toggleCapability}
        />

        <AssignmentGroup
          title="Memory bases"
          description="Shared memories this agent can read and write."
          empty="No memory bases yet."
          disabled={pending}
          items={memory.bases.map((base) => ({
            id: base.id,
            label: base.name,
            hint: base.description,
            checked: draft.memoryBaseIds.includes(base.id),
          }))}
          onToggle={(id, checked) => toggleId("memoryBaseIds", id, checked)}
        />

        <AssignmentGroup
          title="Knowledge bases"
          description="Uploaded files retrieved as context."
          empty="No knowledge bases yet."
          disabled={pending}
          items={memory.knowledgeBases.map((base) => ({
            id: base.id,
            label: base.name,
            hint: `${memory.documents.filter((document) => document.knowledgeBaseId === base.id).length} files`,
            checked: draft.knowledgeBaseIds.includes(base.id),
          }))}
          onToggle={(id, checked) => toggleId("knowledgeBaseIds", id, checked)}
        />

        <AssignmentGroup
          title="Workflows"
          description="Automations this agent can start or inspect."
          empty="No workflows yet. Create one from Workflows."
          disabled={pending}
          items={workflows.map((workflow) => ({
            id: workflow.id,
            label: workflow.name,
            hint: workflow.status,
            checked: draft.workflowIds.includes(workflow.id),
          }))}
          onToggle={(id, checked) => toggleId("workflowIds", id, checked)}
        />

        <CredentialMultiPicker
          value={draft.credentialIds}
          onToggle={(id, checked) => toggleId("credentialIds", id, checked)}
        />

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <Button
            type="submit"
            disabled={pending || !dirty}
            aria-disabled={pending || !dirty}
          >
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving…
              </>
            ) : (
              "Save agent"
            )}
          </Button>
        </div>
      </form>

      <DeleteAgentDialog
        agent={agent}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate("/agents")}
      />
    </>
  )
}
