import { useCallback, useEffect, useRef, useState } from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
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

import { createFreezeNode } from "../model/create-node"
import { wireConnection } from "../model/node-io"
import { saveWorkflow } from "../model/store"
import type {
  FreezeNode,
  FreezeNodePatch,
  Workflow,
  WorkflowNodeType,
} from "../model/types"
import { NodeActionMenu, PaneAddMenu } from "./FlowMenus"
import { workflowNodeTypes } from "./FreezeNode"
import { NodePickerDialog } from "./NodePickerDialog"
import { NodeSheet } from "./NodeSheet"

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
  const { screenToFlowPosition, fitView } = useReactFlow()

  function revealNodes() {
    queueMicrotask(() => {
      void fitView({ padding: 0.25, duration: 180 })
    })
  }

  useEffect(() => {
    saveWorkflow(workflow.id, { nodes, edges })
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

  const onNodeClick: NodeMouseHandler<FreezeNode> = useCallback(() => {
    setPaneMenu(null)
    setNodeMenu(null)
  }, [])

  const onNodeDoubleClick: NodeMouseHandler<FreezeNode> = useCallback(
    (_event, node) => {
      setSheetId(node.id)
    },
    []
  )

  const onNodeContextMenu: NodeMouseHandler<FreezeNode> = useCallback(
    (event, node) => {
      event.preventDefault()
      event.stopPropagation()
      setPaneMenu(null)
      setNodeMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
    },
    []
  )

  function addNode(nodeType: WorkflowNodeType) {
    const node = createFreezeNode(nodeType.id, dropPosition.current)
    setNodes((current) => [...current, node])
    revealNodes()
  }

  function updateNode(nodeId: string, patch: FreezeNodePatch) {
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
    const copy: FreezeNode = {
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
          snapGrid={[16, 16]}
          colorMode="light"
          deleteKeyCode={sheetId ? null : ["Backspace", "Delete"]}
          className="h-full w-full bg-background"
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          <Controls />
          <Panel
            position="top-center"
            className="pointer-events-none text-xs text-muted-foreground"
          >
            Right-click the canvas to add a step. Double-click a node to edit it.
          </Panel>
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
        onClose={() => setSheetId(null)}
        onChange={updateNode}
      />
      <NodePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAdd={addNode}
      />
    </div>
  )
}
