export type ConditionJoin = "and" | "or"

export type ConditionOperatorCategory =
  | "general"
  | "string"
  | "number"
  | "datetime"
  | "boolean"
  | "array"
  | "object"

export interface ConditionOperator {
  value: string
  label: string
  category: ConditionOperatorCategory
  arity: 1 | 2
}

export const CONDITION_OPERATORS: readonly ConditionOperator[] = [
  { value: "exists", label: "Exists", category: "general", arity: 1 },
  { value: "not_exists", label: "Does not exist", category: "general", arity: 1 },
  { value: "empty", label: "Is empty", category: "general", arity: 1 },
  { value: "not_empty", label: "Is not empty", category: "general", arity: 1 },
  { value: "type_is", label: "Type is", category: "general", arity: 2 },
  { value: "eq", label: "Equals", category: "string", arity: 2 },
  { value: "neq", label: "Does not equal", category: "string", arity: 2 },
  { value: "contains", label: "Contains", category: "string", arity: 2 },
  { value: "not_contains", label: "Does not contain", category: "string", arity: 2 },
  { value: "starts_with", label: "Starts with", category: "string", arity: 2 },
  { value: "ends_with", label: "Ends with", category: "string", arity: 2 },
  { value: "regex", label: "Matches regex", category: "string", arity: 2 },
  { value: "num_eq", label: "Equals", category: "number", arity: 2 },
  { value: "num_neq", label: "Does not equal", category: "number", arity: 2 },
  { value: "gt", label: "Greater than", category: "number", arity: 2 },
  { value: "gte", label: "Greater than or equal", category: "number", arity: 2 },
  { value: "lt", label: "Less than", category: "number", arity: 2 },
  { value: "lte", label: "Less than or equal", category: "number", arity: 2 },
  { value: "between", label: "Between", category: "number", arity: 2 },
  { value: "before", label: "Before", category: "datetime", arity: 2 },
  { value: "after", label: "After", category: "datetime", arity: 2 },
  { value: "on", label: "On", category: "datetime", arity: 2 },
  { value: "date_between", label: "Between", category: "datetime", arity: 2 },
  { value: "past", label: "Is in the past", category: "datetime", arity: 1 },
  { value: "future", label: "Is in the future", category: "datetime", arity: 1 },
  { value: "is_true", label: "Is true", category: "boolean", arity: 1 },
  { value: "is_false", label: "Is false", category: "boolean", arity: 1 },
  { value: "bool_eq", label: "Equals", category: "boolean", arity: 2 },
  { value: "array_contains", label: "Contains", category: "array", arity: 2 },
  { value: "array_not_contains", label: "Does not contain", category: "array", arity: 2 },
  { value: "array_any", label: "Any item matches", category: "array", arity: 2 },
  { value: "array_all", label: "All items match", category: "array", arity: 2 },
  { value: "array_length_eq", label: "Length equals", category: "array", arity: 2 },
  { value: "array_length_gt", label: "Length greater than", category: "array", arity: 2 },
  { value: "array_length_lt", label: "Length less than", category: "array", arity: 2 },
  { value: "array_empty", label: "Is empty", category: "array", arity: 1 },
  { value: "has_key", label: "Has key", category: "object", arity: 2 },
  { value: "not_has_key", label: "Does not have key", category: "object", arity: 2 },
  { value: "prop_eq", label: "Property equals", category: "object", arity: 2 },
  { value: "object_empty", label: "Is empty", category: "object", arity: 1 },
]

const OPERATORS_BY_VALUE = new Map(
  CONDITION_OPERATORS.map((operator) => [operator.value, operator])
)

export function getConditionOperator(value: string): ConditionOperator | undefined {
  return OPERATORS_BY_VALUE.get(value)
}

export function isUnaryOperator(value: string): boolean {
  return getConditionOperator(value)?.arity === 1
}

export interface ConditionRow {
  id: string
  left: string
  operator: string
  right: string
}

export interface ConditionGroup {
  join: ConditionJoin
  rules: ConditionRow[]
}

export function emptyConditionRow(): ConditionRow {
  return {
    id: crypto.randomUUID(),
    left: "",
    operator: "eq",
    right: "",
  }
}

export function defaultConditionGroup(): ConditionGroup {
  return { join: "and", rules: [emptyConditionRow()] }
}

export function parseConditionGroup(value: string | undefined): ConditionGroup {
  if (!value?.trim()) {
    return defaultConditionGroup()
  }
  try {
    const parsed = JSON.parse(value) as Partial<ConditionGroup>
    if (parsed && Array.isArray(parsed.rules)) {
      return {
        join: parsed.join === "or" ? "or" : "and",
        rules: parsed.rules.map((rule) => ({
          id: rule.id || crypto.randomUUID(),
          left: rule.left ?? "",
          operator: rule.operator || "eq",
          right: rule.right ?? "",
        })),
      }
    }
  } catch {
    // Legacy free-text condition from older workflows.
  }
  return {
    join: "and",
    rules: [
      {
        id: crypto.randomUUID(),
        left: value,
        operator: "eq",
        right: "",
      },
    ],
  }
}

export function serializeConditionGroup(group: ConditionGroup): string {
  return JSON.stringify(group)
}

/** Migrate `{ condition, operator }` into the structured condition JSON. */
export function migrateLegacyCondition(config: Record<string, string>): string {
  if (config.conditions?.trim()) {
    return config.conditions
  }
  if (!config.condition && !config.operator) {
    return serializeConditionGroup(defaultConditionGroup())
  }
  return serializeConditionGroup({
    join: "and",
    rules: [
      {
        id: crypto.randomUUID(),
        left: config.condition ?? "",
        operator: config.operator || "eq",
        right: "",
      },
    ],
  })
}
