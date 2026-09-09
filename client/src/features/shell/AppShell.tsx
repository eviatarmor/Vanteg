import { Navigate, Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { isAuthenticated } from "@/features/auth/model/session"
import { AssistantDock } from "@/features/assistant/AssistantDock"

import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { getPageTitle } from "./model/catalog"

function loginRedirectTo(pathname: string, search: string): string {
  const returnTo = `${pathname}${search}`
  if (!returnTo || returnTo === "/") return "/login"
  return `/login?next=${encodeURIComponent(returnTo)}`
}

export function AppShell() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={loginRedirectTo(location.pathname, location.search)}
        replace
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
