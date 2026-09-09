import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  Home,
  Inbox,
  LayoutTemplate,
  MessageSquare,
  Minus,
  Play,
  Plus,
  Sparkles,
  Workflow,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@workspace/ui/components/stat"

import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"
import { useAgents } from "@/features/agents/model/store"
import { usePendingInbox } from "@/features/inbox/model/store"
import { useTeams } from "@/features/teams/model/store"
import { useWorkflows } from "@/features/workflows/model/store"

import {
  humanizeHomeLoadError,
  loadHomeOverview,
  type HomeLoadStatus,
} from "./model/load"
import { getHomeStats, type HomeStat } from "./model/stats"
import { homeSuggestions } from "./model/suggestions"
import { OnboardingChecklist } from "./ui/OnboardingChecklist"

const trendIcon = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
} as const

const statIcon = {
  waiting: Inbox,
  runs: Play,
  agents: Bot,
  workflows: Workflow,
} as const

function OverviewStat({ stat }: { stat: HomeStat }) {
  const TrendIcon = trendIcon[stat.trend]
  const Icon = statIcon[stat.id as keyof typeof statIcon] ?? Sparkles

  return (
    <Stat>
      <StatLabel>{stat.label}</StatLabel>
      <StatIndicator variant="icon" color={stat.indicator}>
        <Icon />
      </StatIndicator>
      <StatValue>{stat.value}</StatValue>
      <StatTrend trend={stat.trend}>
        <TrendIcon />
        {stat.trendLabel}
      </StatTrend>
      <StatDescription>{stat.description}</StatDescription>
    </Stat>
  )
}

function OverviewStatSkeleton() {
  return (
    <Stat aria-hidden>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="mt-1 h-8 w-16" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-36" />
    </Stat>
  )
}

function HomeStatsSkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      data-testid="home-stats-skeleton"
      aria-busy="true"
      aria-label="Loading workspace stats"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <OverviewStatSkeleton key={index} />
      ))}
    </div>
  )
}

export function HomePage() {
  const { title, subtitle } = getPageCopy("/")
  usePendingInbox()
  useAgents()
  useTeams()
  useWorkflows()
  const stats = getHomeStats()
  const [status, setStatus] = useState<HomeLoadStatus>("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(() => {
    setStatus("loading")
    setErrorMessage(null)
    void loadHomeOverview()
      .then(() => {
        setStatus("ready")
      })
      .catch((error: unknown) => {
        setStatus("error")
        setErrorMessage(humanizeHomeLoadError(error))
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Home} />
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto px-6 py-6">
        <OnboardingChecklist />

        <section className="grid gap-3" aria-label="Quick actions">
          <div>
            <h2 className="text-sm font-medium">Quick actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into templates, the assistant, or create something new.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/templates">
                <LayoutTemplate />
                Templates
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/assistant">
                <MessageSquare />
                Assistant
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/workflows">
                <Plus />
                New workflow
              </Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link to="/agents">
                <Plus />
                New agent
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-medium">Overview</h2>
          {status === "loading" ? <HomeStatsSkeleton /> : null}
          {status === "error" ? (
            <div
              role="alert"
              className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Could not load overview</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {errorMessage ?? humanizeHomeLoadError(null)}
                  </p>
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={load}>
                Try again
              </Button>
            </div>
          ) : null}
          {status === "ready" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <OverviewStat key={stat.id} stat={stat} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="grid max-w-2xl gap-3">
          <div>
            <h2 className="text-sm font-medium">Suggested for you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vanteg noticed work you could automate — pick one and continue.
            </p>
          </div>
          <div className="grid gap-3">
            {homeSuggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Sparkles className="size-3.5 text-muted-foreground" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{suggestion.body}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <Link to={suggestion.href}>
                    {suggestion.action}
                    <ArrowRight />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
