import type { AnalysisResponse } from "@gscombat/contracts"
import type { ReactNode } from "react"

import {
  formatFormulaNumber,
  formatFormulaPercent,
  formatNumber,
  formatPercent
} from "../../lib/formatting/numbers"

export type DamageTraceEntry = AnalysisResponse["evaluation"]["result"]["trace"][number]
export type DamageTraceStage = DamageTraceEntry["stage"]
export type RotationEvent = AnalysisResponse["evaluation"]["rotation"]["events"][number]
export type RotationTraceEntry = RotationEvent["trace"][number]
export type PipelineStage = DamageTraceStage | "hit_count" | "transformative_reaction"
export type AmplifyingReaction = Extract<RotationTraceEntry, { readonly kind: "amplifying_reaction" }>["reaction"]
export type AdditiveReaction = Extract<RotationTraceEntry, { readonly kind: "additive_reaction" }>["reaction"]
export type TransformativeReaction = Extract<RotationTraceEntry, { readonly kind: "transformative_reaction" }>["reaction"]
export type SpecialReactionRotationTraceEntry = Extract<RotationTraceEntry, { readonly kind: "special_reaction" }>
export type SpecialReactionFormula = SpecialReactionRotationTraceEntry["formula"]
export type SpecialReactionKind = Extract<
  SpecialReactionFormula,
  { readonly kind: "special_reaction_coefficient" }
>["reactionKind"]
export type CatalogPrimaryAction = import("@gscombat/contracts").CatalogResponse["characters"][number]["primaryActions"][number]
export type AppliedScenarioBuff = AnalysisResponse["evaluation"]["appliedBuffs"][number]
export type AppliedActionEffect = AnalysisResponse["evaluation"]["appliedEffects"][number]
export type ActiveResonanceId = AnalysisResponse["evaluation"]["teamState"]["activeResonanceIds"][number]
export type ResolvedScenarioStats = AnalysisResponse["evaluation"]["stats"]
export type ResolvedStatContribution = ResolvedScenarioStats["statContributions"][number]

export const traceStageMeta: Readonly<Record<PipelineStage, { readonly hint: string; readonly label: string }>> = {
  attack: { hint: "基础攻击、攻击力%与固定攻击", label: "攻击区" },
  scaling: { hint: "生命值、防御力或元素精通倍率的取值", label: "属性区" },
  talent: { hint: "技能倍率与愿力加成", label: "倍率区" },
  amplifying_reaction: { hint: "蒸发、融化与元素精通", label: "增幅反应区" },
  additive_reaction: { hint: "激化附加伤害与元素精通", label: "激化附加区" },
  damage_bonus: { hint: "元素、爆发与通用增伤", label: "增伤区" },
  base_damage: { hint: "特殊反应独立公式的基础伤害", label: "基础伤害" },
  reaction_coefficient: { hint: "月曜或星超导反应的固定系数", label: "反应系数" },
  base_damage_bonus: { hint: "特殊反应基础伤害的独立加成", label: "基础伤害加成" },
  reaction_damage_bonus: { hint: "元素精通与特殊反应伤害加成", label: "反应伤害加成" },
  flat_damage_addition: { hint: "反应乘区结算后的独立固定伤害增加", label: "固定伤害加成" },
  crit: { hint: "暴击率折算后的期望倍率", label: "暴击区" },
  defense: { hint: "等级、防御降低与无视防御", label: "防御区" },
  resistance: { hint: "敌人抗性与抗性降低", label: "抗性区" },
  hit_count: { hint: "同一事件的多段命中合计", label: "命中段数" },
  transformative_reaction: { hint: "剧变反应的等级、元素精通与反应加成", label: "剧变反应区" },
  ascension: { hint: "特殊反应抗性结算后的独立伤害擢升", label: "伤害擢升区" }
}

