import type { ReactNode } from "react"

import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { ResizableSidebar } from "@/features/layout/ResizableSidebar"

import { AssistantPanel } from "./ui/AssistantPanel"
import { setAssistantOpen, useAssistantOpen } from "./model/open-store"

export function AssistantDock({ children }: { children: ReactNode }) {
  const open = useAssistantOpen()
  const isMobile = useIsMobile()

  const page = (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  )

  return (
    <>
      {isMobile ? (
        page
      ) : (
        <ResizableSidebar
          id="assistant-dock"
          side="right"
          defaultWidth={360}
          minWidth={280}
          maxRatio={0.48}
          collapsed={!open}
          sidebarClassName="bg-card [--scroll-fade-from:var(--card)]"
          sidebar={<AssistantPanel />}
        >
          {page}
        </ResizableSidebar>
      )}
      <Sheet open={open && isMobile} onOpenChange={setAssistantOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Assistant</SheetTitle>
            <SheetDescription>Ask Vanteg about the current page.</SheetDescription>
          </SheetHeader>
          <AssistantPanel />
        </SheetContent>
      </Sheet>
    </>
  )
}
