import { useState, type FormEvent } from "react"
import { Plus, Users } from "lucide-react"
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

import { createTeam, getTeam, useTeams } from "./model/store"
import { TeamCanvas } from "./ui/TeamCanvas"
import { TeamList } from "./ui/TeamList"

export function TeamsPage() {
  const { title, subtitle } = getPageCopy("/teams")
  const location = useLocation()
  const teamId = matchPath("/teams/:teamId", location.pathname)?.params.teamId
  const teams = useTeams()
  const navigate = useNavigate()
  const selected = teamId ? getTeam(teamId) : undefined
  const [promptOpen, setPromptOpen] = useState(false)
  const [name, setName] = useState("")

  function openCreate() {
    setName("")
    setPromptOpen(true)
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const team = createTeam(name)
    setPromptOpen(false)
    setName("")
    navigate(`/teams/${team.id}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={Users}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus />
            New team
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1">
        <ResizableSidebar
          id="teams-sidebar"
          sidebar={
            <>
              <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Teams
              </div>
              <ScrollFade className="min-h-0 min-w-0 flex-1">
                <TeamList teams={teams} selectedId={selected?.id} />
              </ScrollFade>
            </>
          }
        >
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {selected ? (
              <>
                <header className="flex h-10 shrink-0 items-center border-b px-4 text-sm">
                  <span className="font-medium">{selected.name}</span>
                </header>
                <TeamCanvas key={selected.id} team={selected} />
              </>
            ) : (
              <EmptyState
                icon={Users}
                title={teamId ? "Team not found" : "Select a team"}
                description={
                  teamId
                    ? "This team is not in the workspace."
                    : "Combine agents into a graph — a lead SWE can orchestrate seniors, juniors, and reviewers."
                }
                actionLabel="New team"
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
              <DialogTitle>New team</DialogTitle>
              <DialogDescription>Enter a name to create a new team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="new-team-name">Name</Label>
              <Input
                id="new-team-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Team name"
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
