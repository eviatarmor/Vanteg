import { MessageSquare } from "lucide-react"
import { useLocation } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { toggleAssistant, useAssistantOpen } from "@/features/assistant/model/open-store"

import { getWorkspaceIdentity } from "./model/catalog"
import { matchActivePath } from "./model/match-path"

export function AskVantegButton() {
  const location = useLocation()
  const { assistantActionLabel } = getWorkspaceIdentity()
  const open = useAssistantOpen()

  if (matchActivePath(location.pathname, "/assistant")) {
    return null
  }

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
