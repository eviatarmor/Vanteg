import { Navigate, Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { isAuthenticated } from "@/features/auth/model/session"
import { AssistantDock } from "@/features/assistant/AssistantDock"

import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { getPageTitle } from "./model/catalog"
import { matchActivePath } from "./model/match-path"

export function AppShell() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)
  const onAssistantPage = matchActivePath(location.pathname, "/assistant")

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden bg-sidebar">
      <AppSidebar />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
        <AppTopbar title={title} />
        {onAssistantPage ? (
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <AssistantDock>
            <Outlet />
          </AssistantDock>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
