import type { AnalysisResponse } from "@gscombat/contracts"

import { formatFormulaNumber, formatFormulaPercent } from "../../lib/formatting/numbers"
import { SpecialReactionTraceFormula } from "./special-reaction-trace"
import {
  ActionEffectSources,
  FormulaEquation,
  FormulaValue,
  ScalingStatBreakdown,
  getAdditiveReactionLabel,
  getAmplifyingReactionLabel,
  getElementLabel,
  getScalingStatLabel,
  getTransformativeReactionLabel,
  type CatalogPrimaryAction,
  type PipelineStage,
  type RotationEvent,
  type RotationTraceEntry
} from "./trace-shared"

export function getRotationTraceStage(entry: RotationTraceEntry): PipelineStage {
  if (entry.kind === "special_reaction") return entry.stage
  if (entry.kind === "scaling" || entry.kind === "scaling_terms") return "scaling"
  if (entry.kind === "expected_crit") return "crit"
  return entry.kind
}

function getRotationEventDamageElement(event: RotationEvent): string {
  for (let index = event.trace.length - 1; index >= 0; index -= 1) {
    const entry = event.trace[index]
    if (entry?.kind === "resistance") return entry.element
  }
  return event.element
}

export function getRotationEventElementSummary(event: RotationEvent): string {
  const damageElement = getRotationEventDamageElement(event)
  if (damageElement === event.element) return `伤害元素：${getElementLabel(damageElement)}`
  return `触发元素：${getElementLabel(event.element)} · 伤害元素：${getElementLabel(damageElement)}`
}

