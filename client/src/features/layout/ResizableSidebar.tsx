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
const PANE_SURFACE =
  "flex min-h-0 flex-col overflow-hidden bg-card [--scroll-fade-from:var(--card)]"

type SidebarSide = "left" | "right"
type DragState = { x: number; width: number }

function resizeDelta(side: SidebarSide, delta: number) {
  if (side === "right") {
    return -delta
  }
  return delta
}

function clampSidebarWidth(
  next: number,
  parentWidth: number | undefined,
  minWidth: number,
  maxRatio: number
) {
  if (!parentWidth) {
    return Math.min(480, Math.max(minWidth, next))
  }
  const max = Math.max(minWidth, Math.round(parentWidth * maxRatio))
  return Math.min(max, Math.max(minWidth, next))
}

function sidebarPaneWidth(isCollapsed: boolean, width: number) {
  if (isCollapsed) {
    return 0
  }
  return width
}

function shouldAnimatePane(collapsible: boolean, dragging: boolean) {
  return collapsible && !dragging
}

function collapsedState(isCollapsed: boolean) {
  if (isCollapsed) {
    return "collapsed" as const
  }
  return "expanded" as const
}

function collapsedAttr(isCollapsed: boolean) {
  if (isCollapsed) {
    return true
  }
  return undefined
}

function paneAnchorClass(side: SidebarSide) {
  if (side === "right") {
    return "right-0"
  }
  return "left-0"
}

function widthTransitionClass(animate: boolean) {
  if (!animate) {
    return undefined
  }
  return `transition-[width] ${PANE_MOTION}`
}

function handleWidthClass(isCollapsed: boolean) {
  if (isCollapsed) {
    return "pointer-events-none w-0 overflow-hidden"
  }
  return "w-px"
}

function handleTabIndex(isCollapsed: boolean) {
  if (isCollapsed) {
    return -1
  }
  return undefined
}

function resizeStepForKey(key: string) {
  if (key === "ArrowRight") {
    return 16
  }
  if (key === "ArrowLeft") {
    return -16
  }
  return null
}

function beginResize(
  event: PointerEvent<HTMLButtonElement>,
  isCollapsed: boolean,
  width: number,
  drag: { current: DragState | null },
  setDragging: (value: boolean) => void
) {
  if (isCollapsed) {
    return
  }
  event.preventDefault()
  event.currentTarget.setPointerCapture(event.pointerId)
  setDragging(true)
  drag.current = { x: event.clientX, width }
}

function moveResize(
  event: PointerEvent<HTMLButtonElement>,
  side: SidebarSide,
  drag: { current: DragState | null },
  setWidth: (width: number) => void,
  clamp: (next: number) => number
) {
  if (!drag.current) {
    return
  }
  const delta = event.clientX - drag.current.x
  setWidth(clamp(drag.current.width + resizeDelta(side, delta)))
}

function applyResizeKey(
  event: KeyboardEvent<HTMLButtonElement>,
  isCollapsed: boolean,
  side: SidebarSide,
  setWidth: (updater: (current: number) => number) => void,
  clamp: (next: number) => number
) {
  const step = resizeStepForKey(event.key)
  if (isCollapsed || step === null) {
    return
  }
  event.preventDefault()
  setWidth((current) => clamp(current + resizeDelta(side, step)))
}

function CollapsibleSidebarPane({
  isCollapsed,
  paneWidth,
  width,
  animate,
  side,
  sidebarClassName,
  sidebar,
}: {
  isCollapsed: boolean
  paneWidth: number
  width: number
  animate: boolean
  side: SidebarSide
  sidebarClassName?: string
  sidebar: ReactNode
}) {
  return (
    <div
      data-slot="resizable-sidebar-pane"
      data-state={collapsedState(isCollapsed)}
      aria-hidden={collapsedAttr(isCollapsed)}
      inert={collapsedAttr(isCollapsed)}
      style={{ width: paneWidth }}
      className={cn(
        "relative h-full min-h-0 shrink-0 overflow-hidden",
        widthTransitionClass(animate)
      )}
    >
      <div
        style={{ width }}
        className={cn(
          "absolute inset-y-0",
          PANE_SURFACE,
          paneAnchorClass(side),
          sidebarClassName
        )}
      >
        {sidebar}
      </div>
    </div>
  )
}

