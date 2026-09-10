import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { useNavigate, type NavigateFunction } from "react-router"
import { Search, X } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"

import { setAssistantOpen } from "@/features/assistant/model/open-store"
import { createAgent } from "@/features/agents/model/store"
import { createTeam } from "@/features/teams/model/store"
import { createDraft, useWorkflows } from "@/features/workflows/model/store"

import {
  groupSearchHits,
  searchWorkspace,
  type SearchHit,
} from "./model/search"

function shortcutHint(): string {
  if (typeof navigator === "undefined") {
    return "⌘K"
  }
  if (/Mac|iPhone|iPad/.test(navigator.userAgent)) {
    return "⌘K"
  }
  return "Ctrl+K"
}

function isSearchHotkey(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
}

function isOutside(root: HTMLDivElement | null, target: EventTarget | null) {
  if (!root) {
    return false
  }
  return !root.contains(target as Node)
}

function pathToLocation(path: string) {
  const [pathname, search] = path.split("?")
  return {
    pathname: pathname || "/",
    search: search ? `?${search}` : "",
  }
}

function executeSearchHit(hit: SearchHit, navigate: NavigateFunction) {
  if (hit.command === "create-workflow") {
    const workflow = createDraft()
    navigate(`/workflows/${workflow.id}`)
    return
  }
  if (hit.command === "create-agent") {
    const agent = createAgent()
    navigate(`/agents/${agent.id}`)
    return
  }
  if (hit.command === "create-team") {
    const team = createTeam()
    navigate(`/teams/${team.id}`)
    return
  }
  if (hit.command === "open-assistant") {
    setAssistantOpen(true)
    return
  }
  navigate(pathToLocation(hit.path))
}

function handlePaletteKeyDown(
  event: ReactKeyboardEvent<HTMLInputElement>,
  hits: SearchHit[],
  activeIndex: number,
  setOpen: (open: boolean) => void,
  setActiveIndex: (updater: (current: number) => number) => void,
  runHit: (hit: SearchHit) => void,
  input: HTMLInputElement | null
) {
  if (event.key === "ArrowDown") {
    event.preventDefault()
    setOpen(true)
    setActiveIndex((current) =>
      Math.min(current + 1, Math.max(hits.length - 1, 0))
    )
    return
  }
  if (event.key === "ArrowUp") {
    event.preventDefault()
    setActiveIndex((current) => Math.max(current - 1, 0))
    return
  }
  if (event.key === "Enter") {
    event.preventDefault()
    const hit = hits[activeIndex]
    if (hit) {
      runHit(hit)
    }
    return
  }
  if (event.key === "Escape") {
    setOpen(false)
    input?.blur()
  }
}

function activeDescendant(
  open: boolean,
  hits: SearchHit[],
  activeIndex: number,
  listId: string
) {
  if (!open) {
    return undefined
  }
  const hit = hits[activeIndex]
  if (!hit) {
    return undefined
  }
  return `${listId}-${hit.id}`
}

function groupHeading(group: string, trimmedQuery: string) {
  if (group === "Workflows" && !trimmedQuery) {
    return "Recent workflows"
  }
  if (group === "Agents" && !trimmedQuery) {
    return "Recent agents"
  }
  return group
}

function hitOptionClass(selected: boolean) {
  if (selected) {
    return "flex w-full flex-col rounded-md bg-muted px-2 py-1.5 text-left"
  }
  return "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted"
}

function hitGroupStarts(grouped: { hits: SearchHit[] }[]) {
  const starts: number[] = []
  let offset = 0
  for (const entry of grouped) {
    starts.push(offset)
    offset += entry.hits.length
  }
  return starts
}

function SearchFieldAddon({
  query,
  hint,
  onClear,
}: {
  query: string
  hint: string
  onClear: () => void
}) {
  if (query) {
    return (
      <button
        type="button"
        aria-label="Clear search"
        className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        onClick={onClear}
      >
        <X className="size-3.5" />
      </button>
    )
  }
  return (
    <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar-accent px-1.5 py-0.5 font-sans text-[10px] text-sidebar-foreground/55 sm:inline">
      {hint}
    </kbd>
  )
}

function SearchEmptyState({ trimmedQuery }: { trimmedQuery: string }) {
  if (trimmedQuery) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-sm font-medium text-foreground">No results</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {`No matches for “${trimmedQuery}”. Try a page, action, or workflow name.`}
        </p>
      </div>
    )
  }
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-sm font-medium text-foreground">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a workflow or jump to a page to get started.
      </p>
    </div>
  )
}

