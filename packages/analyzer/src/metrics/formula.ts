import type { CombatMetricScalingStat } from "@gscombat/content"

import type {
  CombatMetricConditionEvaluation,
  CombatMetricFormulaAdd,
  CombatMetricFormulaMaximum,
  CombatMetricFormulaMinimum,
  CombatMetricFormulaMultiply,
  CombatMetricFormulaNode,
  CombatMetricFormulaTerm
} from "./types.js"

export function applyConditions(
  formula: CombatMetricFormulaNode,
  conditions: readonly CombatMetricConditionEvaluation[]
): CombatMetricFormulaNode {
  return conditions.reduce<CombatMetricFormulaNode>(
    (currentFormula, condition) => ({
      condition,
      kind: "condition",
      operand: currentFormula,
      satisfied: condition.satisfied,
      value: condition.satisfied ? currentFormula.value : 0
    }),
    formula
  )
}

export function addFormula(label: string, operands: readonly CombatMetricFormulaNode[]): CombatMetricFormulaAdd {
  return { kind: "add", label, operands, value: operands.reduce((total, operand) => total + operand.value, 0) }
}

export function multiplyFormula(label: string, operands: readonly CombatMetricFormulaNode[]): CombatMetricFormulaMultiply {
  return { kind: "multiply", label, operands, value: operands.reduce((total, operand) => total * operand.value, 1) }
}

export function minimumFormula(
  label: string,
  operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
): CombatMetricFormulaMinimum {
  return { kind: "minimum", label, operands, value: Math.min(operands[0].value, operands[1].value) }
}

export function maximumFormula(
  label: string,
  operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
): CombatMetricFormulaMaximum {
  return { kind: "maximum", label, operands, value: Math.max(operands[0].value, operands[1].value) }
}

export function constantTerm(label: string, value: number): CombatMetricFormulaTerm {
  return { kind: "term", label, role: "constant", value }
}

export function sourceStatTerm(stat: CombatMetricScalingStat, value: number): CombatMetricFormulaTerm {
  const labels: Readonly<Record<CombatMetricScalingStat, string>> = {
    attack: "攻击力",
    base_attack: "基础攻击力",
    defense: "防御力",
    elementalMastery: "元素精通",
    hp: "生命值"
  }
  const label = `来源${labels[stat]}`
  return { kind: "term", label, role: "source_stat", stat, value }
}

export function modifierTerm(
  role: Extract<CombatMetricFormulaTerm["role"], "recipient_modifier" | "source_modifier">,
  label: string,
  value: number
): CombatMetricFormulaTerm {
  return { kind: "term", label, role, value }
}

export function recipientStateTerm(label: string, value: number): CombatMetricFormulaTerm {
  return { kind: "term", label, role: "recipient_state", value }
}
