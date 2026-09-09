import { Link } from "react-router"
import {
  Bot,
  Check,
  CircleHelp,
  Link2,
  ListChecks,
  MessageSquare,
  PartyPopper,
  Workflow,
  X,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"

import { setAssistantOpen } from "@/features/assistant/model/open-store"

import {
  onboardingItems,
  type OnboardingItem,
  type OnboardingItemId,
} from "../model/onboarding"
import {
  completeOnboardingItem,
  dismissOnboarding,
  getOnboardingProgress,
  useOnboarding,
} from "../model/onboarding-store"

const itemIcon = {
  "connect-integration": Link2,
  "create-workflow": Workflow,
  "invite-or-agent": Bot,
  "try-template": CircleHelp,
  "open-assistant": MessageSquare,
} as const

function ChecklistRow({
  item,
  done,
}: {
  item: OnboardingItem
  done: boolean
}) {
  const Icon = itemIcon[item.id]

  function markDone() {
    completeOnboardingItem(item.id)
  }

  function openAssistant() {
    setAssistantOpen(true)
    completeOnboardingItem("open-assistant")
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between",
        done && "opacity-70"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
            done ? "border-primary/30 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
          aria-hidden
        >
          {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
        </span>
        <div className="min-w-0">
          <p className={cn("text-sm font-medium", done && "line-through decoration-muted-foreground/60")}>
            {item.title}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {done ? (
          <span className="text-xs font-medium text-muted-foreground">Done</span>
        ) : (
          <>
            {item.action === "assistant" ? (
              <Button size="sm" variant="outline" onClick={openAssistant}>
                {item.cta}
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link to={item.href!} onClick={() => completeOnboardingItem(item.id)}>
                  {item.cta}
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={markDone}>
              Mark done
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

export function OnboardingChecklist() {
  const snapshot = useOnboarding()
  const { done, total, percent, allDone } = getOnboardingProgress(snapshot)

  if (snapshot.dismissed) {
    return null
  }

  return (
    <section
      aria-labelledby="onboarding-checklist-title"
      className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            {allDone ? (
              <PartyPopper className="size-4" aria-hidden />
            ) : (
              <ListChecks className="size-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <h2 id="onboarding-checklist-title" className="text-sm font-medium">
              {allDone ? "You're all set" : "Getting started"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {allDone
                ? "First-run checklist complete. You can dismiss this anytime."
                : "A short checklist to stand up your workspace."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss getting started checklist"
          onClick={() => dismissOnboarding()}
        >
          <X />
        </Button>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {done} of {total} complete
          </span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} aria-label={`Onboarding progress ${percent} percent`} />
      </div>

      {allDone ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
          <p className="text-sm font-medium">Nice work</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Integrations, workflows, teams, guides, and Assistant are ready when you need them.
          </p>
          <Button className="mt-4" size="sm" variant="outline" onClick={() => dismissOnboarding()}>
            Dismiss checklist
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {onboardingItems.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              done={Boolean(snapshot.completed[item.id as OnboardingItemId])}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
