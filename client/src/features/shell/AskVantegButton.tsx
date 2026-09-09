import { MessageSquare } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { toggleAssistant, useAssistantOpen } from "@/features/assistant/model/open-store"

import { getWorkspaceIdentity } from "./model/catalog"

export function AskVantegButton() {
  const { assistantActionLabel } = getWorkspaceIdentity()
  const open = useAssistantOpen()

  return (
    <Button
      variant="ghost"
      aria-label={assistantActionLabel}
      aria-pressed={open}
      onClick={toggleAssistant}
      className={cn(
        "h-8 gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        open
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/85"
      )}
    >
      <MessageSquare />
      <span className="hidden sm:inline">{assistantActionLabel}</span>
    </Button>
  )
}