function StaticSidebarPane({
  width,
  sidebarClassName,
  sidebar,
}: {
  width: number
  sidebarClassName?: string
  sidebar: ReactNode
}) {
  return (
    <div
      style={{ width }}
      className={cn("min-w-0 shrink-0", PANE_SURFACE, sidebarClassName)}
    >
      {sidebar}
    </div>
  )
}

function SidebarPane({
  collapsible,
  isCollapsed,
  paneWidth,
  width,
  animate,
  side,
  sidebarClassName,
  sidebar,
}: {
  collapsible: boolean
  isCollapsed: boolean
  paneWidth: number
  width: number
  animate: boolean
  side: SidebarSide
  sidebarClassName?: string
  sidebar: ReactNode
}) {
  if (!collapsible) {
    return (
      <StaticSidebarPane
        width={width}
        sidebarClassName={sidebarClassName}
        sidebar={sidebar}
      />
    )
  }
  return (
    <CollapsibleSidebarPane
      isCollapsed={isCollapsed}
      paneWidth={paneWidth}
      width={width}
      animate={animate}
      side={side}
      sidebarClassName={sidebarClassName}
      sidebar={sidebar}
    />
  )
}

function SidebarResizeHandle({
  minWidth,
  width,
  isCollapsed,
  animate,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
}: {
  minWidth: number
  width: number
  isCollapsed: boolean
  animate: boolean
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void
  onPointerUp: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      role="separator"
      aria-label="Resize panel"
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={480}
      aria-valuenow={width}
      aria-hidden={collapsedAttr(isCollapsed)}
      tabIndex={handleTabIndex(isCollapsed)}
      className={cn(
        "relative flex shrink-0 cursor-col-resize items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 hover:bg-ring focus-visible:bg-ring focus-visible:outline-hidden",
        handleWidthClass(isCollapsed),
        widthTransitionClass(animate)
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
}

function SplitLayout({
  side,
  pane,
  handle,
  main,
}: {
  side: SidebarSide
  pane: ReactNode
  handle: ReactNode
  main: ReactNode
}) {
  if (side === "left") {
    return (
      <>
        {pane}
        {handle}
        {main}
      </>
    )
  }
  return (
    <>
      {main}
      {handle}
      {pane}
    </>
  )
}

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
  side?: SidebarSide
  defaultWidth?: number
  minWidth?: number
  maxRatio?: number
  collapsed?: boolean
  sidebarClassName?: string
}) {
  const groupRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [width, setWidth] = useState(defaultWidth)
  const [dragging, setDragging] = useState(false)
  const collapsible = collapsed !== undefined
  const isCollapsed = collapsed === true
  const paneWidth = sidebarPaneWidth(isCollapsed, width)
  const animate = shouldAnimatePane(collapsible, dragging)

  function clamp(next: number) {
    return clampSidebarWidth(
      next,
      groupRef.current?.getBoundingClientRect().width,
      minWidth,
      maxRatio
    )
  }

  return (
    <div
      ref={groupRef}
      data-sidebar-split={id}
      className="flex min-h-0 min-w-0 flex-1"
    >
      <SplitLayout
        side={side}
        pane={
          <SidebarPane
            collapsible={collapsible}
            isCollapsed={isCollapsed}
            paneWidth={paneWidth}
            width={width}
            animate={animate}
            side={side}
            sidebarClassName={sidebarClassName}
            sidebar={sidebar}
          />
        }
        handle={
          <SidebarResizeHandle
            minWidth={minWidth}
            width={width}
            isCollapsed={isCollapsed}
            animate={animate}
            onPointerDown={(event) =>
              beginResize(event, isCollapsed, width, drag, setDragging)
            }
            onPointerMove={(event) =>
              moveResize(event, side, drag, setWidth, clamp)
            }
            onPointerUp={() => {
              drag.current = null
              setDragging(false)
            }}
            onKeyDown={(event) =>
              applyResizeKey(event, isCollapsed, side, setWidth, clamp)
            }
          />
        }
        main={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        }
      />
    </div>
  )
}
