import { Suggestion } from "@/components/ai-elements/suggestion"
import { cn } from "@workspace/ui/lib/utils"

export const assistantChatColumnClassName = "mx-auto w-full max-w-3xl"

export function AssistantWelcome({
  suggestions,
  onSelect,
  className,
}: {
  suggestions: readonly string[]
  onSelect: (suggestion: string) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-10",
        className
      )}
    >
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Ask Vanteg
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask about this page, or pick a prompt to start.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={onSelect}
              className="h-auto max-w-full whitespace-normal"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
