import { Navigate, Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { isAuthenticated } from "@/features/auth/model/session"
import { AssistantDock } from "@/features/assistant/AssistantDock"
import { OnboardingRouteTracker } from "@/features/home/ui/OnboardingRouteTracker"

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
      <OnboardingRouteTracker />
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring/50 absolute left-4 top-4 z-50 -translate-y-16 rounded-lg border border-transparent px-3 py-2 text-sm font-medium opacity-0 shadow-md outline-none transition focus:translate-y-0 focus:border-ring focus:opacity-100 focus:ring-3 focus-visible:border-ring focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById("main-content")?.focus()
        }}
      >
        Skip to main content
      </a>
      <AppSidebar />
      <SidebarInset
        id="main-content"
        tabIndex={-1}
        className="min-h-0 min-w-0 overflow-hidden bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
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
