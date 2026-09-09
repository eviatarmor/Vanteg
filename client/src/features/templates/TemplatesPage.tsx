import { useEffect, useMemo, useState } from "react"
import {
  LayoutTemplate,
  Search,
  AlertCircle,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import {
  filterTemplates,
  getIndustry,
  listIndustries,
  loadCatalog,
} from "./model/catalog"
import type {
  Industry,
  IndustryId,
  SubTemplate,
  TemplateType,
  TemplateTypeFilter,
} from "./model/types"
import { TemplateCard } from "./ui/TemplateCard"
import { TemplateDetail } from "./ui/TemplateDetail"
import { TemplatesSkeleton } from "./ui/TemplatesSkeleton"

const TYPE_FILTERS: { id: TemplateTypeFilter; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "assistant", label: "Assistant" },
  { id: "workflow", label: "Workflow" },
  { id: "team", label: "Team" },
]

export function TemplatesPage() {
  const navigate = useNavigate()
  const { industryId: industryParam } = useParams<{ industryId?: string }>()
  const { title, subtitle } = getPageCopy("/templates")

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<TemplateTypeFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const industryFilter: IndustryId | "all" = useMemo(() => {
    if (!industryParam) {
      return "all"
    }
    return industries.some((item) => item.id === industryParam)
      ? (industryParam as IndustryId)
      : "all"
  }, [industryParam, industries])

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setErrorMessage(null)
    loadCatalog()
      .then((data) => {
        if (cancelled) {
          return
        }
        setIndustries(data)
        setStatus("ready")
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        setStatus("error")
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load templates"
        )
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visible = useMemo(
    () =>
      filterTemplates({
        industryId: industryFilter,
        type: typeFilter === "all" ? "all" : (typeFilter as TemplateType),
        query,
      }),
    [industryFilter, typeFilter, query]
  )

  const selected: SubTemplate | null = useMemo(() => {
    const match = selectedId
      ? visible.find((item) => item.id === selectedId)
      : undefined
    return match ?? visible[0] ?? null
  }, [selectedId, visible])

  function selectIndustry(id: IndustryId | "all") {
    navigate(id === "all" ? "/templates" : `/templates/${id}`)
  }

  function retry() {
    setStatus("loading")
    setErrorMessage(null)
    loadCatalog()
      .then((data) => {
        setIndustries(data)
        setStatus("ready")
      })
      .catch((error: unknown) => {
        setStatus("error")
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load templates"
        )
      })
  }

  const industryLabel =
    industryFilter === "all" ? null : getIndustry(industryFilter)?.name

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={title}
        subtitle={
          industryLabel
            ? `${subtitle} Showing ${industryLabel}.`
            : subtitle
        }
        icon={LayoutTemplate}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Industries">
            <IndustryChip
              label="All industries"
              active={industryFilter === "all"}
              onClick={() => selectIndustry("all")}
            />
            {(industries.length > 0 ? industries : listIndustries()).map(
              (industry) => (
                <IndustryChip
                  key={industry.id}
                  label={industry.name}
                  active={industryFilter === industry.id}
                  onClick={() => selectIndustry(industry.id)}
                />
              )
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates"
                aria-label="Search templates"
                className="pl-9"
              />
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by type"
            >
              {TYPE_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  type="button"
                  size="sm"
                  variant={typeFilter === filter.id ? "default" : "outline"}
                  aria-pressed={typeFilter === filter.id}
                  onClick={() => setTypeFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {status === "loading" ? <TemplatesSkeleton /> : null}

        {status === "error" ? (
          <div
            role="alert"
            className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
          >
            <AlertCircle className="size-8 text-destructive" aria-hidden />
            <p className="mt-3 text-sm font-medium">Could not load templates</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {errorMessage ?? "Something went wrong."}
            </p>
            <Button className="mt-4" variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : null}

        {status === "ready" && visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No templates match"
            description="Try another industry, type, or search term. Clear search or pick All industries to reset."
          />
        ) : null}

        {status === "ready" && visible.length > 0 ? (
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="min-h-0 overflow-y-auto pr-1">
              <div
                className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                data-testid="templates-grid"
              >
                {visible.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={template.id === selectedId}
                    onSelect={(item) => setSelectedId(item.id)}
                  />
                ))}
              </div>
            </div>
            <TemplateDetail
              template={selected}
              onNavigate={(path) => navigate(path)}
              className="min-h-[22rem] lg:min-h-0"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function IndustryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
