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

export function ResourceSelectField({
  id,
  label,
  value,
  placeholder,
  resourceType,
  onChange,
}: ResourceSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading")
  const [options, setOptions] = useState<ResourceOption[]>([])
  const [query, setQuery] = useState("")
  const [customMode, setCustomMode] = useState(false)

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

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options
    }
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle)
    )
  }, [options, query])

  if (customMode) {
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
          onClick={() => setCustomMode(false)}
        >
          Back to resource list
        </Button>
      </div>
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
              {status === "loading"
                ? "Loading resources..."
                : selected?.label || value || placeholder}
            </span>
            {status === "loading" ? (
              <LoaderCircle className="size-4 shrink-0 animate-spin opacity-60" aria-hidden />
            ) : (
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {status === "empty" ? (
                <div
                  role="status"
                  className="px-3 py-4 text-center text-sm text-muted-foreground"
                >
                  No resources available for this connection.
                </div>
              ) : filtered.length === 0 ? (
                <CommandEmpty>No resources match "{query.trim()}".</CommandEmpty>
              ) : (
                <CommandGroup heading="Resources">
                  {filtered.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value)
                        setOpen(false)
                        setQuery("")
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup>
                <CommandItem
                  value="__custom__"
                  onSelect={() => {
                    setCustomMode(true)
                    setOpen(false)
                    setQuery("")
                  }}
                >
                  Enter custom value...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
