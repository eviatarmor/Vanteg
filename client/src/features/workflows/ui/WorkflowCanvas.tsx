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
  NodeVar,
  VantegEdge,
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

function remapVars(items: NodeVar[]): NodeVar[] {
  return items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }))
}

function cloneVantegNode(node: VantegNode): VantegNode {
  return {
    ...node,
    id: crypto.randomUUID(),
    selected: false,
    position: { x: node.position.x + 48, y: node.position.y + 48 },
    data: {
      ...node.data,
      config: { ...node.data.config },
      inVars: remapVars(node.data.inVars),
      outVars: remapVars(node.data.outVars),
    },
  }
}

function patchNodeData(
  current: VantegNode[],
  nodeId: string,
  patch: VantegNodePatch
): VantegNode[] {
  return current.map((node) => {
    if (node.id !== nodeId) {
      return node
    }
    return { ...node, data: { ...node.data, ...patch } }
  })
}

function dropNodeAndEdges(
  nodeId: string,
  setNodes: (updater: (current: VantegNode[]) => VantegNode[]) => void,
  setEdges: (updater: (current: VantegEdge[]) => VantegEdge[]) => void
) {
  setNodes((current) => current.filter((node) => node.id !== nodeId))
  setEdges((current) =>
    current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  )
}

function canvasDeleteKeys(sheetId: string | null, locked: boolean) {
  if (sheetId) {
    return null
  }
  if (locked) {
    return null
  }
  return ["Backspace", "Delete"]
}

function menuPosition(menu: { x: number; y: number } | null) {
  if (!menu) {
    return { x: 0, y: 0 }
  }
  return { x: menu.x, y: menu.y }
}

function findSheetNode(nodes: VantegNode[], sheetId: string | null) {
  if (!sheetId) {
    return null
  }
  const match = nodes.find((node) => node.id === sheetId)
  if (!match) {
    return null
  }
  return match
}

function EmptyCanvasHint({ empty }: { empty: boolean }) {
  if (!empty) {
    return null
  }
  return (
    <Panel
      position="top-center"
      className="pointer-events-none m-8 max-w-sm"
      data-testid="empty-canvas-hint"
    >
      <div className="rounded-xl border border-dashed border-border bg-background/95 px-5 py-4 text-center shadow-sm">
        <p className="text-sm font-medium">Empty canvas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Right-click the canvas to add a trigger or action, or use the menus to
          start building.
        </p>
      </div>
    </Panel>
  )
}

function useWorkflowGraph(workflow: Workflow) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges)
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge({ ...connection, animated: true }, current))
      setNodes((current) =>
        wireConnection(current, connection.source, connection.target)
      )
    },
    [setEdges, setNodes]
  )
  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
  }
}

function useWorkflowPersistence(
  workflowId: string,
  nodes: VantegNode[],
  edges: VantegEdge[]
) {
  const [saveState, setSaveState] = useState<WorkflowSaveState>("idle")
  const saveClearTimer = useRef<number | null>(null)

  useEffect(() => {
    setSaveState("saving")
    saveWorkflow(workflowId, { nodes, edges })
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
  }, [edges, nodes, workflowId])

  return saveState
}

function useCanvasSession() {
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [paneMenu, setPaneMenu] = useState<{ x: number; y: number } | null>(
    null
  )
  const [nodeMenu, setNodeMenu] = useState<{
    x: number
    y: number
    nodeId: string
  } | null>(null)
  const [locked, setLocked] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

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

  function clearMenus() {
    setPaneMenu(null)
    setNodeMenu(null)
  }

  function openPaneMenu(event: { clientX: number; clientY: number }) {
    setNodeMenu(null)
    setPaneMenu({ x: event.clientX, y: event.clientY })
  }

  return {
    sheetId,
    setSheetId,
    pickerOpen,
    setPickerOpen,
    paneMenu,
    setPaneMenu,
    nodeMenu,
    setNodeMenu,
    locked,
    setLocked,
    historyOpen,
    setHistoryOpen,
    onNodeClick,
    onNodeDoubleClick,
    onNodeContextMenu,
    clearMenus,
    openPaneMenu,
  }
}

function CanvasRunPanel({
  workflow,
  saveState,
  onOpenHistory,
}: {
  workflow: Workflow
  saveState: WorkflowSaveState
  onOpenHistory: () => void
}) {
  return (
    <Panel position="top-right" className="m-3">
      <WorkflowRunBar
        workflowId={workflow.id}
        workflowName={workflow.name}
        saveState={saveState}
        onOpenHistory={onOpenHistory}
      />
    </Panel>
  )
}

