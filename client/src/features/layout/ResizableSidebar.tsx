import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

const MIN_WIDTH = 192
const DEFAULT_WIDTH = 256
const MAX_RATIO = 0.45

export function ResizableSidebar({
  id,
  sidebar,
  children,
}: {
  id: string
  sidebar: ReactNode
  children: ReactNode
}) {
  const groupRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  function clamp(next: number): number {
    const parentWidth = groupRef.current?.getBoundingClientRect().width
    const max = parentWidth ? Math.max(MIN_WIDTH, Math.round(parentWidth * MAX_RATIO)) : 480
    return Math.min(max, Math.max(MIN_WIDTH, next))
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, width }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) {
      return
    }
    setWidth(clamp(drag.current.width + (event.clientX - drag.current.x)))
  }

  function onPointerUp() {
    drag.current = null
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setWidth((current) => clamp(current - 16))
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setWidth((current) => clamp(current + 16))
    }
  }

  return (
    <div
      ref={groupRef}
      data-sidebar-split={id}
      className="flex min-h-0 min-w-0 flex-1"
    >
      <aside
        style={{ width }}
        className="flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden bg-muted/20"
      >
        {sidebar}
      </aside>
      <button
        type="button"
        role="separator"
        aria-label="Resize panel"
        aria-orientation="vertical"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={480}
        aria-valuenow={width}
        className="relative flex w-px shrink-0 cursor-col-resize items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 hover:bg-ring focus-visible:bg-ring focus-visible:outline-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span className="pointer-events-none z-10 h-6 w-1 rounded-lg bg-border" />
      </button>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
