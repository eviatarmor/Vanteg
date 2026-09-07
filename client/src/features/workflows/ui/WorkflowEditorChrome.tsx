import { Link, matchPath, useLocation } from "react-router"

import { Badge } from "@workspace/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Editable,
  EditableArea,
  EditableInput,
  EditableLabel,
  EditablePreview,
} from "@workspace/ui/components/editable"

import { getWorkflow, saveWorkflow, useWorkflows } from "../model/store"
import type { WorkflowStatus } from "../model/types"

const statuses: WorkflowStatus[] = ["draft", "dev", "prod"]

const statusClass: Record<WorkflowStatus, string> = {
  draft: "border-transparent bg-sidebar-accent text-sidebar-foreground capitalize",
  dev: "border-transparent bg-amber-200/90 text-amber-950 capitalize",
  prod: "border-transparent bg-emerald-200/90 text-emerald-950 capitalize",
}

export function WorkflowEditorChrome() {
  useWorkflows()
  const location = useLocation()
  const workflowId = matchPath(
    "/workflows/:workflowId",
    location.pathname
  )?.params.workflowId
  const workflow = workflowId ? getWorkflow(workflowId) : undefined

  if (!workflow) {
    return (
      <h1 className="truncate text-base font-semibold tracking-tight">Workflows</h1>
    )
  }

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="text-sidebar-foreground/80">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/workflows"
              className="text-sidebar-foreground/80 hover:text-sidebar-foreground"
            >
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-sidebar-foreground/40" />
        <BreadcrumbItem className="min-w-0">
          <Editable
            value={workflow.name}
            onValueChange={(name) => saveWorkflow(workflow.id, { name })}
            autosize
            placeholder="Untitled workflow"
            className="gap-0"
          >
            <EditableLabel className="sr-only">Workflow name</EditableLabel>
            <EditableArea>
              <EditablePreview className="max-w-64 py-0.5 text-sm text-sidebar-foreground" />
              <EditableInput
                aria-label="Workflow name"
                className="h-7 max-w-64 border-sidebar-border bg-sidebar-accent/50 py-0.5 text-sidebar-foreground shadow-none"
              />
            </EditableArea>
          </Editable>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Workflow environment">
                <Badge className={statusClass[workflow.status]}>
                  {workflow.status}
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  className="capitalize"
                  onSelect={() => saveWorkflow(workflow.id, { status })}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
