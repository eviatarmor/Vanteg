import { Navigate, Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { isAuthenticated } from "@/features/auth/model/session"
import { AssistantDock } from "@/features/assistant/AssistantDock"

import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { getPageTitle } from "./model/catalog"

export function AppShell() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

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
        <AssistantDock>
          <Outlet />
        </AssistantDock>
      </SidebarInset>
    </SidebarProvider>
  )
}
