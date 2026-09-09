import { Badge } from "@workspace/ui/components/badge"

import { summarizeRunIo } from "../model/mask-run-io"
import {
  formatRunDuration,
  formatRunStartedAt,
} from "../model/run-store"
import type { RunStatus, WorkflowRun } from "../model/run-types"

const statusVariant: Record<RunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failed: "destructive",
  running: "secondary",
}

export function WorkflowRunDetail({ run }: { run: WorkflowRun }) {
  const inputs = summarizeRunIo(run.inputs)
  const outputs = summarizeRunIo(run.outputs)

  return (
    <article className="flex flex-col gap-4" aria-label={`Run detail ${run.workflowName}`}>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold">{run.workflowName}</h2>
          <Badge variant={statusVariant[run.status]} className="capitalize">
            {run.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Triggered by {run.triggerLabel} · {formatRunStartedAt(run.startedAt)} ·{" "}
          {formatRunDuration(run.durationMs, run.status)}
        </p>
        {run.errorMessage ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {run.errorMessage}
          </p>
        ) : null}
      </header>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Steps</h3>
        {run.steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No step details for this run.</p>
        ) : (
          <ol className="grid gap-2">
            {run.steps.map((step, index) => (
              <li
                key={step.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {index + 1}. {step.label}
                  </p>
                  {step.errorMessage ? (
                    <p className="text-xs text-destructive">{step.errorMessage}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={statusVariant[step.status]} className="capitalize">
                    {step.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRunDuration(step.durationMs, step.status)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <IoBlock title="Inputs" entries={inputs} />
        <IoBlock title="Outputs" entries={outputs} />
      </section>
    </article>
  )
}

function IoBlock({
  title,
  entries,
}: {
  title: string
  entries: Array<{ key: string; value: string }>
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">None</p>
      ) : (
        <dl className="mt-2 grid gap-1.5">
          {entries.map((entry) => (
            <div key={entry.key} className="flex items-baseline justify-between gap-2">
              <dt className="text-xs text-muted-foreground">{entry.key}</dt>
              <dd className="font-mono text-xs">{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
