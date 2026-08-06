import type { CatalogResponse, SupportMetricEvaluationResponse } from "@gscombat/contracts"

import { getCharacterLabel } from "../../lib/formatting/builds"
import { formatNumber } from "../../lib/formatting/numbers"
import { FormulaEquation } from "./trace-shared"

type CatalogSupportMetric = CatalogResponse["characters"][number]["supportMetrics"][number]
type SupportMetricFormula = SupportMetricEvaluationResponse["metric"]["formula"]

const supportMetricKindLabels: Readonly<Record<CatalogSupportMetric["kind"], string>> = {
  healing: "治疗指标",
  scalar: "辅助指标",
  stat_buff: "属性增益"
}

const supportMetricUnitLabels: Readonly<Record<SupportMetricEvaluationResponse["metric"]["unit"], string>> = {
  attack: "攻击力",
  damage: "伤害",
  defense: "防御力",
  elemental_mastery: "元素精通",
  hp: "生命值",
  ratio: "%"
}

function formatSupportMetricValue(value: number, unit: SupportMetricEvaluationResponse["metric"]["unit"]): string {
  return unit === "ratio" ? `${(value * 100).toFixed(1)}%` : formatNumber(value)
}

function getSupportMetricTargetLabel(metric: SupportMetricEvaluationResponse["metric"], catalog: CatalogResponse): string {
  if (metric.kind === "healing" || metric.kind === "stat_buff") {
    return `受益角色：${getCharacterLabel(catalog, metric.recipient.characterId)}`
  }
  if (metric.target.kind === "friendly_recipient") {
    return `受益角色：${getCharacterLabel(catalog, metric.target.characterId)}`
  }
  if (metric.target.kind === "self") return `自身：${getCharacterLabel(catalog, metric.target.characterId)}`
  return "目标：敌人"
}

function getSupportMetricConditionLabel(
  condition: SupportMetricEvaluationResponse["metric"]["conditions"][number]
): string {
  if (condition.kind === "recipient_hp_fraction" && condition.waived) return `${condition.label}（已由命座解除）`
  return `${condition.label}（${condition.satisfied ? "已满足" : "未满足"}）`
}

function SupportFormulaValue({ children }: { readonly children: string }) {
  return <strong className="supportFormulaValue">{children}</strong>
}

function SupportMetricFormulaExpression({ formula }: { readonly formula: SupportMetricFormula }) {
  if (formula.kind === "term") {
    return <SupportFormulaValue>{formatNumber(formula.value)}</SupportFormulaValue>
  }
  if (formula.kind === "condition") {
    return <SupportMetricFormulaExpression formula={formula.operand} />
  }
  const operator = formula.kind === "add" ? " + " : formula.kind === "multiply" ? " × " : ", "
  const wrapper = formula.kind === "minimum" ? "min" : formula.kind === "maximum" ? "max" : undefined
  const expression = formula.operands.map((operand, index) => (
    <span key={`${formula.label}-${index}`}>
      {index > 0 ? operator : ""}
      <SupportMetricFormulaExpression formula={operand} />
    </span>
  ))
  return <>{wrapper ? `${wrapper}(` : "("}{expression}{wrapper ? ")" : ")"}</>
}

function SupportMetricFormulaTree({ formula }: { readonly formula: SupportMetricFormula }) {
  if (formula.kind === "term") {
    return (
      <li className="supportFormulaTerm">
        <span>{formula.label}</span>
        <SupportFormulaValue>{formatNumber(formula.value)}</SupportFormulaValue>
      </li>
    )
  }
  if (formula.kind === "condition") {
    return (
      <li className="supportFormulaCondition">
        <span>{getSupportMetricConditionLabel(formula.condition)}</span>
        <ol>
          <SupportMetricFormulaTree formula={formula.operand} />
        </ol>
      </li>
    )
  }
  return (
    <li className="supportFormulaBranch">
      <FormulaEquation label={formula.label}>
        <SupportMetricFormulaExpression formula={formula} /> = <SupportFormulaValue>{formatNumber(formula.value)}</SupportFormulaValue>
      </FormulaEquation>
      <ul>
        {formula.operands.map((operand, index) => (
          <SupportMetricFormulaTree formula={operand} key={`${formula.label}-${index}`} />
        ))}
      </ul>
    </li>
  )
}

export function SupportMetricReport({
  catalog,
  response
}: {
  readonly catalog: CatalogResponse
  readonly response: SupportMetricEvaluationResponse
}) {
  const metric = response.metric
  const actualRestoredValue = metric.kind === "healing" ? metric.actualRestoredValue : undefined

  return (
    <div className="reportGrid supportMetricReport">
      <article className="supportMetricHero">
        <div className="metricLabel">{supportMetricKindLabels[metric.kind]}</div>
        <strong>{formatSupportMetricValue(metric.value, metric.unit)}</strong>
        <span>{metric.label} · {getSupportMetricTargetLabel(metric, catalog)}</span>
        <div className="supportMetricMeta">
          <span>单位：{supportMetricUnitLabels[metric.unit]}</span>
          <span>未受条件限制：{formatSupportMetricValue(metric.potentialValue, metric.unit)}</span>
          {actualRestoredValue === undefined ? null : (
            <span>实际恢复：{formatSupportMetricValue(actualRestoredValue, metric.unit)}</span>
          )}
        </div>
      </article>

      <article className="supportConditionsReport">
        <div className="cardTitle">
          <span>CONDITIONS</span>
          <strong>指标条件</strong>
        </div>
        {metric.conditions.length === 0 ? (
          <p className="supportNotice">该指标没有额外状态条件。</p>
        ) : (
          <ul className="supportConditionList">
            {metric.conditions.map((condition, index) => (
              <li className={condition.satisfied ? "satisfied" : "unsatisfied"} key={`${condition.kind}-${index}`}>
                {getSupportMetricConditionLabel(condition)}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="wideReport supportFormulaReport">
        <div className="cardTitle">
          <span>METRIC FORMULA</span>
          <strong>计算公式</strong>
          <small>逐层展开来源属性、天赋倍率、装备修正与状态条件</small>
        </div>
        <ol className="supportFormulaTree">
          <SupportMetricFormulaTree formula={metric.formula} />
        </ol>
      </article>
    </div>
  )
}
