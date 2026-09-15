import type { WorkflowNodeType } from "./types"
import {
  delayExpressionField,
  delayModeField,
  logicCasesField,
  logicConditionField,
  logicDurationField,
  logicExpressionField,
  logicUnitField,
  logicUntilField,
} from "./logic-fields"
import {
  filterOutputs,
  ifOutputs,
  delayOutputs,
  switchOutputs,
  LOGIC_EXECUTION,
} from "./io-contracts"

const IN_TRUE_FALSE = [
  { id: "in", type: "target" as const, label: "In", color: "slate" as const },
  { id: "true", type: "source" as const, label: "True", color: "emerald" as const },
  { id: "false", type: "source" as const, label: "False", color: "rose" as const },
]

const IN_PASS_DROP = [
  { id: "in", type: "target" as const, label: "In", color: "slate" as const },
  { id: "pass", type: "source" as const, label: "Pass", color: "emerald" as const },
  { id: "drop", type: "source" as const, label: "Drop", color: "rose" as const },
]

const SWITCH_FALLBACK = [
  { id: "a", type: "source" as const, label: "A", color: "violet" as const },
  { id: "b", type: "source" as const, label: "B", color: "sky" as const },
  { id: "default", type: "source" as const, label: "Default", color: "amber" as const },
]

/** Platform logic gate nodes with polished Setup field controls. */
export const logicGateNodes: WorkflowNodeType[] = [
  {
    id: "if",
    label: "If",
    description: "Branch true or false.",
    kind: "logic",
    category: "Logic",
    fields: [logicConditionField("status = open")],
    inputs: [{ key: "item", label: "Item", type: "object" }],
    outputs: ifOutputs,
    ports: IN_TRUE_FALSE,
    outputByPort: {
      true: ifOutputs,
      false: ifOutputs,
    },
    executionOptions: [...LOGIC_EXECUTION],
  },
  {
    id: "switch",
    label: "Switch",
    description: "Route by multiple cases.",
    kind: "logic",
    category: "Logic",
    fields: [logicExpressionField("{{ status }}"), logicCasesField()],
    inputs: [{ key: "item", label: "Item", type: "object" }],
    outputs: switchOutputs,
    ports: [
      { id: "in", type: "target", label: "In", color: "slate" },
      { id: "default", type: "source", label: "Default", color: "amber" },
    ],
    dynamicPorts: {
      fieldKey: "routes",
      type: "source",
      fallbackPorts: SWITCH_FALLBACK,
    },
    executionOptions: [...LOGIC_EXECUTION],
  },
  {
    id: "filter",
    label: "Filter",
    description: "Keep only items that match a rule.",
    kind: "logic",
    category: "Logic",
    fields: [logicConditionField("amount > 0")],
    inputs: [{ key: "item", label: "Item", type: "object" }],
    outputs: filterOutputs,
    ports: IN_PASS_DROP,
    outputByPort: {
      pass: filterOutputs,
      drop: filterOutputs,
    },
    executionOptions: [...LOGIC_EXECUTION],
  },
  {
    id: "delay",
    label: "Delay",
    description: "Wait before continuing.",
    kind: "logic",
    category: "Logic",
    fields: [
      delayModeField(),
      logicDurationField("5"),
      logicUnitField("minutes"),
      logicUntilField(),
      delayExpressionField(),
    ],
    inputs: [{ key: "item", label: "Item", type: "object" }],
    outputs: delayOutputs,
    executionOptions: [...LOGIC_EXECUTION],
  },
]
