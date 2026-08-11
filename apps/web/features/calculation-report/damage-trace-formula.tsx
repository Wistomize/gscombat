import {
  ActionEffectSources,
  CritSourceBreakdown,
  ElementalMasterySourceBreakdown,
  FormulaEquation,
  FormulaValue,
  getAdditiveReactionLabel,
  getAmplifyingReactionLabel,
  getScalingStatLabel,
  getTransformativeReactionLabel,
  type AppliedActionEffect,
  type DamageTraceEntry,
  type DamageTraceStage,
  type ResolvedScenarioStats
} from "./trace-shared"
import { formatFormulaNumber, formatFormulaPercent } from "../../lib/formatting/numbers"
import { SpecialReactionTraceFormula } from "./special-reaction-trace"

export function TraceFormula({
  entry,
  effects,
  previousStage,
  showCritSources = false,
  showMasterySources = false,
  stats
}: {
  readonly entry: DamageTraceEntry
  readonly effects: readonly AppliedActionEffect[] | undefined
  readonly previousStage: DamageTraceStage
  readonly showCritSources?: boolean
  readonly showMasterySources?: boolean
  readonly stats: ResolvedScenarioStats | undefined
}) {
  const formula = entry.formula
  if (
    formula.kind === "special_reaction_base_damage" ||
    formula.kind === "special_reaction_coefficient" ||
    formula.kind === "special_reaction_base_damage_bonus" ||
    formula.kind === "special_reaction_damage_bonus" ||
    formula.kind === "special_reaction_flat_damage_addition" ||
    formula.kind === "special_reaction_ascension"
  ) {
    return <SpecialReactionTraceFormula after={entry.after} before={entry.before} effects={effects} formula={formula} previousStage={previousStage} showCritSources={showCritSources} showMasterySources={showMasterySources} stats={stats} />
  }
  if (formula.kind === "attack") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="总攻击力">
          <FormulaValue stage="attack">{formatFormulaNumber(formula.baseAttack)}</FormulaValue> × (1 +{" "}
          <FormulaValue stage="attack">{formatFormulaPercent(formula.attackPercent)}</FormulaValue>) +{" "}
          <FormulaValue stage="attack">{formatFormulaNumber(formula.flatAttack)}</FormulaValue> ={" "}
          <FormulaValue stage="attack">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "scaling") {
    const label = formula.stat === "hp" ? "总生命值" : formula.stat === "elementalMastery" ? "元素精通" : "总防御力"
    return (
      <div className="formulaLines">
        <FormulaEquation label={label}>
          <FormulaValue stage="scaling">{formatFormulaNumber(formula.value)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "scaling_terms") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="基础伤害">
          {formula.terms.map((term, index) => (
            <span key={`${term.stat}-${term.coefficient}-${term.label ?? ""}`}>
              {index > 0 ? " + " : ""}
              <FormulaValue stage="scaling">{formatFormulaNumber(term.value)}</FormulaValue> ×{" "}
              <FormulaValue stage="scaling">{formatFormulaPercent(term.coefficient)}</FormulaValue>（
              {getScalingStatLabel(term.stat)}{term.label ? `，${term.label}` : ""}）
            </span>
          ))}{" "}
          = <FormulaValue stage="scaling">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "talent") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="倍率后伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="talent">{formatFormulaPercent(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="talent">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "direct_flat_damage_addition") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="同段基础伤害加算">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> +{" "}
          <FormulaValue stage="flat_damage_addition">
            {formatFormulaNumber(formula.flatDamageAddition)}
          </FormulaValue>{" "}
          = <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "amplifying_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getAmplifyingReactionLabel(formula.reaction)}乘数`}>
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(formula.baseMultiplier)}</FormulaValue> × [1 + (2.78 ×{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue> + 1,400) +{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaPercent(formula.bonus)}</FormulaValue>] ={" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(formula.multiplier)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="amplifying_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
        {showMasterySources && stats ? <ElementalMasterySourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "additive_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getAdditiveReactionLabel(formula.reaction)}附加伤害`}>
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(formula.baseDamage)}</FormulaValue> ×{" "}
          <FormulaValue stage="additive_reaction">{formula.multiplier.toFixed(2)}</FormulaValue> × [1 + (5 ×{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue> + 1,200) +{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaPercent(formula.bonus)}</FormulaValue>] ={" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(formula.reactionDamage)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> +{" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(formula.reactionDamage)}</FormulaValue> ={" "}
          <FormulaValue stage="additive_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
        {showMasterySources && stats ? <ElementalMasterySourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "transformative_reaction") {
    return (
      <div className="formulaLines">
        <FormulaEquation label={`${getTransformativeReactionLabel(formula.reaction)}伤害`}>
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(formula.baseDamage)}</FormulaValue> ×{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(formula.multiplier)}</FormulaValue> × [1 + (16 ×{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue>) ÷ (
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(formula.elementalMastery)}</FormulaValue> + 2,000) +{" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaPercent(formula.bonus)}</FormulaValue>]
          {formula.flatDamageAddition === 0 ? null : <> + <FormulaValue stage="flat_damage_addition">{formatFormulaNumber(formula.flatDamageAddition)}</FormulaValue>（基础伤害增加）</>}
          {" "}= {" "}
          <FormulaValue stage="transformative_reaction">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <ActionEffectSources effects={effects} targets={["transformativeReactionFlatDamageAddition"]} />
        {showMasterySources && stats ? <ElementalMasterySourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "damage_bonus") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="增伤后伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> × (1 +{" "}
          <FormulaValue stage="damage_bonus">{formatFormulaPercent(formula.bonus)}</FormulaValue>) ={" "}
          <FormulaValue stage="damage_bonus">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
      </div>
    )
  }
  if (formula.kind === "expected_crit") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="暴击期望伤害">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> × [1 +{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(formula.critRate)}</FormulaValue> ×{" "}
          <FormulaValue stage="crit">{formatFormulaPercent(formula.critDamage)}</FormulaValue>] ={" "}
          <FormulaValue stage="crit">{formatFormulaNumber(entry.after)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          期望暴击乘数 = <FormulaValue stage="crit">{formatFormulaPercent(formula.multiplier)}</FormulaValue>
        </p>
        {showCritSources && stats ? <CritSourceBreakdown stats={stats} /> : null}
      </div>
    )
  }
  if (formula.kind === "defense") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="防御乘数">
          ({formula.attackerLevel} + 100) ÷ [({formula.attackerLevel} + 100) + ({formula.enemyLevel} + 100) ×
          (1 − <FormulaValue stage="defense">{formatFormulaPercent(formula.defenseReduction)}</FormulaValue>) × (1 −{" "}
          <FormulaValue stage="defense">{formatFormulaPercent(formula.defenseIgnore)}</FormulaValue>)] ={" "}
          <FormulaValue stage="defense">{formatFormulaPercent(formula.multiplier)}</FormulaValue>
        </FormulaEquation>
        <p className="formulaAuxiliary">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
          <FormulaValue stage="defense">{formatFormulaPercent(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="defense">{formatFormulaNumber(entry.after)}</FormulaValue>
        </p>
      </div>
    )
  }
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
        <FormulaValue stage={previousStage}>{formatFormulaNumber(entry.before)}</FormulaValue> ×{" "}
        <FormulaValue stage="resistance">{formatFormulaPercent(formula.multiplier)}</FormulaValue> ={" "}
        <FormulaValue stage="resistance">{formatFormulaNumber(entry.after)}</FormulaValue>
      </p>
    </div>
  )
}
