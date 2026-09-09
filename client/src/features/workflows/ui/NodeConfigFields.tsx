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

import { isInlineAuthSuperseded, patchConfigForCredential } from "../model/auth-fields"
import type { VantegNode, VantegNodePatch, WorkflowNodeType } from "../model/types"
import { CodeField } from "./CodeField"
import { CredentialPicker } from "./CredentialPicker"
import { ResourceSelectField } from "./ResourceSelectField"

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
            {field.control === "code" ? (
              <CodeField
                id={`node-${field.key}`}
                value={node.data.config[field.key] ?? ""}
                language={field.language ?? "javascript"}
                onChange={(value) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: value,
                    },
                  })
                }
              />
            ) : field.control === "textarea" ? (
              <Textarea
                id={`node-${field.key}`}
                value={node.data.config[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: event.target.value,
                    },
                  })
                }
              />
            ) : field.control === "resource" && field.resourceType ? (
              <ResourceSelectField
                id={`node-${field.key}`}
                label={field.label}
                value={node.data.config[field.key] ?? ""}
                placeholder={field.placeholder}
                resourceType={field.resourceType}
                onChange={(value) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: value,
                    },
                  })
                }
              />
            ) : field.control === "select" && field.options ? (
              <Select
                value={node.data.config[field.key] || field.options[0]?.value}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: value,
                    },
                  })
                }}
              >
                <SelectTrigger
                  id={`node-${field.key}`}
                  className="w-full"
                  aria-label={field.label}
                >
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
            ) : field.control === "boolean" ? (
              <Switch
                id={`node-${field.key}`}
                checked={(node.data.config[field.key] ?? field.placeholder) !== "false"}
                onCheckedChange={(checked) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: checked ? "true" : "false",
                    },
                  })
                }
              />
            ) : field.secret ? (
              <SecretInput
                id={`node-${field.key}`}
                value={node.data.config[field.key] ?? ""}
                placeholder={field.placeholder}
                onValueChange={(value) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: value,
                    },
                  })
                }
              />
            ) : (
              <Input
                id={`node-${field.key}`}
                value={node.data.config[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) =>
                  onChange(node.id, {
                    config: {
                      ...node.data.config,
                      [field.key]: event.target.value,
                    },
                  })
                }
              />
            )}
            {field.help ? (
              <p className="text-xs text-muted-foreground">{field.help}</p>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}
