import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"

import { SecretInput } from "@/components/secret-input"
import { useIntegrationsStore } from "@/features/integrations/model/store"

import {
  isInlineAuthSuperseded,
  patchConfigForCredential,
} from "../model/auth-fields"
import { executionOptionFields } from "../model/execution-options"
import { isFieldVisible } from "../model/field-visibility"
import { validateNodeSetup, type FieldError } from "../model/node-validation"
import { nextRunPreview, parseWeekdays, scheduleSummary } from "../model/schedule"
import type {
  FieldSection,
  NodeField,
  VantegEdge,
  VantegNode,
  VantegNodePatch,
  Workflow,
  WorkflowNodeType,
} from "../model/types"
import { CodeField } from "./CodeField"
import { ConditionBuilder } from "./ConditionBuilder"
import { CredentialPicker } from "./CredentialPicker"
import { CronScheduleBuilder } from "./CronScheduleBuilder"
import { KeyValueEditor } from "./KeyValueEditor"
import { MappingEditor } from "./MappingEditor"
import { ResourceSelectField } from "./ResourceSelectField"
import { RouteEditor } from "./RouteEditor"
import { SchemaBuilder } from "./SchemaBuilder"
import {
  availableUpstreamPaths,
  upstreamOutputItems,
  WorkflowExpressionInput,
} from "./WorkflowExpressionInput"

function patchField(
  node: VantegNode,
  field: NodeField,
  value: string
): VantegNodePatch {
  return {
    config: {
      ...node.data.config,
      [field.key]: value,
    },
  }
}

const SECTION_LABEL: Record<FieldSection, string> = {
  connection: "Connection",
  parameters: "Parameters",
  options: "Options",
  execution: "Execution",
}

const SECTION_ORDER: FieldSection[] = [
  "connection",
  "parameters",
  "options",
  "execution",
]

function fieldSection(field: NodeField): FieldSection {
  return field.section ?? "parameters"
}

function MultiSelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const selected = new Set(parseWeekdays(value))
  return (
    <div id={id} className="grid gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const checked = selected.has(option.value)
        return (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                const next = new Set(selected)
                if (checked) {
                  next.delete(option.value)
                } else {
                  next.add(option.value)
                }
                onChange(JSON.stringify([...next]))
              }}
            />
            {option.label}
          </label>
        )
      })}
    </div>
  )
}

