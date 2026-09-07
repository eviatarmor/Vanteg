import { useCallback, useEffect, useState } from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Panel,
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
import type { Team, TeamNode } from "../model/types"
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
        snapGrid={[16, 16]}
        colorMode="light"
        className="h-full w-full bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls />
        <Panel
          position="top-center"
          className="pointer-events-none text-xs text-muted-foreground"
        >
          Right-click to add an agent. Connect nodes to orchestrate handoffs.
        </Panel>
      </ReactFlow>
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
        onAdd={(agentId, role) => {
          const node = addTeamMember(team.id, agentId, role)
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
        onSave={(role) => {
          if (!sheetId) {
            return
          }
          updateTeamMember(team.id, sheetId, { role })
          setNodes((current) =>
            current.map((node) =>
              node.id === sheetId ? { ...node, data: { ...node.data, role } } : node
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
