import type { ReactNode } from "react"

import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { AssistantPanel } from "./ui/AssistantPanel"
import { setAssistantOpen, useAssistantOpen } from "./model/open-store"

export function AssistantDock({ children }: { children: ReactNode }) {
  const open = useAssistantOpen()
  const isMobile = useIsMobile()

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1"
        id="app-assistant-layout"
      >
        <ResizablePanel
          defaultSize={open && !isMobile ? "72%" : "100%"}
          minSize="40%"
          className="min-h-0"
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>
        </ResizablePanel>
        {open && !isMobile ? (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize="28%"
              minSize="20%"
              maxSize="48%"
              className="min-h-0"
            >
              <div className="flex h-full min-h-0 flex-col border-l border-border bg-card">
                <AssistantPanel />
              </div>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
      <Sheet open={open && isMobile} onOpenChange={setAssistantOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Assistant</SheetTitle>
            <SheetDescription>Ask Freeze about the current page.</SheetDescription>
          </SheetHeader>
          <AssistantPanel />
        </SheetContent>
      </Sheet>
    </>
  )
}
