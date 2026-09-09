import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

import { cn } from "@workspace/ui/lib/utils"

const MIN_WIDTH = 192
const DEFAULT_WIDTH = 256
const MAX_RATIO = 0.45

const PANE_MOTION = "duration-200 ease-linear"

export function ResizableSidebar({
  id,
  sidebar,
  children,
  side = "left",
  defaultWidth = DEFAULT_WIDTH,
  minWidth = MIN_WIDTH,
  maxRatio = MAX_RATIO,
  collapsed,
  sidebarClassName,
}: {
  id: string
  sidebar: ReactNode
  children: ReactNode
  side?: "left" | "right"
  defaultWidth?: number
  minWidth?: number
  maxRatio?: number
  collapsed?: boolean
  sidebarClassName?: string
}) {
  const groupRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)
  const [width, setWidth] = useState(defaultWidth)
  const [dragging, setDragging] = useState(false)
  const collapsible = collapsed !== undefined
  const isCollapsed = collapsed === true
  const paneWidth = isCollapsed ? 0 : width
  const animate = collapsible && !dragging

  function clamp(next: number): number {
    const parentWidth = groupRef.current?.getBoundingClientRect().width
    const max = parentWidth
      ? Math.max(minWidth, Math.round(parentWidth * maxRatio))
      : 480
    return Math.min(max, Math.max(minWidth, next))
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (isCollapsed) {
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    drag.current = { x: event.clientX, width }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) {
      return
    }
    const delta = event.clientX - drag.current.x
    setWidth(clamp(drag.current.width + (side === "right" ? -delta : delta)))
  }

  function onPointerUp() {
    drag.current = null
    setDragging(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (isCollapsed || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
      return
    }
    event.preventDefault()
    const step = event.key === "ArrowRight" ? 16 : -16
    setWidth((current) => clamp(current + (side === "right" ? -step : step)))
  }

  const pane = collapsible ? (
    <div
      data-slot="resizable-sidebar-pane"
      data-state={isCollapsed ? "collapsed" : "expanded"}
      aria-hidden={isCollapsed || undefined}
      inert={isCollapsed || undefined}
      style={{ width: paneWidth }}
      className={cn(
        "relative h-full min-h-0 shrink-0 overflow-hidden",
        animate && `transition-[width] ${PANE_MOTION}`
      )}
    >
      <div
        style={{ width }}
        className={cn(
          "absolute inset-y-0 flex min-h-0 flex-col overflow-hidden bg-muted/20 [--scroll-fade-from:var(--background)]",
          side === "right" ? "right-0" : "left-0",
          sidebarClassName
        )}
      >
        {sidebar}
      </div>
    </div>
  ) : (
    <div
      style={{ width }}
      className={cn(
        "flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden bg-muted/20 [--scroll-fade-from:var(--background)]",
        sidebarClassName
      )}
    >
      {sidebar}
    </div>
  )

  const handle = (
    <button
      type="button"
      role="separator"
      aria-label="Resize panel"
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={480}
      aria-valuenow={width}
      aria-hidden={isCollapsed || undefined}
      tabIndex={isCollapsed ? -1 : undefined}
      className={cn(
        "relative flex shrink-0 cursor-col-resize items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 hover:bg-ring focus-visible:bg-ring focus-visible:outline-hidden",
        isCollapsed ? "pointer-events-none w-0 overflow-hidden" : "w-px",
        animate && `transition-[width] ${PANE_MOTION}`
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span className="pointer-events-none z-10 h-6 w-1 rounded-lg bg-border" />
    </button>
  )

  const main = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
  )

  return (
    <div
      ref={groupRef}
      data-sidebar-split={id}
      className="flex min-h-0 min-w-0 flex-1"
    >
      {side === "left" ? pane : main}
      {handle}
      {side === "left" ? main : pane}
    </div>
  )
}