export const resonanceLabels: Readonly<Record<ActiveResonanceId, string>> = {
  "resonance.anemo": "迅捷之风",
  "resonance.cryo": "粉碎之冰",
  "resonance.dendro": "蔓生之草",
  "resonance.electro": "强能之雷",
  "resonance.geo": "坚定之岩",
  "resonance.hydro": "愈疗之水",
  "resonance.protective": "交织之护",
  "resonance.pyro": "热诚之火"
}

export const moonsignLabels = {
  ascendant_gleam: "月兆·满辉",
  nascent_gleam: "月兆·初辉",
  none: "无月兆"
} as const

export const actionEffectTargetLabels: Readonly<Record<AppliedActionEffect["target"], string>> = {
  additionalDamageEvent: "额外物理伤害事件",
  actionParameter: "动作状态参数",
  attackPercent: "攻击力",
  baseDamageFlat: "同段基础伤害增加值",
  flatAttack: "固定攻击力",
  critDamage: "暴击伤害",
  critRate: "暴击率",
  damageBonus: "伤害加成",
  amplifyingReactionBonus: "蒸发/融化反应加成",
  reactionDamageBonus: "普通反应伤害加成",
  transformativeReactionFlatDamageAddition: "剧变反应基础伤害增加值",
  specialReactionBaseDamageFlat: "月曜/星烁反应基础伤害增加值",
  specialReactionBaseDamageBonus: "月曜/星烁反应基础伤害加成",
  specialReactionDamageBonus: "月曜/星烁反应伤害加成",
  specialReactionElevation: "月曜/星烁反应伤害擢升",
  specialReactionFlatDamageAddition: "月曜/星烁反应固定伤害增加值",
  defenseFlat: "固定防御力",
  defensePercent: "防御力",
  enemyDefenseIgnore: "敌人防御无视",
  enemyDefenseReduction: "敌人防御降低",
  enemyResistanceReduction: "敌人抗性降低",
  energyRecharge: "元素充能效率",
  elementalMastery: "元素精通",
  finalHpToFlatAttack: "生命值转固定攻击力",
  finalHpToElementalMastery: "生命值转元素精通",
  finalElementalMasteryToFlatAttack: "元素精通转固定攻击力",
  finalHpToDamageBonus: "生命值转伤害加成",
  finalHpToOwnElementDamageBonus: "生命值转自身元素伤害",
  sourceFinalHpToElementalMastery: "来源生命值转元素精通",
  sourceFinalElementalMasteryToFlatAttack: "来源元素精通转固定攻击力",
  sourceFinalElementalMasteryToEnergyRecharge: "来源元素精通转元素充能效率",
  sourceFinalDefenseToDamageBonus: "来源防御力转元素伤害",
  sourceFinalAttackToDamageBonus: "来源攻击力转伤害",
  hpFlat: "固定生命值",
  hpPercent: "生命值",
  matchedActionAdditiveDamageTerm: "同一命中伤害加算",
  talentLevel: "天赋等级"
}


export function formatAppliedScenarioBuff(buff: AppliedScenarioBuff): string {
  if (["attack_flat", "defense_flat", "hp_flat", "elemental_mastery"].includes(buff.stat)) {
    return `+${formatNumber(buff.value)}`
  }
  return formatPercent(buff.value)
}

