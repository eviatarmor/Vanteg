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
import type {
  NodeField,
  VantegNode,
  VantegNodePatch,
  WorkflowNodeType,
} from "../model/types"
import { CodeField } from "./CodeField"
import { CredentialPicker } from "./CredentialPicker"
import { ResourceSelectField } from "./ResourceSelectField"

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

function NodeFieldControl({
  field,
  node,
  onChange,
}: {
  field: NodeField
  node: VantegNode
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const id = `node-${field.key}`
  const value = node.data.config[field.key] ?? ""
  const setValue = (next: string) =>
    onChange(node.id, patchField(node, field, next))

  if (field.control === "code") {
    return (
      <CodeField
        id={id}
        value={value}
        language={field.language ?? "javascript"}
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

export function NodeConfigFields({
  node,
  catalog,
  onChange,
}: {
  node: VantegNode
  catalog: WorkflowNodeType
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const { customCredentials } = useIntegrationsStore()
  const credentialIds = customCredentials.map((item) => item.id)

  if (catalog.fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This step has no extra settings. Rename it or add notes below.
      </p>
    )
  }

  return (
    <section className="grid gap-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Configuration
      </p>
      {catalog.fields.map((field) => {
        if (isInlineAuthSuperseded(field, node.data.config, credentialIds)) {
          return null
        }
        if (field.control === "credential") {
          return (
            <CredentialPicker
              key={field.key}
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
          )
        }
        return (
          <div key={field.key} className="grid gap-2">
            <Label htmlFor={`node-${field.key}`}>{field.label}</Label>
            <NodeFieldControl field={field} node={node} onChange={onChange} />
            {field.help ? (
              <p className="text-xs text-muted-foreground">{field.help}</p>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}
