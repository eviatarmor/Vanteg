import { Checkbox } from "@workspace/ui/components/checkbox"

export function AssignmentGroup({
  title,
  description,
  empty,
  items,
  onToggle,
  disabled,
}: {
  title: string
  description: string
  empty: string
  items: { id: string; label: string; hint?: string; checked: boolean }[]
  onToggle: (id: string, checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-2">
                <Checkbox
                  className="mt-0.5"
                  checked={item.checked}
                  disabled={disabled}
                  onCheckedChange={(value) => onToggle(item.id, value === true)}
                  aria-label={item.label}
                />
                <span className="min-w-0">
                  <span className="block text-sm">{item.label}</span>
                  {item.hint ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
