import { useState, type FormEvent } from "react"
import { Bot, Plus } from "lucide-react"
import { matchPath, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createAgent, getAgent, useAgents } from "./model/store"
import type { Agent } from "./model/types"
import { validateAgentName } from "./model/validate"
import { AgentForm } from "./ui/AgentForm"
import { AgentList } from "./ui/AgentList"

function selectedAgent(agentId: string | undefined) {
  if (!agentId) {
    return undefined
  }
  return getAgent(agentId)
}

function agentEmptyTitle(agentId: string | undefined) {
  if (agentId) {
    return "Agent not found"
  }
  return "Select an agent"
}

function agentEmptyDescription(
  agentId: string | undefined,
  agentCount: number
) {
  if (agentId) {
    return "This agent is not in the workspace. It may have been deleted."
  }
  if (agentCount === 0) {
    return "Create your first agent to personalize instructions, tools, and memory."
  }
  return "Personalize an agent and assign memory bases, knowledge bases, and workflows."
}

function applyPromptOpenChange(
  open: boolean,
  pending: boolean,
  setPromptOpen: (open: boolean) => void,
  setName: (value: string) => void,
  setNameError: (value: string | undefined) => void,
  setPending: (value: boolean) => void
) {
  if (!open && pending) {
    return
  }
  setPromptOpen(open)
  if (!open) {
    setName("")
    setNameError(undefined)
    setPending(false)
  }
}

function handleAgentNameChange(
  value: string,
  nameError: string | undefined,
  setName: (value: string) => void,
  setNameError: (value: string | undefined) => void
) {
  setName(value)
  if (nameError) {
    setNameError(validateAgentName(value))
  }
}

async function submitNewAgent({
  event,
  name,
  setNameError,
  setPending,
  setPromptOpen,
  setName,
  navigate,
}: {
  event: FormEvent<HTMLFormElement>
  name: string
  setNameError: (value: string | undefined) => void
  setPending: (value: boolean) => void
  setPromptOpen: (open: boolean) => void
  setName: (value: string) => void
  navigate: (path: string) => void
}) {
  event.preventDefault()
  const error = validateAgentName(name)
  setNameError(error)
  if (error) {
    toast.error(error)
    return
  }

  setPending(true)
  try {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const agent = createAgent(name)
    setPromptOpen(false)
    setName("")
    setNameError(undefined)
    toast.success(`Created ${agent.name}`)
    navigate(`/agents/${agent.id}`)
  } finally {
    setPending(false)
  }
}

function AgentNameError({ message }: { message: string | undefined }) {
  if (!message) {
    return null
  }
  return (
    <p
      id="new-agent-name-error"
      className="text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  )
}

function CreateAgentSubmitLabel({ pending }: { pending: boolean }) {
  if (!pending) {
    return "Create"
  }
  return (
    <>
      <Spinner data-icon="inline-start" />
      Creating…
    </>
  )
}

function nameErrorDescribedBy(nameError: string | undefined) {
  if (!nameError) {
    return undefined
  }
  return "new-agent-name-error"
}

function AgentDetailPane({
  selected,
  agentId,
  agentCount,
  onCreate,
}: {
  selected: Agent | undefined
  agentId: string | undefined
  agentCount: number
  onCreate: () => void
}) {
  if (selected) {
    return <AgentForm key={selected.id} agent={selected} />
  }
  return (
    <EmptyState
      icon={Bot}
      title={agentEmptyTitle(agentId)}
      description={agentEmptyDescription(agentId, agentCount)}
      actionLabel="New agent"
      onCreate={onCreate}
      className="min-h-0 flex-1"
    />
  )
}

function CreateAgentDialog({
  promptOpen,
  name,
  nameError,
  pending,
  onOpenChange,
  onNameChange,
  onSubmit,
}: {
  promptOpen: boolean
  name: string
  nameError: string | undefined
  pending: boolean
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={promptOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>New agent</DialogTitle>
            <DialogDescription>
              Enter a name to create a new agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-agent-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-agent-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Agent name"
              autoComplete="off"
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameErrorDescribedBy(nameError)}
              disabled={pending}
            />
            <AgentNameError message={nameError} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              <CreateAgentSubmitLabel pending={pending} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AgentSidebar({
  agents,
  selectedId,
  onCreate,
}: {
  agents: Agent[]
  selectedId: string | undefined
  onCreate: () => void
}) {
  return (
    <>
      <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Agents
      </div>
      <ScrollFade className="min-h-0 min-w-0 flex-1">
        <AgentList
          agents={agents}
          selectedId={selectedId}
          onCreate={onCreate}
        />
      </ScrollFade>
    </>
  )
}

export function AgentsPage() {
  const { title, subtitle } = getPageCopy("/agents")
  const location = useLocation()
  const agentId = matchPath("/agents/:agentId", location.pathname)?.params
    .agentId
  const agents = useAgents()
  const navigate = useNavigate()
  const selected = selectedAgent(agentId)
  const [promptOpen, setPromptOpen] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  function openCreate() {
    setName("")
    setNameError(undefined)
    setPending(false)
    setPromptOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={Bot}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus />
            New agent
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1">
        <ResizableSidebar
          id="agents-sidebar"
          sidebar={
            <AgentSidebar
              agents={agents}
              selectedId={selected?.id}
              onCreate={openCreate}
            />
          }
        >
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            <AgentDetailPane
              selected={selected}
              agentId={agentId}
              agentCount={agents.length}
              onCreate={openCreate}
            />
          </section>
        </ResizableSidebar>
      </div>
      <CreateAgentDialog
        promptOpen={promptOpen}
        name={name}
        nameError={nameError}
        pending={pending}
        onOpenChange={(open) =>
          applyPromptOpenChange(
            open,
            pending,
            setPromptOpen,
            setName,
            setNameError,
            setPending
          )
        }
        onNameChange={(value) =>
          handleAgentNameChange(value, nameError, setName, setNameError)
        }
        onSubmit={(event) =>
          void submitNewAgent({
            event,
            name,
            setNameError,
            setPending,
            setPromptOpen,
            setName,
            navigate,
          })
        }
      />
    </div>
  )
}
