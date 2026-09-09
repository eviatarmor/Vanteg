import { Bell } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@workspace/ui/components/button"

export function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className="relative text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Link to="/inbox" aria-label="Notifications">
        <Bell />
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-vanteg-badge" />
      </Link>
    </Button>
  )
}
