import { useState, type FormEvent } from "react"
import { Bot, Plus } from "lucide-react"
import { matchPath, useLocation, useNavigate } from "react-router"

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

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createAgent, getAgent, useAgents } from "./model/store"
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

  function openCreate() {
    setName("")
    setPromptOpen(true)
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const agent = createAgent(name)
    setPromptOpen(false)
    setName("")
    navigate(`/agents/${agent.id}`)
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
                <AgentList agents={agents} selectedId={selected?.id} />
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
                    ? "This agent is not in the workspace."
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
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <form onSubmit={submitPrompt} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>New agent</DialogTitle>
              <DialogDescription>Enter a name to create a new agent.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="new-agent-name">Name</Label>
              <Input
                id="new-agent-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Agent name"
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPromptOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
