import { useCallback, useEffect, useState } from "react"
import { Plus, Users } from "lucide-react"
import {
  addEdge,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import {
  FlowCanvasChrome,
  flowCanvasClassName,
  flowInteractionProps,
  flowProOptions,
  flowSnapGrid,
} from "@/components/flow-canvas/canvas-controls"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import {
  addTeamMember,
  deleteTeamMember,
  saveTeam,
  updateTeamMember,
} from "../model/store"
import type { Team, TeamCapability, TeamNode } from "../model/types"
import { AddMemberDialog } from "./AddMemberDialog"
import { MemberSheet } from "./MemberSheet"
import { TeamAgentNode } from "./TeamAgentNode"

const nodeTypes: NodeTypes = { agent: TeamAgentNode }

export function TeamCanvas({ team }: { team: Team }) {
  return (
    <ReactFlowProvider>
      <TeamCanvasInner team={team} />
    </ReactFlowProvider>
  )
}

function TeamCanvasInner({ team }: { team: Team }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(team.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(team.edges)
  const [paneMenu, setPaneMenu] = useState<{ x: number; y: number } | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    saveTeam(team.id, { nodes, edges })
  }, [edges, nodes, team.id])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            animated: true,
            label: "handoff",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          current
        )
      )
    },
    [setEdges]
  )

  const onNodeDoubleClick: NodeMouseHandler<TeamNode> = useCallback((_event, node) => {
    setSheetId(node.id)
  }, [])

  const sheetNode = nodes.find((node) => node.id === sheetId) ?? null

  return (
    <div className="relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={() => setPaneMenu(null)}
        onPaneContextMenu={(event) => {
          event.preventDefault()
          setPaneMenu({ x: event.clientX, y: event.clientY })
        }}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={flowSnapGrid}
        colorMode="light"
        deleteKeyCode={sheetId || locked ? null : ["Backspace", "Delete"]}
        proOptions={flowProOptions}
        className={flowCanvasClassName}
        {...flowInteractionProps(locked)}
      >
        <FlowCanvasChrome locked={locked} onLockedChange={setLocked} />
      </ReactFlow>
      {nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
          <div className="pointer-events-auto flex max-w-sm flex-col items-center rounded-xl border border-dashed border-border bg-card/95 px-6 py-8 text-center shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No members yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add agents as Lead, Researcher, Writer, and more — then wire how they hand off work.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setAddOpen(true)}>
              <Plus />
              Add member
            </Button>
          </div>
        </div>
      ) : null}
      {paneMenu ? (
        <DropdownMenu open onOpenChange={(open) => !open && setPaneMenu(null)}>
          <DropdownMenuTrigger asChild>
            <span
              aria-hidden
              className="pointer-events-none fixed size-px overflow-hidden opacity-0"
              style={{ left: paneMenu.x, top: paneMenu.y }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => {
                setPaneMenu(null)
                setAddOpen(true)
              }}
            >
              Add member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(agentId, role, capabilities) => {
          const node = addTeamMember(team.id, agentId, role, capabilities)
          if (node) {
            setNodes((current) => [...current, node])
          }
        }}
      />
      <MemberSheet
        node={sheetNode}
        open={sheetNode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSheetId(null)
          }
        }}
        onSave={({ role, capabilities }: { role: string; capabilities: TeamCapability[] }) => {
          if (!sheetId) {
            return
          }
          updateTeamMember(team.id, sheetId, { role, capabilities })
          setNodes((current) =>
            current.map((node) =>
              node.id === sheetId
                ? { ...node, data: { ...node.data, role, capabilities } }
                : node
            )
          )
        }}
        onDelete={() => {
          if (!sheetId) {
            return
          }
          deleteTeamMember(team.id, sheetId)
          setNodes((current) => current.filter((node) => node.id !== sheetId))
          setEdges((current) =>
            current.filter((edge) => edge.source !== sheetId && edge.target !== sheetId)
          )
          setSheetId(null)
        }}
      />
    </div>
  )
}
