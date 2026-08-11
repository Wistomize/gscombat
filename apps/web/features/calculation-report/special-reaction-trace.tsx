import {
  ActionEffectSources,
  CritSourceBreakdown,
  ElementalMasterySourceBreakdown,
  FormulaEquation,
  FormulaValue,
  ScalingStatBreakdown,
  getScalingStatLabel,
  getSpecialReactionLabel,
  type AppliedActionEffect,
  type PipelineStage,
  type ResolvedScenarioStats,
  type SpecialReactionFormula
} from "./trace-shared"
import { formatFormulaNumber, formatFormulaPercent } from "../../lib/formatting/numbers"

export function SpecialReactionTraceFormula({
  after,
  before,
  effects,
  formula,
  previousStage,
  showCritSources = false,
  showMasterySources = false,
  stats
}: {
  readonly after: number
  readonly before: number
  readonly effects: readonly AppliedActionEffect[] | undefined
  readonly formula: SpecialReactionFormula
  readonly previousStage: PipelineStage
  readonly showCritSources?: boolean
  readonly showMasterySources?: boolean
  readonly stats: ResolvedScenarioStats | undefined
}) {
  if (formula.kind === "special_reaction_base_damage") {
    const fallbackTerms =
      stats === undefined
        ? []
        : (stats.scalingTerms ?? []).map((term) => {
            const value =
              term.stat === "attack"
                ? stats.effectiveAttack
                : term.stat === "defense"
                  ? stats.effectiveDefense
                  : term.stat === "hp"
                    ? stats.effectiveHp
                    : stats.elementalMastery
            return {
              coefficient: term.coefficient,
              contribution: term.coefficient * value,
              label: term.label,
              stat: term.stat,
              value
            }
          })
    const terms = formula.terms ?? fallbackTerms
    const scalingStats = [...new Set(terms.map((term) => term.stat))]
    const specialBaseDamageEffects = effects?.filter((effect) => effect.target === "specialReactionBaseDamageFlat") ?? []
    const hasBreakdown = terms.length > 0 || specialBaseDamageEffects.length > 0
    return (
      <div className="formulaLines">
        <FormulaEquation label="特殊反应基础伤害">
          {!hasBreakdown ? <FormulaValue stage="base_damage">{formatFormulaNumber(formula.value)}</FormulaValue> : terms.map((term, index) => (
            <span key={`${term.stat}-${term.coefficient}-${term.label ?? ""}-${index}`}>
              {index > 0 ? " + " : ""}
              <FormulaValue stage="base_damage">{formatFormulaNumber(term.value)}</FormulaValue> ×{" "}
              <FormulaValue stage="base_damage">{formatFormulaPercent(term.coefficient)}</FormulaValue>（
              {getScalingStatLabel(term.stat)}{term.label ? `，${term.label}` : ""}）
            </span>
          ))}
          {specialBaseDamageEffects.map((effect, index) => (
            <span key={effect.id}>
              {terms.length > 0 || index > 0 ? " + " : ""}
              <FormulaValue stage="base_damage">{formatFormulaNumber(effect.value)}</FormulaValue>（{effect.label}）
            </span>
          ))}
          {!hasBreakdown ? null : <> = <FormulaValue stage="base_damage">{formatFormulaNumber(formula.value)}</FormulaValue></>}
        </FormulaEquation>
        {stats === undefined || scalingStats.length === 0 ? null : (
          <details className="traceContributionDetails">
            <summary>展开属性倍率</summary>
            <dl>
              {scalingStats.map((stat) => <ScalingStatBreakdown key={stat} stat={stat} stats={stats} />)}
              {terms.map((term, index) => (
                <div key={`${term.stat}-${term.coefficient}-${index}`}>
                  <dt>{term.label ?? `${getScalingStatLabel(term.stat)}倍率`}</dt>
                  <dd>{formatFormulaNumber(term.value)} × {formatFormulaPercent(term.coefficient)} = {formatFormulaNumber(term.contribution)}</dd>
                </div>
              ))}
              {specialBaseDamageEffects.map((effect) => (
                <div key={effect.id}><dt>{effect.label}</dt><dd>+{formatFormulaNumber(effect.value)}</dd></div>
              ))}
            </dl>
          </details>
        )}
      </div>
    )
  }
  if (formula.kind === "special_reaction_coefficient") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getSpecialReactionLabel(formula.reactionKind)}反应系数`}>
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> ×{" "}
          <FormulaValue stage="reaction_coefficient">{formatFormulaNumber(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="reaction_coefficient">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        {formula.storedElementalApplications === undefined ? null : (
          <p className="formulaAuxiliary">
            已存储元素附着次数 ={" "}
            <FormulaValue stage="reaction_coefficient">{formula.storedElementalApplications.toString()}</FormulaValue>
          </p>
        )}
      </div>
    )
  }
  if (formula.kind === "special_reaction_base_damage_bonus") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="基础伤害加成">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> × (1 +{" "}
          <FormulaValue stage="base_damage_bonus">{formatFormulaPercent(formula.bonus)}</FormulaValue>) ={" "}
          <FormulaValue stage="base_damage_bonus">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          基础伤害乘数 = <FormulaValue stage="base_damage_bonus">{formatFormulaNumber(formula.multiplier)}</FormulaValue>
        </p>
        <ActionEffectSources effects={effects} targets={["specialReactionBaseDamageBonus"]} />
      </div>
    )
  }
  if (formula.kind === "special_reaction_damage_bonus") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="反应伤害加成">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> × [1 + (6 ×{" "}
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue> + 2,000) +{" "}
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaPercent(formula.bonus)}</FormulaValue>] ={" "}
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          元素精通加成 ={" "}
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaPercent(formula.masteryBonus)}</FormulaValue>
          ，反应伤害乘数 ={" "}
          <FormulaValue stage="reaction_damage_bonus">{formatFormulaNumber(formula.multiplier)}</FormulaValue>
        </p>
        <ActionEffectSources effects={effects} targets={["specialReactionDamageBonus"]} />
        {showMasterySources && stats ? <ElementalMasterySourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "special_reaction_flat_damage_addition") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="固定伤害加成">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> +{" "}
          <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(formula.flatDamageAddition)}</FormulaValue> ={" "}
          <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        <ActionEffectSources effects={effects} targets={["specialReactionFlatDamageAddition"]} />
      </div>
    )
  }
  if (formula.kind === "expected_crit") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="暴击期望伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> × [1 +{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(formula.critRate)}</FormulaValue> ×{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(formula.critDamage)}</FormulaValue>] ={" "}
          <FormulaValue stage="crit">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          期望暴击乘数 = <FormulaValue stage="crit">{formatFormulaPercent(formula.multiplier)}</FormulaValue>
        </p>
        {showCritSources && stats ? <CritSourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "resistance") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="有效抗性">
          <FormulaValue stage="resistance">{formatFormulaPercent(formula.resistance)}</FormulaValue> −{" "}
          <FormulaValue stage="resistance">{formatFormulaPercent(formula.resistanceReduction)}</FormulaValue> ={" "}
          <FormulaValue stage="resistance">{formatFormulaPercent(formula.effectiveResistance)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          抗性乘数 ={" "}
          {formula.effectiveResistance < 0 ? (
            <>
              1 − (<FormulaValue stage="resistance">{formatFormulaPercent(formula.effectiveResistance)}</FormulaValue> ÷ 2)
            </>
          ) : formula.effectiveResistance < 0.75 ? (
            <>
              1 − <FormulaValue stage="resistance">{formatFormulaPercent(formula.effectiveResistance)}</FormulaValue>
            </>
          ) : (
            <>
              1 ÷ (4 × <FormulaValue stage="resistance">{formatFormulaPercent(formula.effectiveResistance)}</FormulaValue> + 1)
            </>
          )} = <FormulaValue stage="resistance">{formatFormulaPercent(formula.multiplier)}</FormulaValue>
        </p>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> ×{" "}
          <FormulaValue stage="resistance">{formatFormulaPercent(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="resistance">{formatFormulaNumber(after)}</FormulaValue>
        </p>
      </div>
    )
  }
  return (
    <div className="formulaLines">
      <FormulaEquation label="伤害擢升">
        <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> × (1 +{" "}
        <FormulaValue stage="ascension">{formatFormulaPercent(formula.ascensionBonus)}</FormulaValue>) ={" "}
        <FormulaValue stage="ascension">{formatFormulaNumber(after)}</FormulaValue>
      </FormulaEquation>
      <p className="formulaAuxiliary">
        擢升乘数 = <FormulaValue stage="ascension">{formatFormulaNumber(formula.multiplier)}</FormulaValue>
      </p>
      <ActionEffectSources effects={effects} targets={["specialReactionElevation"]} />
    </div>
  )
}
