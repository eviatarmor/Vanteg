import { Plus, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { MentionItem } from "@/components/mention/types"

import {
  CONDITION_OPERATORS,
  emptyConditionRow,
  isUnaryOperator,
  parseConditionGroup,
  serializeConditionGroup,
  type ConditionJoin,
} from "../model/conditions"
import type { FieldMode } from "../model/types"
import { WorkflowExpressionInput } from "./WorkflowExpressionInput"

const CATEGORIES = [
  "general",
  "string",
  "number",
  "datetime",
  "boolean",
  "array",
  "object",
] as const

const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  general: "General",
  string: "String",
  number: "Number",
  datetime: "Date & Time",
  boolean: "Boolean",
  array: "Array",
  object: "Object",
}

export function ConditionBuilder({
  id,
  label = "Conditions",
  value,
  items,
  availablePaths,
  mode = "expression",
  onChange,
}: {
  id?: string
  label?: string
  value: string
  items: MentionItem[]
  availablePaths: Iterable<string>
  mode?: FieldMode
  onChange: (value: string) => void
}) {
  const group = parseConditionGroup(value)
  const setJoin = (join: ConditionJoin) =>
    onChange(serializeConditionGroup({ ...group, join }))
  const updateRule = (ruleId: string, patch: Partial<(typeof group.rules)[number]>) => {
    onChange(
      serializeConditionGroup({
        ...group,
        rules: group.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
      })
    )
  }

  return (
    <div id={id} className="grid gap-3" role="group" aria-label={label}>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Match</Label>
        <Select value={group.join} onValueChange={(next) => next && setJoin(next as ConditionJoin)}>
          <SelectTrigger className="w-28" aria-label="Join">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">AND</SelectItem>
            <SelectItem value="or">OR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {group.rules.map((rule, index) => {
        const unary = isUnaryOperator(rule.operator)
        return (
          <div key={rule.id} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {index === 0 ? "If" : group.join === "or" ? "Or" : "And"}
              </p>
              {group.rules.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove condition ${index + 1}`}
                  onClick={() =>
                    onChange(
                      serializeConditionGroup({
                        ...group,
                        rules: group.rules.filter((item) => item.id !== rule.id),
                      })
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Value 1</Label>
              <WorkflowExpressionInput
                value={rule.left}
                items={items}
                availablePaths={availablePaths}
                mode={mode}
                placeholder="{{Webhook.body.status}}"
                aria-label={`Value 1 for condition ${index + 1}`}
                onChange={(left) => updateRule(rule.id, { left })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Operator</Label>
              <Select
                value={rule.operator}
                onValueChange={(operator) => operator && updateRule(rule.id, { operator })}
              >
                <SelectTrigger aria-label={`Operator for condition ${index + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <div key={category}>
                      <p className="px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        {CATEGORY_LABEL[category]}
                      </p>
                      {CONDITION_OPERATORS.filter((item) => item.category === category).map(
                        (item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        )
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {unary ? null : (
              <div className="grid gap-2">
                <Label>Value 2</Label>
                <WorkflowExpressionInput
                  value={rule.right}
                  items={items}
                  availablePaths={availablePaths}
                  mode={mode}
                  placeholder="open"
                  aria-label={`Value 2 for condition ${index + 1}`}
                  onChange={(right) => updateRule(rule.id, { right })}
                />
              </div>
            )}
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange(
            serializeConditionGroup({
              ...group,
              rules: [...group.rules, emptyConditionRow()],
            })
          )
        }
      >
        <Plus className="size-3.5" />
        Add condition
      </Button>
    </div>
  )
}
