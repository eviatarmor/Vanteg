import type { NodeField } from "./types"

const AI_MODELS = [
  "grok-4.6",
  "grok-4.5",
  "gpt-5.5",
  "claude-sonnet-5",
  "gemini-3.8-flash",
] as const

const DATABASE_OPERATIONS = ["insert", "update", "select", "delete"] as const

function aiPromptField(placeholder: string): NodeField {
  return {
    key: "prompt",
    label: "Prompt",
    placeholder,
    control: "textarea",
  }
}

function aiModelField(placeholder = "grok-4.6"): NodeField {
  return {
    key: "model",
    label: "Model",
    placeholder,
    control: "select",
    options: AI_MODELS.map((value) => ({ value, label: value })),
  }
}

function aiTemperatureField(): NodeField {
  return {
    key: "temperature",
    label: "Temperature",
    placeholder: "0.7",
    control: "number",
    help: "Sampling temperature from 0 (deterministic) to 2 (more random).",
  }
}

function databaseOperationField(placeholder = "select"): NodeField {
  return {
    key: "operation",
    label: "Operation",
    placeholder,
    control: "select",
    options: DATABASE_OPERATIONS.map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    })),
  }
}

function databaseQueryField(): NodeField {
  return {
    key: "query",
    label: "Query",
    placeholder: "SELECT * FROM jobs WHERE status = 'open'",
    control: "textarea",
    help: "SQL or filter expression for the selected operation.",
  }
}

function databaseTableField(placeholder = "jobs"): NodeField {
  return { key: "table", label: "Table", placeholder }
}


export {
  aiPromptField,
  aiModelField,
  aiTemperatureField,
  databaseOperationField,
  databaseQueryField,
  databaseTableField,
}
