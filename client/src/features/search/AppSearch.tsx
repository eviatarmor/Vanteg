import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { useNavigate } from "react-router"
import { Search, X } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"

import { useWorkflows } from "@/features/workflows/model/store"

import { groupSearchHits, searchWorkspace, type SearchHit } from "./model/search"

function shortcutHint(): string {
  if (typeof navigator === "undefined") {
    return "⌘K"
  }
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl+K"
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
  const hits = useMemo(() => searchWorkspace(query, workflows), [query, workflows])
  const grouped = useMemo(() => groupSearchHits(hits), [hits])
  const hint = shortcutHint()

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
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

  function go(hit: SearchHit) {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    const [pathname, search] = hit.path.split("?")
    navigate({
      pathname: pathname || "/",
      search: search ? `?${search}` : "",
    })
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)))
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
        go(hit)
      }
      return
    }
    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  let optionOffset = 0

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
        onKeyDown={onKeyDown}
        placeholder="Search workflows, inbox…"
        aria-label="Search"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && hits[activeIndex] ? `${listId}-${hits[activeIndex].id}` : undefined
        }
        autoComplete="off"
        spellCheck={false}
        className="h-8 appearance-none border-sidebar-border bg-sidebar-accent/50 pr-12 pl-8 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:border-sidebar-ring [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={clearQuery}
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar-accent px-1.5 py-0.5 font-sans text-[10px] text-sidebar-foreground/55 sm:inline">
          {hint}
        </kbd>
      )}
      {open ? (
        <div className="absolute top-[calc(100%+8px)] left-1/2 z-50 w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 [--scroll-fade-from:var(--popover)]">
          <ScrollFade
            id={listId}
            role="listbox"
            aria-label="Search results"
            className="max-h-80"
          >
            {hits.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results.
              </p>
            ) : (
              grouped.map((entry) => {
                const start = optionOffset
                optionOffset += entry.hits.length
                return (
                  <div key={entry.group} className="p-1">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      {entry.group}
                    </p>
                    {entry.hits.map((hit, index) => {
                      const selected = start + index === activeIndex
                      return (
                        <button
                          key={hit.id}
                          id={`${listId}-${hit.id}`}
                          type="button"
                          role="option"
                          aria-label={hit.title}
                          aria-selected={selected}
                          className={
                            selected
                              ? "flex w-full flex-col rounded-md bg-muted px-2 py-1.5 text-left"
                              : "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted"
                          }
                          onMouseEnter={() => setActiveIndex(start + index)}
                          onClick={() => go(hit)}
                        >
                          <span className="truncate text-sm font-medium">{hit.title}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {hit.subtitle}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </ScrollFade>
        </div>
      ) : null}
    </div>
  )
}
