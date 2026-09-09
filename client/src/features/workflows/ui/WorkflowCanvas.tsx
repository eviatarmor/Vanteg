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
import { WorkflowRunBar } from "./WorkflowToolbar"

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
              />
            </Panel>
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
    </div>
  )
}
