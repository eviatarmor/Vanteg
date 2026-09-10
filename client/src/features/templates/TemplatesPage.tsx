import { useEffect, useMemo, useState } from "react"
import { LayoutTemplate, Search, AlertCircle } from "lucide-react"
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

function catalogErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "Failed to load templates"
}

function resolveIndustryFilter(
  industryParam: string | undefined,
  industries: Industry[]
): IndustryId | "all" {
  if (!industryParam) {
    return "all"
  }
  if (industries.some((item) => item.id === industryParam)) {
    return industryParam as IndustryId
  }
  return "all"
}

function resolveSelectedTemplate(
  selectedId: string | null,
  visible: SubTemplate[]
): SubTemplate | null {
  if (!selectedId) {
    return visible[0] ?? null
  }
  return visible.find((item) => item.id === selectedId) ?? visible[0] ?? null
}

function industryOptions(industries: Industry[]) {
  if (industries.length > 0) {
    return industries
  }
  return listIndustries()
}

function templatesSubtitle(subtitle: string, industryLabel: string | null) {
  if (!industryLabel) {
    return subtitle
  }
  return `${subtitle} Showing ${industryLabel}.`
}

function industryRoute(id: IndustryId | "all") {
  if (id === "all") {
    return "/templates"
  }
  return `/templates/${id}`
}

function activeIndustryLabel(industryFilter: IndustryId | "all") {
  if (industryFilter === "all") {
    return null
  }
  return getIndustry(industryFilter)?.name ?? null
}

function catalogTypeFilter(
  typeFilter: TemplateTypeFilter
): TemplateType | "all" {
  if (typeFilter === "all") {
    return "all"
  }
  return typeFilter
}

function applyLoadedCatalog(
  cancelled: boolean,
  data: Industry[],
  setIndustries: (data: Industry[]) => void,
  setStatus: (status: "loading" | "ready" | "error") => void
) {
  if (cancelled) {
    return
  }
  setIndustries(data)
  setStatus("ready")
}

function applyCatalogError(
  cancelled: boolean,
  error: unknown,
  setStatus: (status: "loading" | "ready" | "error") => void,
  setErrorMessage: (message: string | null) => void
) {
  if (cancelled) {
    return
  }
  setStatus("error")
  setErrorMessage(catalogErrorMessage(error))
}

function typeButtonVariant(active: boolean) {
  if (active) {
    return "default" as const
  }
  return "outline" as const
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

function IndustryFilters({
  industries,
  industryFilter,
  onSelect,
}: {
  industries: Industry[]
  industryFilter: IndustryId | "all"
  onSelect: (id: IndustryId | "all") => void
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Industries"
    >
      <IndustryChip
        label="All industries"
        active={industryFilter === "all"}
        onClick={() => onSelect("all")}
      />
      {industryOptions(industries).map((industry) => (
        <IndustryChip
          key={industry.id}
          label={industry.name}
          active={industryFilter === industry.id}
          onClick={() => onSelect(industry.id)}
        />
      ))}
    </div>
  )
}

function TypeFilterBar({
  typeFilter,
  onChange,
}: {
  typeFilter: TemplateTypeFilter
  onChange: (id: TemplateTypeFilter) => void
}) {
  return (
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
          variant={typeButtonVariant(typeFilter === filter.id)}
          aria-pressed={typeFilter === filter.id}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}

function TemplatesError({
  errorMessage,
  onRetry,
}: {
  errorMessage: string | null
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <p className="mt-3 text-sm font-medium">Could not load templates</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {errorMessage ?? "Something went wrong."}
      </p>
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

function TemplatesGrid({
  visible,
  selected,
  onSelect,
  onNavigate,
}: {
  visible: SubTemplate[]
  selected: SubTemplate | null
  onSelect: (id: string) => void
  onNavigate: (path: string) => void
}) {
  return (
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
              selected={template.id === selected?.id}
              onSelect={(item) => onSelect(item.id)}
            />
          ))}
        </div>
      </div>
      <TemplateDetail
        template={selected}
        onNavigate={onNavigate}
        className="min-h-[22rem] lg:min-h-0"
      />
    </div>
  )
}

function TemplatesResults({
  status,
  errorMessage,
  visible,
  selected,
  onRetry,
  onSelect,
  onNavigate,
}: {
  status: "loading" | "ready" | "error"
  errorMessage: string | null
  visible: SubTemplate[]
  selected: SubTemplate | null
  onRetry: () => void
  onSelect: (id: string) => void
  onNavigate: (path: string) => void
}) {
  if (status === "loading") {
    return <TemplatesSkeleton />
  }
  if (status === "error") {
    return <TemplatesError errorMessage={errorMessage} onRetry={onRetry} />
  }
  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No templates match"
        description="Try another industry, type, or search term. Clear search or pick All industries to reset."
      />
    )
  }
  return (
    <TemplatesGrid
      visible={visible}
      selected={selected}
      onSelect={onSelect}
      onNavigate={onNavigate}
    />
  )
}

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

  const industryFilter = useMemo(
    () => resolveIndustryFilter(industryParam, industries),
    [industryParam, industries]
  )

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setErrorMessage(null)
    loadCatalog()
      .then((data) =>
        applyLoadedCatalog(cancelled, data, setIndustries, setStatus)
      )
      .catch((error: unknown) =>
        applyCatalogError(cancelled, error, setStatus, setErrorMessage)
      )
    return () => {
      cancelled = true
    }
  }, [])

  const visible = useMemo(
    () =>
      filterTemplates({
        industryId: industryFilter,
        type: catalogTypeFilter(typeFilter),
        query,
      }),
    [industryFilter, typeFilter, query]
  )

  const selected = useMemo(
    () => resolveSelectedTemplate(selectedId, visible),
    [selectedId, visible]
  )

  function selectIndustry(id: IndustryId | "all") {
    navigate(industryRoute(id))
  }

  function retry() {
    setStatus("loading")
    setErrorMessage(null)
    loadCatalog()
      .then((data) => applyLoadedCatalog(false, data, setIndustries, setStatus))
      .catch((error: unknown) =>
        applyCatalogError(false, error, setStatus, setErrorMessage)
      )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={title}
        subtitle={templatesSubtitle(
          subtitle,
          activeIndustryLabel(industryFilter)
        )}
        icon={LayoutTemplate}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
        <div className="flex shrink-0 flex-col gap-3">
          <IndustryFilters
            industries={industries}
            industryFilter={industryFilter}
            onSelect={selectIndustry}
          />
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
            <TypeFilterBar typeFilter={typeFilter} onChange={setTypeFilter} />
          </div>
        </div>

        <TemplatesResults
          status={status}
          errorMessage={errorMessage}
          visible={visible}
          selected={selected}
          onRetry={retry}
          onSelect={setSelectedId}
          onNavigate={(path) => navigate(path)}
        />
      </div>
    </div>
  )
}
