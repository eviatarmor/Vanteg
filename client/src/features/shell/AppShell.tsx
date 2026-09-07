import { Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { AssistantDock } from "@/features/assistant/AssistantDock"

import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { getPageTitle } from "./model/catalog"

export function AppShell() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <SidebarProvider className="h-svh overflow-hidden bg-sidebar">
      <AppSidebar />
      <SidebarInset className="min-h-0 bg-background">
        <AppTopbar title={title} />
        <AssistantDock>
          <Outlet />
        </AssistantDock>
      </SidebarInset>
    </SidebarProvider>
  )
}
