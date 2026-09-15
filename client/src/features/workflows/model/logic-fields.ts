import type { NodeField } from "./types"

export function logicConditionField(placeholder: string): NodeField {
  return {
    key: "conditions",
    label: "Conditions",
    placeholder,
    control: "conditions",
    section: "parameters",
    mode: "expression",
    help: "Rules evaluated against the current item. Unary operators hide Value 2.",
  }
}

export function logicOperatorField(placeholder = "eq"): NodeField {
  return {
    key: "operator",
    label: "Operator",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: [
      { value: "eq", label: "Equals" },
      { value: "neq", label: "Does not equal" },
      { value: "contains", label: "Contains" },
      { value: "gt", label: "Greater than" },
      { value: "lt", label: "Less than" },
      { value: "empty", label: "Is empty" },
      { value: "not_empty", label: "Is not empty" },
    ],
  }
}

export function logicExpressionField(placeholder = "{{ status }}"): NodeField {
  return {
    key: "expression",
    label: "Expression",
    placeholder,
    control: "expression",
    section: "parameters",
    mode: "expression",
    help: "Value used to match against cases.",
  }
}

export function logicCasesField(): NodeField {
  return {
    key: "routes",
    label: "Cases",
    placeholder: '[{"id":"a","name":"A","value":""},{"id":"b","name":"B","value":""}]',
    control: "routes",
    section: "parameters",
    validation: [{ kind: "uniqueRouteName" }],
    help: "Named cases with stable IDs. Renaming does not break edges.",
  }
}

export function logicDurationField(placeholder = "5"): NodeField {
  return {
    key: "duration",
    label: "Duration",
    placeholder,
    control: "number",
    section: "parameters",
    showWhen: { key: "delayMode", equals: "duration" },
    validation: [{ kind: "integer" }, { kind: "min", value: 0 }],
    help: "How long to wait before continuing.",
  }
}

export function logicUnitField(placeholder = "minutes"): NodeField {
  return {
    key: "unit",
    label: "Unit",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    showWhen: { key: "delayMode", equals: "duration" },
    options: [
      { value: "seconds", label: "Seconds" },
      { value: "minutes", label: "Minutes" },
      { value: "hours", label: "Hours" },
      { value: "days", label: "Days" },
      { value: "weeks", label: "Weeks" },
      { value: "months", label: "Months" },
    ],
  }
}

export function logicUntilField(placeholder = "2026-09-08T09:00"): NodeField {
  return {
    key: "until",
    label: "Until",
    placeholder,
    control: "datetime",
    section: "parameters",
    showWhen: { key: "delayMode", equals: "until" },
    help: "Wait until this time instead of Duration.",
  }
}

export function delayModeField(): NodeField {
  return {
    key: "delayMode",
    label: "Wait",
    placeholder: "duration",
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: [
      { value: "duration", label: "For a duration" },
      { value: "until", label: "Until a timestamp" },
      { value: "expression", label: "Until an expression" },
    ],
  }
}

export function delayExpressionField(): NodeField {
  return {
    key: "untilExpression",
    label: "Resume at",
    placeholder: "{{Webhook.body.resumeAt}}",
    control: "expression",
    section: "parameters",
    mode: "expression",
    showWhen: { key: "delayMode", equals: "expression" },
  }
}
