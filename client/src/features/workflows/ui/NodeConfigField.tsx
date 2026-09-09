import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"

import type { NodeField, VantegNode, VantegNodePatch } from "../model/types"
import { CodeField } from "./CodeField"
import { ResourceSelectField } from "./ResourceSelectField"

export function NodeConfigField({
  field,
  node,
  onChange,
}: {
  field: NodeField
  node: VantegNode
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  return (
    <div className="grid gap-2">
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
}
