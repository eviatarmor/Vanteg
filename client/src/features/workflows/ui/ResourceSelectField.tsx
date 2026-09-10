import { useEffect, useMemo, useState } from "react"
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react"

import { listResources, type ResourceOption } from "@workspace/integrations"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

type ResourceSelectFieldProps = {
  id: string
  label: string
  value: string
  placeholder: string
  resourceType: string
  onChange: (value: string) => void
}

type ResourceStatus = "loading" | "ready" | "empty"

function filterResourceOptions(options: ResourceOption[], query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return options
  }
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(needle) ||
      option.value.toLowerCase().includes(needle)
  )
}

function resourceTriggerText(
  status: ResourceStatus,
  selected: ResourceOption | undefined,
  value: string,
  placeholder: string
) {
  if (status === "loading") {
    return "Loading resources..."
  }
  return selected?.label || value || placeholder
}

function ResourceTriggerIcon({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <LoaderCircle
        className="size-4 shrink-0 animate-spin opacity-60"
        aria-hidden
      />
    )
  }
  return <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
}

function ResourceCustomInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  onBack,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onBack: () => void
}) {
  return (
    <div className="grid gap-2">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start px-0 text-muted-foreground"
        onClick={onBack}
      >
        Back to resource list
      </Button>
    </div>
  )
}

function ResourceOptionItem({
  option,
  selected,
  onPick,
}: {
  option: ResourceOption
  selected: boolean
  onPick: (option: ResourceOption) => void
}) {
  return (
    <CommandItem value={option.value} onSelect={() => onPick(option)}>
      <Check
        className={cn("mr-2 size-4", selected ? "opacity-100" : "opacity-0")}
        aria-hidden
      />
      <span className="truncate">{option.label}</span>
    </CommandItem>
  )
}

function ResourceEmptyStatus() {
  return (
    <div
      role="status"
      className="px-3 py-4 text-center text-sm text-muted-foreground"
    >
      No resources available for this connection.
    </div>
  )
}

function ResourceListItems({
  status,
  filtered,
  query,
  value,
  onPick,
}: {
  status: ResourceStatus
  filtered: ResourceOption[]
  query: string
  value: string
  onPick: (option: ResourceOption) => void
}) {
  if (status === "empty") {
    return <ResourceEmptyStatus />
  }
  if (filtered.length === 0) {
    return <CommandEmpty>No resources match "{query.trim()}".</CommandEmpty>
  }
  return (
    <CommandGroup heading="Resources">
      {filtered.map((option) => (
        <ResourceOptionItem
          key={option.value}
          option={option}
          selected={value === option.value}
          onPick={onPick}
        />
      ))}
    </CommandGroup>
  )
}

function ResourceCustomItem({ onSelect }: { onSelect: () => void }) {
  return (
    <CommandGroup>
      <CommandItem value="__custom__" onSelect={onSelect}>
        Enter custom value...
      </CommandItem>
    </CommandGroup>
  )
}

function useResourceOptions(resourceType: string) {
  const [status, setStatus] = useState<ResourceStatus>("loading")
  const [options, setOptions] = useState<ResourceOption[]>([])

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    void Promise.resolve().then(() => {
      if (cancelled) {
        return
      }
      const rows = listResources(resourceType)
      setOptions(rows)
      setStatus(rows.length === 0 ? "empty" : "ready")
    })
    return () => {
      cancelled = true
    }
  }, [resourceType])

  return { status, options }
}

export function ResourceSelectField({
  id,
  label,
  value,
  placeholder,
  resourceType,
  onChange,
}: ResourceSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const { status, options } = useResourceOptions(resourceType)
  const [query, setQuery] = useState("")
  const [customMode, setCustomMode] = useState(false)

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const filtered = useMemo(
    () => filterResourceOptions(options, query),
    [options, query]
  )

  function pickOption(option: ResourceOption) {
    onChange(option.value)
    setOpen(false)
    setQuery("")
  }

  function enterCustomMode() {
    setCustomMode(true)
    setOpen(false)
    setQuery("")
  }

  if (customMode) {
    return (
      <ResourceCustomInput
        id={id}
        label={label}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBack={() => setCustomMode(false)}
      />
    )
  }

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="w-full justify-between font-normal"
            disabled={status === "loading"}
          >
            <span className="truncate">
              {resourceTriggerText(status, selected, value, placeholder)}
            </span>
            <ResourceTriggerIcon loading={status === "loading"} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <ResourceListItems
                status={status}
                filtered={filtered}
                query={query}
                value={value}
                onPick={pickOption}
              />
              <ResourceCustomItem onSelect={enterCustomMode} />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
