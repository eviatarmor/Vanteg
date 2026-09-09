import { Link } from "react-router"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  Home,
  Inbox,
  Minus,
  Play,
  Sparkles,
  Workflow,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
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

import { getHomeStats, type HomeStat } from "./model/stats"
import { homeSuggestions } from "./model/suggestions"

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

export function HomePage() {
  const { title, subtitle } = getPageCopy("/")
  usePendingInbox()
  useAgents()
  useTeams()
  useWorkflows()
  const stats = getHomeStats()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Home} />
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto px-6 py-6">
        <section className="grid gap-3">
          <h2 className="text-sm font-medium">Overview</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <OverviewStat key={stat.id} stat={stat} />
            ))}
          </div>
        </section>

        <section className="grid max-w-2xl gap-3">
          <div>
            <h2 className="text-sm font-medium">Suggested for you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vanteg noticed work you could automate.
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
                    <Sparkles className="size-3.5 text-muted-foreground" />
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