function WorkflowCanvasOverlays({
  workflow,
  graph,
  session,
  sheetNode,
  onAdd,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  workflow: Workflow
  graph: { nodes: VantegNode[]; edges: VantegEdge[] }
  session: ReturnType<typeof useCanvasSession>
  sheetNode: VantegNode | null
  onAdd: (nodeType: WorkflowNodeType) => void
  onUpdate: (nodeId: string, patch: VantegNodePatch) => void
  onDuplicate: (nodeId: string) => void
  onDelete: (nodeId: string) => void
}) {
  const pane = menuPosition(session.paneMenu)
  const node = menuPosition(session.nodeMenu)

  function runIfNodeMenu(action: (nodeId: string) => void) {
    const menu = session.nodeMenu
    if (!menu) {
      return
    }
    action(menu.nodeId)
  }

  return (
    <>
      <PaneAddMenu
        open={session.paneMenu !== null}
        x={pane.x}
        y={pane.y}
        onClose={() => session.setPaneMenu(null)}
        onAdd={onAdd}
        onMore={() => session.setPickerOpen(true)}
      />
      <NodeActionMenu
        open={session.nodeMenu !== null}
        x={node.x}
        y={node.y}
        onClose={() => session.setNodeMenu(null)}
        onOpen={() => runIfNodeMenu(session.setSheetId)}
        onDuplicate={() => runIfNodeMenu(onDuplicate)}
        onDelete={() => runIfNodeMenu(onDelete)}
      />
      <NodeSheet
        node={sheetNode}
        nodes={graph.nodes}
        edges={graph.edges}
        onClose={() => session.setSheetId(null)}
        onChange={onUpdate}
      />
      <NodePickerDialog
        open={session.pickerOpen}
        onOpenChange={session.setPickerOpen}
        onAdd={onAdd}
      />
      <WorkflowRunHistorySheet
        open={session.historyOpen}
        onOpenChange={session.setHistoryOpen}
        workflowId={workflow.id}
        workflowName={workflow.name}
      />
    </>
  )
}

function WorkflowCanvasInner({ workflow }: { workflow: Workflow }) {
  const graph = useWorkflowGraph(workflow)
  const saveState = useWorkflowPersistence(
    workflow.id,
    graph.nodes,
    graph.edges
  )
  const session = useCanvasSession()
  const dropPosition = useRef({ x: 120, y: 160 })
  const { screenToFlowPosition, fitView } = useReactFlow()

  function revealNodes() {
    queueMicrotask(() => {
      void fitView({ padding: 0.25, duration: 180 })
    })
  }

  function rememberClient(event: { clientX: number; clientY: number }) {
    dropPosition.current = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  function addNode(nodeType: WorkflowNodeType) {
    const node = createVantegNode(nodeType.id, dropPosition.current)
    graph.setNodes((current) => [...current, node])
    revealNodes()
  }

  function updateNode(nodeId: string, patch: VantegNodePatch) {
    graph.setNodes((current) => patchNodeData(current, nodeId, patch))
  }

  function duplicateNode(nodeId: string) {
    const node = graph.nodes.find((item) => item.id === nodeId)
    if (!node) {
      return
    }
    graph.setNodes((current) => [...current, cloneVantegNode(node)])
    revealNodes()
  }

  function deleteNode(nodeId: string) {
    dropNodeAndEdges(nodeId, graph.setNodes, graph.setEdges)
    if (session.sheetId === nodeId) {
      session.setSheetId(null)
    }
  }

  const sheetNode = findSheetNode(graph.nodes, session.sheetId)

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="relative min-h-0 min-w-0 flex-1">
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          onNodesChange={graph.onNodesChange}
          onEdgesChange={graph.onEdgesChange}
          onConnect={graph.onConnect}
          onNodeClick={session.onNodeClick}
          onNodeDoubleClick={session.onNodeDoubleClick}
          onNodeContextMenu={session.onNodeContextMenu}
          onPaneClick={session.clearMenus}
          onPaneContextMenu={(event) => {
            event.preventDefault()
            rememberClient(event)
            session.openPaneMenu(event)
          }}
          nodeTypes={workflowNodeTypes}
          fitView
          snapToGrid
          snapGrid={flowSnapGrid}
          colorMode="light"
          deleteKeyCode={canvasDeleteKeys(session.sheetId, session.locked)}
          proOptions={flowProOptions}
          className={flowCanvasClassName}
          {...flowInteractionProps(session.locked)}
        >
          <FlowCanvasChrome
            locked={session.locked}
            onLockedChange={session.setLocked}
          >
            <CanvasRunPanel
              workflow={workflow}
              saveState={saveState}
              onOpenHistory={() => session.setHistoryOpen(true)}
            />
            <EmptyCanvasHint empty={graph.nodes.length === 0} />
          </FlowCanvasChrome>
        </ReactFlow>
      </div>
      <WorkflowCanvasOverlays
        workflow={workflow}
        graph={graph}
        session={session}
        sheetNode={sheetNode}
        onAdd={addNode}
        onUpdate={updateNode}
        onDuplicate={duplicateNode}
        onDelete={deleteNode}
      />
    </div>
  )
}