export function formatAppliedActionEffect(effect: AppliedActionEffect): string {
  if (effect.target === "talentLevel") return `+${formatNumber(effect.value)}`
  if (effect.target === "actionParameter") return `+${formatNumber(effect.value)}`
  if (effect.target === "additionalDamageEvent") return `${formatPercent(effect.value)}攻击力期望倍率`
  if (
    effect.target === "baseDamageFlat" ||
    effect.target === "specialReactionBaseDamageFlat" ||
    effect.target === "specialReactionFlatDamageAddition" ||
    effect.target === "transformativeReactionFlatDamageAddition"
  ) {
    return `+${formatFormulaNumber(effect.value)}`
  }
  if (effect.target === "matchedActionAdditiveDamageTerm") {
    return `${formatPercent(effect.value)} × ${getScalingStatLabel(effect.scalingStat ?? "attack")}`
  }
  if (effect.target === "sourceFinalHpToElementalMastery") return `${formatPercent(effect.value)} × 来源最终生命值`
  if (effect.target === "sourceFinalElementalMasteryToFlatAttack") {
    return `${formatPercent(effect.value)} × 来源最终元素精通`
  }
  if (effect.target === "sourceFinalElementalMasteryToEnergyRecharge") {
    return `${formatPercent(effect.value)} × 来源最终元素精通`
  }
  if (effect.target === "sourceFinalDefenseToDamageBonus") return `${formatPercent(effect.value)} × 来源最终防御力`
  if (effect.target === "sourceFinalAttackToDamageBonus") return `${formatPercent(effect.value)} × 来源最终攻击力`
  if (
    effect.target === "finalHpToFlatAttack" ||
    effect.target === "finalHpToElementalMastery" ||
    effect.target === "finalHpToDamageBonus" ||
    effect.target === "finalHpToOwnElementDamageBonus"
  ) {
    return `${formatPercent(effect.value)} × 最终生命值`
  }
  if (effect.target === "finalElementalMasteryToFlatAttack") return `${formatPercent(effect.value)} × 最终元素精通`
  if (["defenseFlat", "elementalMastery", "flatAttack", "hpFlat"].includes(effect.target)) {
    return `+${formatNumber(effect.value)}`
  }
  return formatPercent(effect.value)
}


export function getScalingStatLabel(stat: "attack" | "defense" | "elementalMastery" | "hp"): string {
  if (stat === "attack") return "攻击力"
  if (stat === "defense") return "防御力"
  if (stat === "elementalMastery") return "元素精通"
  return "生命值"
}

export function formatScalingTerms(
  terms: readonly {
    readonly coefficient: number
    readonly label?: string
    readonly stat: "attack" | "defense" | "elementalMastery" | "hp"
  }[]
): string {
  return terms
    .map(
      (term) =>
        `${formatFormulaPercent(term.coefficient)}${getScalingStatLabel(term.stat)}${term.label ? `（${term.label}）` : ""}`
    )
    .join(" + ")
}

export function FormulaValue({ children, stage }: { readonly children: string; readonly stage: PipelineStage }) {
  return <strong className={`formulaValue formulaValue--${stage}`}>{children}</strong>
}

export function FormulaEquation({ children, label }: { readonly children: ReactNode; readonly label: string }) {
  return (
    <p className="formulaEquation">
      <span className="formulaEquationLabel">{label} = </span>
      {children}
    </p>
  )
}

function getScalingContributionStages(
  stat: "attack" | "defense" | "elementalMastery" | "hp"
): readonly ResolvedStatContribution["stage"][] {
  if (stat === "attack") return ["baseAttack", "attackPercent", "flatAttack"]
  if (stat === "defense") return ["baseDefense", "defensePercent", "flatDefense"]
  if (stat === "hp") return ["baseHp", "hpPercent", "flatHp"]
  return ["baseElementalMastery", "elementalMastery"]
}

function isPercentStatContribution(stage: ResolvedStatContribution["stage"]): boolean {
  return stage === "attackPercent" || stage === "defensePercent" || stage === "hpPercent"
}

