import { Textarea } from "@workspace/ui/components/textarea"

import { isValidCron, nextRunPreview, scheduleSummary } from "../model/schedule"

export function CronScheduleBuilder({
  id,
  value,
  placeholder,
  config,
  onChange,
}: {
  id?: string
  value: string
  placeholder?: string
  config: Record<string, string>
  onChange: (value: string) => void
}) {
  const valid = !value.trim() || isValidCron(value)
  return (
    <div className="grid gap-2">
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={!valid}
        onChange={(event) => onChange(event.target.value)}
      />
      {!valid ? (
        <p className="text-xs text-destructive" role="status">
          Enter a 5- or 6-field cron expression.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">{scheduleSummary({ ...config, cron: value })}</p>
      <p className="text-xs text-muted-foreground">
        Next run preview: {nextRunPreview({ ...config, cron: value })}
      </p>
    </div>
  )
}