export function RotationTraceFormula({
  analysis,
  entry,
  previousStage,
  targetAction
}: {
  readonly analysis: AnalysisResponse
  readonly entry: RotationTraceEntry
  readonly previousStage: PipelineStage
  readonly targetAction: CatalogPrimaryAction | undefined
}) {
  if (entry.kind === "special_reaction") {
    return <SpecialReactionTraceFormula after={entry.after} before={entry.before} effects={analysis.evaluation.appliedEffects} formula={entry.formula} previousStage={previousStage} stats={analysis.evaluation.stats} />
  }
  if (entry.kind === "scaling") {
    const baseMultiplier = analysis.evaluation.stats.talentMultiplier
    const actionMultiplier = baseMultiplier && baseMultiplier !== 0 ? entry.coefficient / baseMultiplier : 1
    const flatDamageEffects = analysis.evaluation.appliedEffects.filter((effect) => effect.target === "baseDamageFlat")
    return (
      <div className="formulaLines">
        <FormulaEquation label="基础伤害">
          <FormulaValue stage="scaling">{formatFormulaNumber(entry.value)}</FormulaValue> ×{" "}
          <FormulaValue stage="scaling">{formatFormulaPercent(entry.coefficient)}</FormulaValue>（
          {getScalingStatLabel(entry.stat)}）
          {entry.flatDamage === undefined ? null : <> + <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(entry.flatDamage)}</FormulaValue>（同段基础伤害增加）</>}
          {" "}= {" "}
          <FormulaValue stage="scaling">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <details className="traceContributionDetails">
          <summary>展开属性倍率</summary>
          <dl>
            <ScalingStatBreakdown stat={entry.stat} stats={analysis.evaluation.stats} />
            {entry.flatDamage === undefined ? null : flatDamageEffects.map((effect) => (
              <div key={effect.id}><dt>{effect.label}</dt><dd>+{formatFormulaNumber(effect.value)}</dd></div>
            ))}
            {baseMultiplier === null ? null : <div><dt>天赋基础倍率</dt><dd>{formatFormulaPercent(baseMultiplier)}</dd></div>}
            {targetAction?.scenarioParameters?.map((parameter) => {
              const value = analysis.evaluation.stats.actionParameters?.[parameter.id]
              return value === undefined ? null : <div key={parameter.id}><dt>{parameter.label}</dt><dd>{value}</dd></div>
            })}
            {Math.abs(actionMultiplier - 1) < 0.000001 ? null : <div><dt>动作状态倍率修正</dt><dd>× {formatFormulaPercent(actionMultiplier)}</dd></div>}
            <div><dt>结算属性倍率</dt><dd>{formatFormulaPercent(entry.coefficient)}</dd></div>
          </dl>
        </details>
      </div>
    )
  }
  if (entry.kind === "scaling_terms") {
    const scalingStats = [...new Set(entry.terms.map((term) => term.stat))]
    const flatDamageEffects = analysis.evaluation.appliedEffects.filter((effect) => effect.target === "baseDamageFlat")
    return (
      <div className="formulaLines">
        <FormulaEquation label="基础伤害">
          {entry.terms.map((term, index) => (
            <span key={`${term.stat}-${term.coefficient}-${term.label ?? ""}`}>
              {index > 0 ? " + " : ""}
              <FormulaValue stage="scaling">{formatFormulaNumber(term.value)}</FormulaValue> ×{" "}
              <FormulaValue stage="scaling">{formatFormulaPercent(term.coefficient)}</FormulaValue>（
              {getScalingStatLabel(term.stat)}{term.label ? `，${term.label}` : ""}）
            </span>
          ))}{" "}
          {entry.flatDamage === undefined ? null : <> + <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(entry.flatDamage)}</FormulaValue>（同段基础伤害增加）</>}
          {" "}
          = <FormulaValue stage="scaling">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <details className="traceContributionDetails">
          <summary>展开属性倍率</summary>
          <dl>
            {scalingStats.map((stat) => <ScalingStatBreakdown key={stat} stat={stat} stats={analysis.evaluation.stats} />)}
            {entry.flatDamage === undefined ? null : flatDamageEffects.map((effect) => (
              <div key={effect.id}><dt>{effect.label}</dt><dd>+{formatFormulaNumber(effect.value)}</dd></div>
            ))}
            {targetAction?.scenarioParameters?.map((parameter) => {
              const value = analysis.evaluation.stats.actionParameters?.[parameter.id]
              return value === undefined ? null : <div key={parameter.id}><dt>{parameter.label}</dt><dd>{value}</dd></div>
            })}
            {entry.terms.map((term, index) => <div key={`${term.stat}-${term.coefficient}-${index}`}><dt>{term.label ?? `${getScalingStatLabel(term.stat)}倍率`}</dt><dd>{formatFormulaPercent(term.coefficient)}</dd></div>)}
          </dl>
        </details>
      </div>
    )
  }
  if (entry.kind === "amplifying_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getAmplifyingReactionLabel(entry.reaction)}乘数`}>
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.baseMultiplier)}</FormulaValue> × [1 + (2.78 ×{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue> + 1,400) +{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaPercent(entry.bonus)}</FormulaValue>] ={" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.multiplier)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
      </div>
    )
  }
  if (entry.kind === "additive_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getAdditiveReactionLabel(entry.reaction)}附加伤害`}>
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.baseDamage)}</FormulaValue> ×{" "}
          <FormulaValue stage="additive_reaction">{entry.multiplier.toFixed(2)}</FormulaValue> × [1 + (5 ×{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue> + 1,200) +{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaPercent(entry.bonus)}</FormulaValue>] ={" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.reactionDamage)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> +{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.reactionDamage)}</FormulaValue> ={" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
      </div>
    )
  }
  if (entry.kind === "damage_bonus") {
    const namedContributions = analysis.evaluation.stats.statContributions.filter(
      (contribution) => contribution.stage === "damageBonus"
    )
    return (
      <div className="formulaLines">
        <FormulaEquation label="增伤后伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> × (1 +{" "}
          <FormulaValue stage="damage_bonus">{formatFormulaPercent(entry.bonus)}</FormulaValue>) ={" "}
          <FormulaValue stage="damage_bonus">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <details className="traceContributionDetails">
          <summary>展开增伤来源</summary>
          <dl>
            {namedContributions.map((contribution, index) => <div key={`${contribution.label}-${index}`}><dt>{contribution.label}</dt><dd>{formatFormulaPercent(contribution.value)}</dd></div>)}
            <div className="traceContributionTotal"><dt>增伤区合计</dt><dd>{formatFormulaPercent(entry.bonus)}</dd></div>
          </dl>
        </details>
      </div>
    )
  }
  if (entry.kind === "expected_crit") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="暴击期望伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> × [1 +{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(entry.critRate)}</FormulaValue> ×{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(entry.critDamage)}</FormulaValue>] ={" "}
          <FormulaValue stage="crit">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (entry.kind === "defense") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="防御乘数">
          ({entry.attackerLevel} + 100) ÷ [({entry.attackerLevel} + 100) + ({entry.enemyLevel} + 100) × (1 −{" "}
          <FormulaValue stage="defense">{formatFormulaPercent(entry.defenseReduction)}</FormulaValue>) × (1 −{" "}
          <FormulaValue stage="defense">{formatFormulaPercent(entry.defenseIgnore)}</FormulaValue>)] ={" "}
          <FormulaValue stage="defense">{formatFormulaPercent(entry.multiplier)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="defense">{formatFormulaPercent(entry.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="defense">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
      </div>
    )
  }
  if (entry.kind === "hit_count") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="多段命中合计">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="hit_count">{entry.hitCount.toString()}</FormulaValue> 段 ={" "}
          <FormulaValue stage="hit_count">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (entry.kind === "transformative_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getTransformativeReactionLabel(entry.reaction)}伤害`}>
          （<FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.baseDamage)}</FormulaValue> ×{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.multiplier)}</FormulaValue> × [1 + (16 ×{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.elementalMastery)}</FormulaValue> + 2,000) +{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaPercent(entry.bonus)}</FormulaValue>]
          {entry.flatDamageAddition === 0 ? null : <> + <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(entry.flatDamageAddition)}</FormulaValue>（基础伤害增加）</>}） ×{" "}
          <FormulaValue stage="transformative_reaction">{entry.hitCount.toString()}</FormulaValue> ={" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <ActionEffectSources effects={analysis.evaluation.appliedEffects} targets={["transformativeReactionFlatDamageAddition"]} />
      </div>
    )
  }
  return (
    <div className="formulaLines">
      <FormulaEquation label={`${getElementLabel(entry.element)}有效抗性`}>
        <FormulaValue stage="resistance">{formatFormulaPercent(entry.baseResistance)}</FormulaValue> −{" "}
        <FormulaValue stage="resistance">{formatFormulaPercent(entry.resistanceReduction)}</FormulaValue> ={" "}
        <FormulaValue stage="resistance">{formatFormulaPercent(entry.effectiveResistance)}</FormulaValue>
      </FormulaEquation>
      <p className="formulaAuxiliary">
        抗性乘数 ={" "}
        {entry.effectiveResistance < 0 ? (
          <>
            1 − (<FormulaValue stage="resistance">{formatFormulaPercent(entry.effectiveResistance)}</FormulaValue> ÷ 2)
          </>
        ) : entry.effectiveResistance < 0.75 ? (
          <>
            1 − <FormulaValue stage="resistance">{formatFormulaPercent(entry.effectiveResistance)}</FormulaValue>
          </>
        ) : (
          <>
            1 ÷ (4 × <FormulaValue stage="resistance">{formatFormulaPercent(entry.effectiveResistance)}</FormulaValue> + 1)
          </>
        )} = <FormulaValue stage="resistance">{formatFormulaPercent(entry.multiplier)}</FormulaValue>
      </p>
      <p className="formulaAuxiliary">
        <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
        <FormulaValue stage="resistance">{formatFormulaPercent(entry.multiplier)}</FormulaValue> ={" "}
        <FormulaValue stage="resistance">{formatFormulaNumber(entry.after)}</FormulaValue>
      </p>
    </div>
  )
}
