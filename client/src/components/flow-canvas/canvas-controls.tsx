import type { ReactNode } from "react"
import { Lock, LockOpen, Maximize2, Minus, Plus } from "lucide-react"
import { Background, BackgroundVariant, Panel, useReactFlow } from "@xyflow/react"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"

function ToolButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export const flowCanvasClassName = "h-full w-full bg-background"

export const flowSnapGrid: [number, number] = [16, 16]

export const flowProOptions = { hideAttribution: true } as const

export function flowInteractionProps(locked: boolean) {
  return {
    nodesDraggable: !locked,
    nodesConnectable: !locked,
    elementsSelectable: !locked,
    panOnDrag: !locked,
    zoomOnScroll: !locked,
  }
}

export function FlowBackground() {
  return <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
}

export function CanvasControls({
  locked,
  onLockedChange,
}: {
  locked: boolean
  onLockedChange: (locked: boolean) => void
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <ButtonGroup
      orientation="vertical"
      className="rounded-xl border border-border bg-background shadow-sm"
    >
      <ToolButton label="Zoom in" onClick={() => void zoomIn({ duration: 120 })}>
        <Plus />
      </ToolButton>
      <ToolButton label="Zoom out" onClick={() => void zoomOut({ duration: 120 })}>
        <Minus />
      </ToolButton>
      <ToolButton
        label="Fit view"
        onClick={() => void fitView({ padding: 0.25, duration: 180 })}
      >
        <Maximize2 />
      </ToolButton>
      <ToolButton
        label={locked ? "Unlock canvas" : "Lock canvas"}
        pressed={locked}
        onClick={() => onLockedChange(!locked)}
      >
        {locked ? <Lock /> : <LockOpen />}
      </ToolButton>
    </ButtonGroup>
  )
}

export function FlowCanvasChrome({
  locked,
  onLockedChange,
  children,
}: {
  locked: boolean
  onLockedChange: (locked: boolean) => void
  children?: ReactNode
}) {
  return (
    <>
      <FlowBackground />
      {children}
      <Panel position="bottom-left" className="m-3">
        <CanvasControls locked={locked} onLockedChange={onLockedChange} />
      </Panel>
    </>
  )
}
