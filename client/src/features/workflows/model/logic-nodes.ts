import type { WorkflowNodeType } from "./types"
import {
  logicCasesField,
  logicConditionField,
  logicDurationField,
  logicExpressionField,
  logicOperatorField,
  logicUnitField,
} from "./logic-fields"

/** Platform logic gate nodes with polished Setup field controls. */
export const logicGateNodes: WorkflowNodeType[] = [
  {
    id: "if",
    label: "If",
    description: "Branch true or false.",
    kind: "logic",
    category: "Logic",
    fields: [logicConditionField("status = open"), logicOperatorField("eq")],
  },
  {
    id: "switch",
    label: "Switch",
    description: "Route by multiple cases.",
    kind: "logic",
    category: "Logic",
    fields: [logicExpressionField("{{ status }}"), logicCasesField()],
  },
  {
    id: "filter",
    label: "Filter",
    description: "Keep only items that match a rule.",
    kind: "logic",
    category: "Logic",
    fields: [logicConditionField("amount > 0"), logicOperatorField("gt")],
  },
  {
    id: "delay",
    label: "Delay",
    description: "Wait before continuing.",
    kind: "logic",
    category: "Logic",
    fields: [logicDurationField("5"), logicUnitField("minutes")],
  },
]