export function ScalingStatBreakdown({
  stats,
  stat
}: {
  readonly stats: ResolvedScenarioStats
  readonly stat: "attack" | "defense" | "elementalMastery" | "hp"
}) {
  const contributionStages = getScalingContributionStages(stat)
  const contributions = stats.statContributions.filter((contribution) => contributionStages.includes(contribution.stage))
  const total =
    stat === "attack"
      ? {
          label: "最终攻击",
          value: `${formatFormulaNumber(stats.baseAttack)} × (1 + ${formatFormulaPercent(stats.attackPercent)}) + ${formatFormulaNumber(stats.flatAttack)} = ${formatFormulaNumber(stats.effectiveAttack)}`
        }
      : stat === "defense"
        ? {
            label: "最终防御",
            value: `${formatFormulaNumber(stats.baseDefense)} × (1 + ${formatFormulaPercent(stats.defensePercent)}) + ${formatFormulaNumber(stats.flatDefense)} = ${formatFormulaNumber(stats.effectiveDefense)}`
          }
        : stat === "hp"
          ? {
              label: "最终生命值",
              value: `${formatFormulaNumber(stats.baseHp)} × (1 + ${formatFormulaPercent(stats.hpPercent)}) + ${formatFormulaNumber(stats.flatHp)} = ${formatFormulaNumber(stats.effectiveHp)}`
            }
          : {
              label: "最终元素精通",
              value: `${formatFormulaNumber(stats.baseElementalMastery)} + ${formatFormulaNumber(stats.flatElementalMastery)} = ${formatFormulaNumber(stats.elementalMastery)}`
            }

  return (
    <>
      {contributions.map((contribution, index) => (
        <div key={`${contribution.stage}-${contribution.label}-${index}`}>
          <dt>{contribution.label}</dt>
          <dd>{isPercentStatContribution(contribution.stage) ? formatFormulaPercent(contribution.value) : formatFormulaNumber(contribution.value)}</dd>
        </div>
      ))}
      <div className="traceContributionTotal">
        <dt>{total.label}</dt>
        <dd>{total.value}</dd>
      </div>
    </>
  )
}

const amplifyingReactionLabels: Readonly<Record<AmplifyingReaction, string>> = {
  melt_forward: "正向融化",
  melt_reverse: "反向融化",
  vaporize_forward: "正向蒸发（水触发火）",
  vaporize_reverse: "水底蒸发（火触发水）"
}

const additiveReactionLabels: Readonly<Record<AdditiveReaction, string>> = {
  aggravate: "超激化",
  spread: "蔓激化"
}

const transformativeReactionLabels: Readonly<Record<TransformativeReaction, string>> = {
  bloom: "绽放",
  burning: "燃烧",
  burgeon: "烈绽放",
  electro_charged: "感电",
  hyperbloom: "超绽放",
  overload: "超载",
  shatter: "碎冰",
  superconduct: "超导",
  swirl: "扩散"
}

const specialReactionLabels: Readonly<Record<SpecialReactionKind, string>> = {
  lunar_bloom: "月绽放",
  lunar_charged: "月感电",
  lunar_crystallize: "月结晶",
  stellar_superconduct: "星超导"
}

export function getAmplifyingReactionLabel(reaction: AmplifyingReaction): string {
  return amplifyingReactionLabels[reaction]
}

export function getAdditiveReactionLabel(reaction: AdditiveReaction): string {
  return additiveReactionLabels[reaction]
}

export function getTransformativeReactionLabel(reaction: TransformativeReaction): string {
  return transformativeReactionLabels[reaction]
}

export function getSpecialReactionLabel(reaction: SpecialReactionKind): string {
  return specialReactionLabels[reaction]
}

export function getElementLabel(element: string): string {
  const labels: Readonly<Record<string, string>> = {
    anemo: "风元素",
    cryo: "冰元素",
    dendro: "草元素",
    electro: "雷元素",
    geo: "岩元素",
    hydro: "水元素",
    physical: "物理",
    pyro: "火元素"
  }
  return labels[element] ?? element
}

export function ActionEffectSources({
  effects,
  targets
}: {
  readonly effects: readonly AppliedActionEffect[] | undefined
  readonly targets: readonly AppliedActionEffect["target"][]
}) {
  const matchingEffects = effects?.filter((effect) => targets.includes(effect.target)) ?? []
  if (matchingEffects.length === 0) return null
  return (
    <details className="traceContributionDetails">
      <summary>展开当前阶段来源</summary>
      <dl>
        {matchingEffects.map((effect) => (
          <div key={effect.id}><dt>{effect.label}</dt><dd>{formatAppliedActionEffect(effect)}</dd></div>
        ))}
      </dl>
    </details>
  )
}