function SearchHitOption({
  hit,
  listId,
  selected,
  onHover,
  onSelect,
}: {
  hit: SearchHit
  listId: string
  selected: boolean
  onHover: () => void
  onSelect: () => void
}) {
  return (
    <button
      id={`${listId}-${hit.id}`}
      type="button"
      role="option"
      aria-label={hit.title}
      aria-selected={selected}
      className={hitOptionClass(selected)}
      onMouseEnter={onHover}
      onClick={onSelect}
    >
      <span className="truncate text-sm font-medium">{hit.title}</span>
      <span className="truncate text-xs text-muted-foreground">
        {hit.subtitle}
      </span>
    </button>
  )
}

function SearchHitGroup({
  group,
  hits,
  start,
  activeIndex,
  trimmedQuery,
  listId,
  onHover,
  onSelect,
}: {
  group: string
  hits: SearchHit[]
  start: number
  activeIndex: number
  trimmedQuery: string
  listId: string
  onHover: (index: number) => void
  onSelect: (hit: SearchHit) => void
}) {
  return (
    <div className="p-1">
      <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {groupHeading(group, trimmedQuery)}
      </p>
      {hits.map((hit, index) => (
        <SearchHitOption
          key={hit.id}
          hit={hit}
          listId={listId}
          selected={start + index === activeIndex}
          onHover={() => onHover(start + index)}
          onSelect={() => onSelect(hit)}
        />
      ))}
    </div>
  )
}

function SearchPaletteBody({
  hits,
  grouped,
  trimmedQuery,
  activeIndex,
  listId,
  onHover,
  onSelect,
}: {
  hits: SearchHit[]
  grouped: { group: string; hits: SearchHit[] }[]
  trimmedQuery: string
  activeIndex: number
  listId: string
  onHover: (index: number) => void
  onSelect: (hit: SearchHit) => void
}) {
  const starts = hitGroupStarts(grouped)
  if (hits.length === 0) {
    return <SearchEmptyState trimmedQuery={trimmedQuery} />
  }
  return (
    <>
      {grouped.map((entry, index) => (
        <SearchHitGroup
          key={entry.group}
          group={entry.group}
          hits={entry.hits}
          start={starts[index] ?? 0}
          activeIndex={activeIndex}
          trimmedQuery={trimmedQuery}
          listId={listId}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

function SearchPalette({
  open,
  listId,
  hits,
  grouped,
  trimmedQuery,
  activeIndex,
  onHover,
  onSelect,
}: {
  open: boolean
  listId: string
  hits: SearchHit[]
  grouped: { group: string; hits: SearchHit[] }[]
  trimmedQuery: string
  activeIndex: number
  onHover: (index: number) => void
  onSelect: (hit: SearchHit) => void
}) {
  if (!open) {
    return null
  }
  return (
    <div className="absolute top-[calc(100%+8px)] left-1/2 z-50 w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 [--scroll-fade-from:var(--popover)]">
      <ScrollFade
        id={listId}
        role="listbox"
        aria-label="Command palette"
        className="max-h-80"
      >
        <SearchPaletteBody
          hits={hits}
          grouped={grouped}
          trimmedQuery={trimmedQuery}
          activeIndex={activeIndex}
          listId={listId}
          onHover={onHover}
          onSelect={onSelect}
        />
      </ScrollFade>
    </div>
  )
}

export function AppSearch() {
  const navigate = useNavigate()
  const workflows = useWorkflows()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const hits = useMemo(
    () => searchWorkspace(query, workflows),
    [query, workflows]
  )
  const grouped = useMemo(() => groupSearchHits(hits), [hits])
  const hint = shortcutHint()
  const trimmedQuery = query.trim()

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      if (!isSearchHotkey(event)) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
      setOpen(true)
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }
    function onPointerDown(event: PointerEvent) {
      if (isOutside(rootRef.current, event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  function clearQuery() {
    setQuery("")
    setActiveIndex(0)
    inputRef.current?.focus()
    setOpen(true)
  }

  function closePalette() {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
  }

  function runHit(hit: SearchHit) {
    closePalette()
    executeSearchHit(hit, navigate)
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-sidebar-foreground/50" />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) =>
          handlePaletteKeyDown(
            event,
            hits,
            activeIndex,
            setOpen,
            setActiveIndex,
            runHit,
            inputRef.current
          )
        }
        placeholder="Search or run a command…"
        aria-label="Search"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeDescendant(
          open,
          hits,
          activeIndex,
          listId
        )}
        autoComplete="off"
        spellCheck={false}
        className="h-8 appearance-none border-sidebar-border bg-sidebar-accent/50 pr-12 pl-8 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:border-sidebar-ring [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
      />
      <SearchFieldAddon query={query} hint={hint} onClear={clearQuery} />
      <SearchPalette
        open={open}
        listId={listId}
        hits={hits}
        grouped={grouped}
        trimmedQuery={trimmedQuery}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={runHit}
      />
    </div>
  )
}
