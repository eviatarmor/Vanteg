import { Link, matchPath, useLocation } from "react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { AppSearch } from "@/features/search/AppSearch"
import { WorkflowEditorChrome } from "@/features/workflows/ui/WorkflowEditorChrome"

import { AskVantegButton } from "./AskVantegButton"
import { FeedbackButton } from "./FeedbackButton"
import { NotificationButton } from "./NotificationButton"
import { getActivePageTab } from "./model/page-tab"

export function AppTopbar({ title }: { title: string }) {
  const location = useLocation()
  const editorMatch = matchPath("/workflows/:workflowId", location.pathname)
  const tab = getActivePageTab(location.pathname, location.search)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 text-sidebar-foreground md:gap-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        {editorMatch ? (
          <div className="min-w-0 overflow-hidden">
            <WorkflowEditorChrome />
          </div>
        ) : tab ? (
          <Breadcrumb className="hidden min-w-0 lg:block">
            <BreadcrumbList className="text-sidebar-foreground/80">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={tab.pagePath}
                    className="text-base font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  >
                    {title}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-sidebar-foreground/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-base font-semibold tracking-tight text-sidebar-foreground">
                  {tab.tabLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <p className="hidden truncate text-base font-semibold tracking-tight lg:block">
            {title}
          </p>
        )}
      </div>
      <div className="w-full min-w-0 max-w-md flex-1 md:flex-none md:w-[min(32rem,42vw)]">
        <AppSearch />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        <AskVantegButton />
        <FeedbackButton />
        <NotificationButton />
      </div>
    </header>
  )
}
