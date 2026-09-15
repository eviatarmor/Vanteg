import type { NodeField } from "./types"

export function codeLanguageField(placeholder = "javascript"): NodeField {
  return {
    key: "language",
    label: "Language",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
    ],
  }
}

export function codeSnippetField(placeholder = "return items"): NodeField {
  return {
    key: "code",
    label: "Code",
    placeholder,
    control: "code",
    language: "javascript",
    section: "parameters",
    help: "Snippet that runs for each item. Return the data to pass downstream.",
  }
}

export function setMappingField(placeholder = "name = first + last"): NodeField {
  return {
    key: "mapping",
    label: "Mapping",
    placeholder,
    control: "mapping",
    section: "parameters",
    mode: "either",
    help: "Add, replace, rename, remove, pick, or omit fields. Dot-paths are supported.",
  }
}

export function transformExpressionField(
  placeholder = "{{ json.body }}"
): NodeField {
  return {
    key: "expression",
    label: "Expression",
    placeholder,
    control: "mapping",
    section: "parameters",
    mode: "either",
    help: "Map, pick, or reshape values from the current item.",
  }
}

export function mergeModeField(placeholder = "append"): NodeField {
  return {
    key: "mode",
    label: "Mode",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: [
      { value: "append", label: "Append" },
      { value: "position", label: "Position" },
      { value: "matching", label: "Matching field" },
      { value: "cartesian", label: "Cartesian" },
      { value: "chooseBranch", label: "Choose branch" },
      { value: "waitForBoth", label: "Wait for both" },
    ],
    help: "How incoming branches are combined before continuing.",
  }
}

export function loopItemsField(placeholder = "$.rows"): NodeField {
  return {
    key: "items",
    label: "Items",
    placeholder,
    control: "expression",
    section: "parameters",
    mode: "expression",
    required: true,
    help: "Expression or path that resolves to the list to iterate over.",
  }
}

export function loopConcurrencyField(placeholder = "1"): NodeField {
  return {
    key: "concurrency",
    label: "Concurrency",
    placeholder,
    control: "number",
    section: "options",
    validation: [{ kind: "integer" }, { kind: "min", value: 1 }],
    help: "Optional max parallel iterations. Leave blank to run one at a time.",
  }
}
