import type { NodeField } from "./types"

const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
] as const

const MERGE_MODES = [
  { value: "append", label: "Append" },
  { value: "combine", label: "Combine" },
  { value: "chooseBranch", label: "Choose branch" },
] as const

export function codeLanguageField(placeholder = "javascript"): NodeField {
  return {
    key: "language",
    label: "Language",
    placeholder,
    control: "select",
    options: CODE_LANGUAGES.map((option) => ({ ...option })),
  }
}

export function codeSnippetField(placeholder = "return items"): NodeField {
  return {
    key: "code",
    label: "Code",
    placeholder,
    control: "code",
    language: "javascript",
    help: "Snippet that runs for each item. Return the data to pass downstream.",
  }
}

export function setMappingField(placeholder = "name = first + last"): NodeField {
  return {
    key: "mapping",
    label: "Mapping",
    placeholder,
    control: "textarea",
    help: "Assign or rename fields, one mapping per line.",
  }
}

export function transformExpressionField(
  placeholder = "{{ json.body }}"
): NodeField {
  return {
    key: "expression",
    label: "Expression",
    placeholder,
    control: "textarea",
    help: "Expression used to map or pick values from the current item.",
  }
}

export function mergeModeField(placeholder = "append"): NodeField {
  return {
    key: "mode",
    label: "Mode",
    placeholder,
    control: "select",
    options: MERGE_MODES.map((option) => ({ ...option })),
    help: "How incoming branches are combined before continuing.",
  }
}

export function loopItemsField(placeholder = "$.rows"): NodeField {
  return {
    key: "items",
    label: "Items",
    placeholder,
    control: "textarea",
    help: "Expression or path that resolves to the list to iterate over.",
  }
}

export function loopConcurrencyField(placeholder = "1"): NodeField {
  return {
    key: "concurrency",
    label: "Concurrency",
    placeholder,
    help: "Optional max parallel iterations. Leave blank to run one at a time.",
  }
}
