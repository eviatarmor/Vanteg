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
import { validateAgentName } from "./model/validate"
import { AgentForm } from "./ui/AgentForm"
import { AgentList } from "./ui/AgentList"

export function AgentsPage() {
  const { title, subtitle } = getPageCopy("/agents")
  const location = useLocation()
  const agentId = matchPath("/agents/:agentId", location.pathname)?.params.agentId
  const agents = useAgents()
  const navigate = useNavigate()
  const selected = agentId ? getAgent(agentId) : undefined
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

  function handlePromptOpenChange(open: boolean) {
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

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
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
            <>
              <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Agents
              </div>
              <ScrollFade className="min-h-0 min-w-0 flex-1">
                <AgentList
                  agents={agents}
                  selectedId={selected?.id}
                  onCreate={openCreate}
                />
              </ScrollFade>
            </>
          }
        >
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            {selected ? (
              <AgentForm key={selected.id} agent={selected} />
            ) : (
              <EmptyState
                icon={Bot}
                title={agentId ? "Agent not found" : "Select an agent"}
                description={
                  agentId
                    ? "This agent is not in the workspace. It may have been deleted."
                    : agents.length === 0
                      ? "Create your first agent to personalize instructions, tools, and memory."
                      : "Personalize an agent and assign memory bases, knowledge bases, and workflows."
                }
                actionLabel="New agent"
                onCreate={openCreate}
                className="min-h-0 flex-1"
              />
            )}
          </section>
        </ResizableSidebar>
      </div>
      <Dialog open={promptOpen} onOpenChange={handlePromptOpenChange}>
        <DialogContent>
          <form onSubmit={submitPrompt} className="grid gap-4" noValidate>
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
                onChange={(event) => {
                  setName(event.target.value)
                  if (nameError) {
                    setNameError(validateAgentName(event.target.value))
                  }
                }}
                placeholder="Agent name"
                autoComplete="off"
                required
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "new-agent-name-error" : undefined}
                disabled={pending}
              />
              {nameError ? (
                <p
                  id="new-agent-name-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {nameError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePromptOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
