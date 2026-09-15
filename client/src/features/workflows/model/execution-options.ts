import type { NodeField, ExecutionOptionId } from "./types"

function optionFields(): Record<ExecutionOptionId, NodeField> {
  return {
    onlyRunIf: {
      key: "onlyRunIf",
      label: "Only run if",
      placeholder: "",
      control: "conditions",
      section: "execution",
      mode: "expression",
      help: "Skip this step unless the condition matches.",
    },
    retry: {
      key: "retry",
      label: "Retry on failure",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
    },
    attempts: {
      key: "attempts",
      label: "Attempts",
      placeholder: "3",
      control: "number",
      section: "execution",
      valueType: "integer",
      defaultValue: "3",
      showWhen: { key: "retry", equals: "true" },
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }, { kind: "max", value: 20 }],
    },
    retryDelay: {
      key: "retryDelay",
      label: "Retry delay (ms)",
      placeholder: "1000",
      control: "number",
      section: "execution",
      showWhen: { key: "retry", equals: "true" },
      validation: [{ kind: "integer" }, { kind: "min", value: 0 }],
    },
    backoff: {
      key: "backoff",
      label: "Backoff",
      placeholder: "fixed",
      control: "select",
      section: "execution",
      mode: "fixed",
      showWhen: { key: "retry", equals: "true" },
      options: [
        { value: "fixed", label: "Fixed" },
        { value: "exponential", label: "Exponential" },
      ],
    },
    timeout: {
      key: "timeoutMs",
      label: "Step timeout (ms)",
      placeholder: "30000",
      control: "number",
      section: "execution",
      validation: [{ kind: "integer" }, { kind: "min", value: 0 }],
    },
    continueOnFail: {
      key: "continueOnFail",
      label: "Continue on failure",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
    },
    alwaysOutputData: {
      key: "alwaysOutputData",
      label: "Always output data",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
    },
    errorOutput: {
      key: "errorOutput",
      label: "Error output",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
      help: "Add an Error port when this step fails.",
    },
    itemMode: {
      key: "itemMode",
      label: "Run",
      placeholder: "once",
      control: "select",
      section: "execution",
      mode: "fixed",
      options: [
        { value: "once", label: "Once for all items" },
        { value: "each", label: "Once per item" },
      ],
    },
    rawResponse: {
      key: "rawResponse",
      label: "Raw response",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
    },
    pagination: {
      key: "pagination",
      label: "Pagination",
      placeholder: "none",
      control: "select",
      section: "execution",
      mode: "fixed",
      options: [
        { value: "none", label: "None" },
        { value: "offset", label: "Offset" },
        { value: "cursor", label: "Cursor" },
      ],
    },
    returnAll: {
      key: "returnAll",
      label: "Return all",
      placeholder: "false",
      control: "boolean",
      section: "execution",
      mode: "fixed",
      showWhen: { key: "pagination", notEquals: "none" },
    },
    maxItems: {
      key: "maxItems",
      label: "Max items",
      placeholder: "100",
      control: "number",
      section: "execution",
      showWhen: { key: "pagination", notEquals: "none" },
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }],
    },
  }
}

export function executionOptionFields(
  ids: readonly ExecutionOptionId[] | undefined
): NodeField[] {
  if (!ids?.length) {
    return []
  }
  const catalog = optionFields()
  return ids.map((id) => catalog[id])
}