function NodeFieldControl({
  field,
  node,
  nodes,
  edges,
  onChange,
}: {
  field: NodeField
  node: VantegNode
  catalog: WorkflowNodeType
  nodes: VantegNode[]
  edges: VantegEdge[]
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const id = `node-${field.key}`
  const value = node.data.config[field.key] ?? ""
  const setValue = (next: string) => onChange(node.id, patchField(node, field, next))
  const items = upstreamOutputItems(node.id, nodes, edges)
  const availablePaths = availableUpstreamPaths(node.id, nodes, edges)
  const mode = field.mode ?? (field.control === "select" || field.control === "boolean" ? "fixed" : "either")
  const expressionCapable =
    mode !== "fixed" &&
    (!field.control ||
      field.control === "input" ||
      field.control === "textarea" ||
      field.control === "expression")

  if (field.control === "code") {
    return (
      <CodeField
        id={id}
        value={value}
        language={field.language === "python" ? "javascript" : (field.language ?? "javascript")}
        onChange={setValue}
      />
    )
  }
  if (field.control === "conditions") {
    return (
      <ConditionBuilder
        id={id}
        label={field.label}
        value={value}
        items={items}
        availablePaths={availablePaths}
        mode={mode === "fixed" ? "either" : mode}
        onChange={setValue}
      />
    )
  }
  if (field.control === "keyValue") {
    return (
      <KeyValueEditor
        id={id}
        label={field.label}
        value={value}
        items={items}
        availablePaths={availablePaths}
        mode={mode}
        onChange={setValue}
      />
    )
  }
  if (field.control === "mapping") {
    return (
      <MappingEditor
        id={id}
        label={field.label}
        value={value}
        items={items}
        availablePaths={availablePaths}
        mode={mode}
        onChange={setValue}
      />
    )
  }
  if (field.control === "schema") {
    return <SchemaBuilder id={id} label={field.label} value={value} onChange={setValue} />
  }
  if (field.control === "cron") {
    return (
      <CronScheduleBuilder
        id={id}
        value={value}
        placeholder={field.placeholder}
        config={node.data.config}
        onChange={setValue}
      />
    )
  }
  if (field.control === "routes") {
    return (
      <RouteEditor
        id={id}
        label={field.label}
        value={value}
        items={items}
        availablePaths={availablePaths}
        mode={mode}
        onChange={setValue}
      />
    )
  }
  if (field.control === "multiselect" && field.options) {
    return (
      <MultiSelectField
        id={id}
        label={field.label}
        value={value}
        options={field.options}
        onChange={setValue}
      />
    )
  }
  if (field.control === "resource" && field.resourceType) {
    return (
      <ResourceSelectField
        id={id}
        label={field.label}
        value={value}
        placeholder={field.placeholder}
        resourceType={field.resourceType}
        onChange={setValue}
      />
    )
  }
  if (field.control === "number") {
    return (
      <Input
        id={id}
        type="number"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => setValue(event.target.value)}
      />
    )
  }
  if (field.control === "datetime") {
    return (
      <Input
        id={id}
        type="datetime-local"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => setValue(event.target.value)}
      />
    )
  }
  if (field.control === "select" && field.options) {
    return (
      <Select
        value={value || field.options[0]?.value}
        onValueChange={(next) => {
          if (next) setValue(next)
        }}
      >
        <SelectTrigger id={id} className="w-full" aria-label={field.label}>
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  if (field.control === "boolean") {
    return (
      <Switch
        id={id}
        checked={(value || field.placeholder) !== "false"}
        onCheckedChange={(checked) => setValue(checked ? "true" : "false")}
      />
    )
  }
  if (field.secret && mode === "fixed") {
    return (
      <SecretInput
        id={id}
        value={value}
        placeholder={field.placeholder}
        onValueChange={setValue}
      />
    )
  }
  if (expressionCapable || field.control === "expression") {
    return (
      <WorkflowExpressionInput
        id={id}
        value={value}
        placeholder={field.placeholder}
        mode={mode}
        secret={field.secret}
        items={items}
        availablePaths={availablePaths}
        aria-label={field.label}
        onChange={setValue}
      />
    )
  }
  if (field.control === "textarea") {
    return (
      <Textarea
        id={id}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => setValue(event.target.value)}
      />
    )
  }
  if (field.secret) {
    return (
      <SecretInput
        id={id}
        value={value}
        placeholder={field.placeholder}
        onValueChange={setValue}
      />
    )
  }
  return (
    <Input
      id={id}
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

function FieldBlock({
  field,
  node,
  catalog,
  nodes,
  edges,
  errors,
  onChange,
}: {
  field: NodeField
  node: VantegNode
  catalog: WorkflowNodeType
  nodes: VantegNode[]
  edges: VantegEdge[]
  errors: FieldError[]
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const fieldErrors = errors.filter((error) => error.key === field.key)
  return (
    <div className="grid gap-2">
      {field.control === "boolean" ? (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`node-${field.key}`}>{field.label}</Label>
          <NodeFieldControl
            field={field}
            node={node}
            catalog={catalog}
            nodes={nodes}
            edges={edges}
            onChange={onChange}
          />
        </div>
      ) : field.control === "credential" ? null : (
        <>
          <Label htmlFor={`node-${field.key}`}>{field.label}</Label>
          <NodeFieldControl
            field={field}
            node={node}
            catalog={catalog}
            nodes={nodes}
            edges={edges}
            onChange={onChange}
          />
        </>
      )}
      {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
      {fieldErrors.map((error) => (
        <p key={error.message} className="text-xs text-destructive" role="status">
          {error.message}
        </p>
      ))}
    </div>
  )
}

export function NodeConfigFields({
  node,
  catalog,
  nodes = [],
  edges = [],
  workflow,
  onChange,
}: {
  node: VantegNode
  catalog: WorkflowNodeType
  nodes?: VantegNode[]
  edges?: VantegEdge[]
  workflow?: Workflow
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const { customCredentials } = useIntegrationsStore()
  const credentialIds = customCredentials.map((item) => item.id)
  const extra = executionOptionFields(catalog.executionOptions)
  const allFields = [...catalog.fields, ...extra.filter((field) => !catalog.fields.some((item) => item.key === field.key))]
  const errors = validateNodeSetup(node, { ...catalog, fields: allFields }, workflow)

  const visible = allFields.filter((field) => {
    if (isInlineAuthSuperseded(field, node.data.config, credentialIds)) {
      return false
    }
    return isFieldVisible(field, node.data.config)
  })

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This step has no extra settings.
      </p>
    )
  }

  const grouped = SECTION_ORDER.map((section) => ({
    section,
    fields: visible.filter((field) => fieldSection(field) === section),
  })).filter((group) => group.fields.length > 0)

  return (
    <div className="grid gap-6">
      {grouped.map((group) => (
        <section key={group.section} className="grid gap-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {SECTION_LABEL[group.section]}
          </p>
          {group.fields.map((field) => {
            if (field.control === "credential") {
              return (
                <div key={field.key} className="grid gap-2">
                  <CredentialPicker
                    id={`node-${field.key}`}
                    label={field.label}
                    help={field.help}
                    value={node.data.config[field.key] ?? ""}
                    onChange={(credentialId) =>
                      onChange(node.id, {
                        config: patchConfigForCredential(
                          node.data.config,
                          credentialId,
                          catalog.fields
                        ),
                      })
                    }
                  />
                  {errors
                    .filter((error) => error.key === field.key)
                    .map((error) => (
                      <p key={error.message} className="text-xs text-destructive" role="status">
                        {error.message}
                      </p>
                    ))}
                </div>
              )
            }
            return (
              <FieldBlock
                key={field.key}
                field={field}
                node={node}
                catalog={catalog}
                nodes={nodes}
                edges={edges}
                errors={errors}
                onChange={onChange}
              />
            )
          })}
        </section>
      ))}
      {catalog.id === "schedule" ? (
        <p className="text-xs text-muted-foreground">
          {scheduleSummary(node.data.config)} · Next: {nextRunPreview(node.data.config)}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <div className="grid gap-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3" role="status">
          <p className="text-xs font-medium text-destructive">Fix these before Test or Publish</p>
          {errors.map((error) => (
            <p key={`${error.key}:${error.message}`} className="text-xs text-destructive">
              {error.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
