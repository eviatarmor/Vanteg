import { useCallback, useEffect, useRef, useState } from "react"
import {
  addEdge,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { createVantegNode } from "../model/create-node"
import { wireConnection } from "../model/node-io"
import { saveWorkflow } from "../model/store"
import type {
  VantegNode,
  VantegNodePatch,
  Workflow,
  WorkflowNodeType,
} from "../model/types"
import { NodeActionMenu, PaneAddMenu } from "./FlowMenus"
import { workflowNodeTypes } from "./VantegNode"
import {
  FlowCanvasChrome,
  flowCanvasClassName,
  flowInteractionProps,
  flowProOptions,
  flowSnapGrid,
} from "@/components/flow-canvas/canvas-controls"

import { NodePickerDialog } from "./NodePickerDialog"
import { NodeSheet } from "./NodeSheet"
import { WorkflowRunHistorySheet } from "./WorkflowRunHistorySheet"
import { WorkflowRunBar, type WorkflowSaveState } from "./WorkflowToolbar"

export function WorkflowCanvas({ workflow }: { workflow: Workflow }) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner workflow={workflow} />
    </ReactFlowProvider>
  )
}

function WorkflowCanvasInner({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [paneMenu, setPaneMenu] = useState<{ x: number; y: number } | null>(null)
  const [nodeMenu, setNodeMenu] = useState<{
    x: number
    y: number
    nodeId: string
  } | null>(null)
  const dropPosition = useRef({ x: 120, y: 160 })
  const [locked, setLocked] = useState(false)
  const [saveState, setSaveState] = useState<WorkflowSaveState>("idle")
  const saveClearTimer = useRef<number | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { screenToFlowPosition, fitView } = useReactFlow()

  function revealNodes() {
    queueMicrotask(() => {
      void fitView({ padding: 0.25, duration: 180 })
    })
  }

  useEffect(() => {
    setSaveState("saving")
    saveWorkflow(workflow.id, { nodes, edges })
    if (saveClearTimer.current !== null) {
      window.clearTimeout(saveClearTimer.current)
    }
    const savedTimer = window.setTimeout(() => {
      setSaveState("saved")
    }, 120)
    saveClearTimer.current = window.setTimeout(() => {
      setSaveState("idle")
      saveClearTimer.current = null
    }, 1600)
    return () => {
      window.clearTimeout(savedTimer)
      if (saveClearTimer.current !== null) {
        window.clearTimeout(saveClearTimer.current)
        saveClearTimer.current = null
      }
    }
  }, [edges, nodes, workflow.id])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge({ ...connection, animated: true }, current))
      setNodes((current) =>
        wireConnection(current, connection.source, connection.target)
      )
    },
    [setEdges, setNodes]
  )

  function rememberClient(event: { clientX: number; clientY: number }) {
    dropPosition.current = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  const onNodeClick: NodeMouseHandler<VantegNode> = useCallback(() => {
    setPaneMenu(null)
    setNodeMenu(null)
  }, [])

  const onNodeDoubleClick: NodeMouseHandler<VantegNode> = useCallback(
    (_event, node) => {
      setSheetId(node.id)
    },
    []
  )

  const onNodeContextMenu: NodeMouseHandler<VantegNode> = useCallback(
    (event, node) => {
      event.preventDefault()
      event.stopPropagation()
      setPaneMenu(null)
      setNodeMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
    },
    []
  )

  function addNode(nodeType: WorkflowNodeType) {
    const node = createVantegNode(nodeType.id, dropPosition.current)
    setNodes((current) => [...current, node])
    revealNodes()
  }

  function updateNode(nodeId: string, patch: VantegNodePatch) {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...patch } }
          : node
      )
    )
  }

  function duplicateNode(nodeId: string) {
    const node = nodes.find((item) => item.id === nodeId)
    if (!node) {
      return
    }
    const copy: VantegNode = {
      ...node,
      id: crypto.randomUUID(),
      selected: false,
      position: { x: node.position.x + 48, y: node.position.y + 48 },
      data: {
        ...node.data,
        config: { ...node.data.config },
        inVars: node.data.inVars.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        })),
        outVars: node.data.outVars.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        })),
      },
    }
    setNodes((current) => [...current, copy])
    revealNodes()
  }

  function deleteNode(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId))
    setEdges((current) =>
      current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    )
    if (sheetId === nodeId) {
      setSheetId(null)
    }
  }

  const sheetNode = nodes.find((node) => node.id === sheetId) ?? null

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="relative min-h-0 min-w-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => {
            setPaneMenu(null)
            setNodeMenu(null)
          }}
          onPaneContextMenu={(event) => {
            event.preventDefault()
            rememberClient(event)
            setNodeMenu(null)
            setPaneMenu({ x: event.clientX, y: event.clientY })
          }}
          nodeTypes={workflowNodeTypes}
          fitView
          snapToGrid
          snapGrid={flowSnapGrid}
          colorMode="light"
          deleteKeyCode={sheetId || locked ? null : ["Backspace", "Delete"]}
          proOptions={flowProOptions}
          className={flowCanvasClassName}
          {...flowInteractionProps(locked)}
        >
          <FlowCanvasChrome locked={locked} onLockedChange={setLocked}>
            <Panel position="top-right" className="m-3">
              <WorkflowRunBar
                workflowId={workflow.id}
                workflowName={workflow.name}
                saveState={saveState}
                onOpenHistory={() => setHistoryOpen(true)}
              />
            </Panel>
            {nodes.length === 0 ? (
              <Panel
                position="top-center"
                className="pointer-events-none m-8 max-w-sm"
                data-testid="empty-canvas-hint"
              >
                <div className="rounded-xl border border-dashed border-border bg-background/95 px-5 py-4 text-center shadow-sm">
                  <p className="text-sm font-medium">Empty canvas</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Right-click the canvas to add a trigger or action, or use the
                    menus to start building.
                  </p>
                </div>
              </Panel>
            ) : null}
          </FlowCanvasChrome>
        </ReactFlow>
      </div>
      <PaneAddMenu
        open={paneMenu !== null}
        x={paneMenu?.x ?? 0}
        y={paneMenu?.y ?? 0}
        onClose={() => setPaneMenu(null)}
        onAdd={addNode}
        onMore={() => setPickerOpen(true)}
      />
      <NodeActionMenu
        open={nodeMenu !== null}
        x={nodeMenu?.x ?? 0}
        y={nodeMenu?.y ?? 0}
        onClose={() => setNodeMenu(null)}
        onOpen={() => nodeMenu && setSheetId(nodeMenu.nodeId)}
        onDuplicate={() => nodeMenu && duplicateNode(nodeMenu.nodeId)}
        onDelete={() => nodeMenu && deleteNode(nodeMenu.nodeId)}
      />
      <NodeSheet
        node={sheetNode}
        nodes={nodes}
        edges={edges}
        onClose={() => setSheetId(null)}
        onChange={updateNode}
      />
      <NodePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAdd={addNode}
      />
      <WorkflowRunHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        workflowId={workflow.id}
        workflowName={workflow.name}
      />
    </div>
  )
}
