import type { NodeField } from "./types"

const LOGIC_OPERATORS = [
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "empty", label: "Is empty" },
  { value: "not_empty", label: "Is not empty" },
] as const

const DELAY_UNITS = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
] as const

export function logicConditionField(placeholder: string): NodeField {
  return {
    key: "condition",
    label: "Condition",
    placeholder,
    control: "textarea",
    help: "Expression evaluated against the current item.",
  }
}

export function logicOperatorField(placeholder = "eq"): NodeField {
  return {
    key: "operator",
    label: "Operator",
    placeholder,
    control: "select",
    options: LOGIC_OPERATORS.map((option) => ({ ...option })),
  }
}

export function logicExpressionField(placeholder = "{{ status }}"): NodeField {
  return {
    key: "expression",
    label: "Expression",
    placeholder,
    help: "Value used to match against cases.",
  }
}

export function logicCasesField(): NodeField {
  return {
    key: "cases",
    label: "Cases",
    placeholder: '{\n  "open": "open",\n  "closed": "closed"\n}',
    control: "code",
    language: "json",
    help: "Case map as a JSON object. Keys are case labels.",
  }
}

export function logicDurationField(placeholder = "5"): NodeField {
  return {
    key: "duration",
    label: "Duration",
    placeholder,
    help: "How long to wait before continuing. Leave empty and set Until for a timestamp.",
  }
}

export function logicUnitField(placeholder = "minutes"): NodeField {
  return {
    key: "unit",
    label: "Unit",
    placeholder,
    control: "select",
    options: DELAY_UNITS.map((option) => ({ ...option })),
  }
}

export function logicUntilField(placeholder = "2026-09-08T09:00"): NodeField {
  return {
    key: "until",
    label: "Until",
    placeholder,
    help: "Wait until this time instead of Duration.",
  }
}
