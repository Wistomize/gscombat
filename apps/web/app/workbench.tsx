"use client"

import {
  getWeaponComparisonRefinement,
  type AnalysisResponse,
  type ArtifactPiece,
  type ArtifactStat,
  type CatalogResponse,
  type CharacterBuild,
  type EvaluationScenario,
  type MetricEvaluationContext,
  type SupportMetricEvaluationResponse
} from "@gscombat/contracts"
import { type ReactNode, useEffect, useMemo, useState } from "react"

import { assembleEvaluationScenario } from "../lib/scenario-adapter"
import { fromDisplayStatValue, toDisplayStatValue } from "../lib/stats"
import { loadBuildLibrary, loadParty } from "../lib/workspace-config"
import { ArtifactIcon, CharacterAvatar, getCharacterElement, WeaponIcon } from "./visual-icons"

const slotLabels: Readonly<Record<ArtifactPiece["slot"], string>> = {
  circlet: "理之冠",
  flower: "生之花",
  goblet: "空之杯",
  plume: "死之羽",
  sands: "时之沙"
}

const statLabels: Readonly<Record<ArtifactStat, string>> = {
  anemo_damage_bonus: "风伤%",
  atk: "攻击力",
  atk_percent: "攻击力%",
  crit_damage: "暴击伤害",
  crit_rate: "暴击率",
  cryo_damage_bonus: "冰伤%",
  def: "防御力",
  def_percent: "防御力%",
  dendro_damage_bonus: "草伤%",
  electro_damage_bonus: "雷伤%",
  elemental_mastery: "元素精通",
  energy_recharge: "充能效率%",
  geo_damage_bonus: "岩伤%",
  healing_bonus: "治疗加成%",
  hp: "生命值",
  hp_percent: "生命值%",
  hydro_damage_bonus: "水伤%",
  physical_damage_bonus: "物伤%",
  pyro_damage_bonus: "火伤%"
}

const artifactStats = Object.keys(statLabels) as ArtifactStat[]
const substatOptions: ArtifactStat[] = [
  "hp",
  "hp_percent",
  "atk",
  "atk_percent",
  "def",
  "def_percent",
  "elemental_mastery",
  "energy_recharge",
  "crit_rate",
  "crit_damage"
]

interface TeamCalculationWorkspaceProps {
  readonly catalog: CatalogResponse
  readonly initialScenario: EvaluationScenario
}

interface BuildEditorProps {
  readonly build: CharacterBuild
  readonly catalog: CatalogResponse
  readonly onChange: (build: CharacterBuild) => void
}

type DamageTraceEntry = AnalysisResponse["evaluation"]["result"]["trace"][number]
type DamageTraceStage = DamageTraceEntry["stage"]
type RotationEvent = AnalysisResponse["evaluation"]["rotation"]["events"][number]
type RotationTraceEntry = AnalysisResponse["evaluation"]["rotation"]["events"][number]["trace"][number]
type PipelineStage = DamageTraceStage | "hit_count" | "transformative_reaction"
type AmplifyingReaction = Extract<RotationTraceEntry, { readonly kind: "amplifying_reaction" }>["reaction"]
type AdditiveReaction = Extract<RotationTraceEntry, { readonly kind: "additive_reaction" }>["reaction"]
type TransformativeReaction = Extract<RotationTraceEntry, { readonly kind: "transformative_reaction" }>["reaction"]
type SpecialReactionRotationTraceEntry = Extract<RotationTraceEntry, { readonly kind: "special_reaction" }>
type SpecialReactionFormula = SpecialReactionRotationTraceEntry["formula"]
type SpecialReactionKind = Extract<
  SpecialReactionFormula,
  { readonly kind: "special_reaction_coefficient" }
>["reactionKind"]
type CatalogPrimaryAction = CatalogResponse["characters"][number]["primaryActions"][number]
type CatalogSupportMetric = CatalogResponse["characters"][number]["supportMetrics"][number]
type CatalogScenarioParameter = NonNullable<CatalogSupportMetric["scenarioParameters"]>[number]
type ScenarioEffectOption = NonNullable<CatalogPrimaryAction["scenarioEffects"]>[number]
type AppliedScenarioBuff = AnalysisResponse["evaluation"]["appliedBuffs"][number]
type AppliedActionEffect = AnalysisResponse["evaluation"]["appliedEffects"][number]
type ActiveResonanceId = AnalysisResponse["evaluation"]["teamState"]["activeResonanceIds"][number]
type ResolvedScenarioStats = AnalysisResponse["evaluation"]["stats"]
type ResolvedStatContribution = ResolvedScenarioStats["statContributions"][number]
type SupportMetricFormula = SupportMetricEvaluationResponse["metric"]["formula"]

interface SupportMetricContextDraft {
  readonly actionParameters?: Record<string, number> | undefined
  readonly recipient?: {
    readonly buildId?: string | undefined
    readonly currentHpFraction?: number | undefined
    readonly isMoonsign?: boolean | undefined
    readonly isWithinSourceArea?: boolean | undefined
  }
  readonly source?: {
    readonly currentHpFraction?: number | undefined
  }
}

const traceStageMeta: Readonly<Record<PipelineStage, { readonly hint: string; readonly label: string }>> = {
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
  big_power: { hint: "特殊反应的独立大权倍率", label: "大权区" },
  flat_damage_addition: { hint: "特殊反应大力出奇迹后的固定伤害", label: "固定伤害加成" },
  crit: { hint: "暴击率折算后的期望倍率", label: "暴击区" },
  defense: { hint: "等级、防御降低与无视防御", label: "防御区" },
  resistance: { hint: "敌人抗性与抗性降低", label: "抗性区" },
  hit_count: { hint: "同一事件的多段命中合计", label: "命中段数" },
  transformative_reaction: { hint: "剧变反应的等级、元素精通与反应加成", label: "剧变反应区" },
  ascension: { hint: "特殊反应抗性结算后的独立伤害擢升", label: "伤害擢升区" }
}

const resonanceLabels: Readonly<Record<ActiveResonanceId, string>> = {
  "resonance.anemo": "迅捷之风",
  "resonance.cryo": "粉碎之冰",
  "resonance.dendro": "蔓生之草",
  "resonance.electro": "强能之雷",
  "resonance.geo": "坚定之岩",
  "resonance.hydro": "愈疗之水",
  "resonance.protective": "交织之护",
  "resonance.pyro": "热诚之火"
}

const moonsignLabels = {
  ascendant_gleam: "月兆·满辉",
  nascent_gleam: "月兆·初辉",
  none: "无月兆"
} as const

const actionEffectTargetLabels: Readonly<Record<AppliedActionEffect["target"], string>> = {
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
  specialReactionBigPowerBonus: "月曜/星烁反应专属倍率",
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

function numberValue(value: string, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getDefaultActionParameters(action: CatalogPrimaryAction | undefined): Record<string, number> | undefined {
  if (!action?.scenarioParameters?.length) return undefined
  return Object.fromEntries(action.scenarioParameters.map((parameter) => [parameter.id, parameter.defaultValue]))
}

function getScenarioParameterRange(
  parameter: CatalogScenarioParameter,
  sourceConstellation: number
): Pick<CatalogScenarioParameter, "defaultValue" | "maximumValue" | "minimumValue"> {
  const eligibleRanges = parameter.rangeBySourceConstellation
    ?.filter((range) => sourceConstellation >= range.minimumSourceConstellation)
    .sort((left, right) => left.minimumSourceConstellation - right.minimumSourceConstellation)
  const range = eligibleRanges?.at(-1)
  return {
    defaultValue: range?.defaultValue ?? parameter.defaultValue,
    maximumValue: range?.maximumValue ?? parameter.maximumValue,
    minimumValue: range?.minimumValue ?? parameter.minimumValue
  }
}

function createSupportMetricContextDraft(): SupportMetricContextDraft {
  return {}
}

function createSupportMetricEvaluationContext(
  draft: SupportMetricContextDraft,
  teammates: readonly CharacterBuild[]
): MetricEvaluationContext {
  const context: MetricEvaluationContext = { teammates: [...teammates] }
  if (draft.actionParameters && Object.keys(draft.actionParameters).length > 0) {
    context.actionParameters = { ...draft.actionParameters }
  }
  if (draft.source) {
    context.source = draft.source.currentHpFraction === undefined ? {} : { currentHpFraction: draft.source.currentHpFraction }
  }
  if (draft.recipient?.buildId) {
    context.recipient = {
      buildId: draft.recipient.buildId,
      ...(draft.recipient.currentHpFraction === undefined
        ? {}
        : { currentHpFraction: draft.recipient.currentHpFraction }),
      ...(draft.recipient.isMoonsign === undefined ? {} : { isMoonsign: draft.recipient.isMoonsign }),
      ...(draft.recipient.isWithinSourceArea === undefined
        ? {}
        : { isWithinSourceArea: draft.recipient.isWithinSourceArea })
    }
  }
  return context
}

function needsRecipientInSourceArea(metric: CatalogSupportMetric): boolean {
  return metric.recipientRequirements?.some((requirement) => requirement.kind === "recipient_in_source_area") ?? false
}

function needsRecipientHpFraction(metric: CatalogSupportMetric, sourceBuild: CharacterBuild): boolean {
  const hasBaseRequirement =
    metric.recipientRequirements?.some(
      (requirement) =>
        requirement.kind === "recipient_hp_fraction" &&
        (requirement.waivedAtSourceConstellation === undefined ||
          sourceBuild.constellation < requirement.waivedAtSourceConstellation)
    ) ?? false
  const hasConditionalRequirement =
    metric.conditionalRecipientRequirements?.some(
      (requirement) => sourceBuild.constellation >= requirement.minimumSourceConstellation
    ) ?? false
  return hasBaseRequirement || hasConditionalRequirement
}

function needsSourceHpFraction(metric: CatalogSupportMetric): boolean {
  return metric.sourceHpRequirements?.some((requirement) => requirement.kind === "source_hp_fraction") ?? false
}

function validateSupportMetricContext(
  metric: CatalogSupportMetric,
  sourceBuild: CharacterBuild,
  draft: SupportMetricContextDraft
): string | undefined {
  if (metric.target === "friendly_recipient") {
    const recipient = draft.recipient
    if (!recipient?.buildId) return "请选择该辅助指标的受益角色"
    if (needsRecipientInSourceArea(metric) && typeof recipient.isWithinSourceArea !== "boolean") {
      return "请明确受益角色是否位于来源技能区域内"
    }
    if (needsRecipientHpFraction(metric, sourceBuild) && recipient.currentHpFraction === undefined) {
      return "请填写受益角色当前生命比例"
    }
    if (metric.recipientTargetRouting === "active_recipient_if_moonsign_else_self" && typeof recipient.isMoonsign !== "boolean") {
      return "请明确受益角色是否处于月兆状态"
    }
  }
  if (needsSourceHpFraction(metric) && draft.source?.currentHpFraction === undefined) {
    return "请填写来源角色当前生命比例"
  }
  return undefined
}

function parseOptionalPercent(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed / 100 : undefined
}

function countArtifactSetPieces(build: CharacterBuild, setId: string): number {
  return build.artifacts.filter((artifact) => artifact.setId === setId).length
}

function getScenarioEffectSourceBuilds(
  effect: ScenarioEffectOption,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): readonly CharacterBuild[] {
  const source = effect.source
  const party = [primary, ...teammates]
  let sourceBuilds: readonly CharacterBuild[]
  if (source.kind === "character") {
    sourceBuilds = party.filter(
      (build) => build.characterId === source.characterId && build.constellation >= (source.minimumSourceConstellation ?? 0)
    )
  } else if (source.kind === "weapon") {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => build.weapon.weaponId === source.weaponId)
  } else {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => countArtifactSetPieces(build, source.setId) >= source.minimumPieces)
  }
  if (effect.recipientSourceRelation === "not_source") {
    return sourceBuilds.filter((build) => build.buildId !== primary.buildId)
  }
  if (effect.recipientSourceRelation === "source") {
    return sourceBuilds.filter((build) => build.buildId === primary.buildId)
  }
  return sourceBuilds
}

function isScenarioEffectSourceAvailable(
  effect: ScenarioEffectOption,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): boolean {
  return getScenarioEffectSourceBuilds(effect, primary, teammates).length > 0
}

function getScenarioEffectOptions(
  action: CatalogPrimaryAction | undefined,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): readonly ScenarioEffectOption[] {
  if (!action) return []
  const contentOptions = (action.scenarioEffects ?? []).filter((effect) =>
    isScenarioEffectSourceAvailable(effect, primary, teammates)
  )
  const temporaryOptions: readonly ScenarioEffectOption[] = [
    ...(action.id === "raiden.burst.initial_slash"
      ? [
          {
            id: "raiden.skill.eye",
            label: "雷罚恶曜之眼",
            source: { characterId: "RaidenShogun", kind: "character" as const }
          }
        ]
      : []),
    ...(teammates.some((build) => build.characterId === "Bennett")
      ? [
          {
            id: "bennett.burst.field",
            label: "班尼特领域",
            source: { characterId: "Bennett", kind: "character" as const }
          }
        ]
      : [])
  ]
  return [
    ...temporaryOptions.filter((effect) => isScenarioEffectSourceAvailable(effect, primary, teammates)),
    ...contentOptions
  ]
}

function reconcileScenarioEffectIds(
  activeEffectIds: readonly string[],
  action: CatalogPrimaryAction | undefined,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): string[] {
  const effectOptions = getScenarioEffectOptions(action, primary, teammates)
  const effectsById = new Map(effectOptions.map((effect) => [effect.id, effect]))
  const selectedEffectIds = new Set(
    activeEffectIds.filter((effectId) => {
      const effect = effectsById.get(effectId)
      return effect !== undefined && effect.requiredActiveEffectIds === undefined
    })
  )
  let added = true
  while (added) {
    added = false
    for (const effect of effectOptions) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        selectedEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => selectedEffectIds.has(effectId))
      ) {
        continue
      }
      selectedEffectIds.add(effect.id)
      added = true
    }
  }
  return [...selectedEffectIds]
}

function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })
}

function formatDamage(value: number): string {
  return formatNumber(value)
}

function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${(value * 100).toFixed(1)}%`
}

function formatMarginalPercent(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${(value * 100).toFixed(2)}%`
}

function formatAppliedScenarioBuff(buff: AppliedScenarioBuff): string {
  if (["attack_flat", "defense_flat", "hp_flat", "elemental_mastery"].includes(buff.stat)) {
    return `+${formatNumber(buff.value)}`
  }
  return formatPercent(buff.value)
}

function formatAppliedActionEffect(effect: AppliedActionEffect): string {
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

function formatFormulaNumber(value: number): string {
  return formatNumber(value)
}

function formatFormulaPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function getScalingStatLabel(stat: "attack" | "defense" | "elementalMastery" | "hp"): string {
  if (stat === "attack") return "攻击力"
  if (stat === "defense") return "防御力"
  if (stat === "elementalMastery") return "元素精通"
  return "生命值"
}

function formatScalingTerms(
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

function FormulaValue({ children, stage }: { readonly children: string; readonly stage: PipelineStage }) {
  return <strong className={`formulaValue formulaValue--${stage}`}>{children}</strong>
}

function FormulaEquation({ children, label }: { readonly children: ReactNode; readonly label: string }) {
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

function ScalingStatBreakdown({
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

function getSupportMetricKindLabel(metric: CatalogSupportMetric): string {
  return supportMetricKindLabels[metric.kind]
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

function SupportMetricReport({
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

function getAmplifyingReactionLabel(reaction: AmplifyingReaction): string {
  return amplifyingReactionLabels[reaction]
}

function getAdditiveReactionLabel(reaction: AdditiveReaction): string {
  return additiveReactionLabels[reaction]
}

function getTransformativeReactionLabel(reaction: TransformativeReaction): string {
  return transformativeReactionLabels[reaction]
}

function getSpecialReactionLabel(reaction: SpecialReactionKind): string {
  return specialReactionLabels[reaction]
}

function getElementLabel(element: string): string {
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

function ActionEffectSources({
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

function SpecialReactionTraceFormula({
  after,
  before,
  effects,
  formula,
  previousStage,
  stats
}: {
  readonly after: number
  readonly before: number
  readonly effects: readonly AppliedActionEffect[] | undefined
  readonly formula: SpecialReactionFormula
  readonly previousStage: PipelineStage
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
      </div>
    )
  }
  if (formula.kind === "special_reaction_big_power") {
    return (
      <div className="formulaLines">
        <FormulaEquation label="大权倍率">
          <FormulaValue stage={previousStage}>{formatFormulaNumber(before)}</FormulaValue> ×{" "}
          <FormulaValue stage="big_power">{formatFormulaPercent(formula.multiplier)}</FormulaValue> ={" "}
          <FormulaValue stage="big_power">{formatFormulaNumber(after)}</FormulaValue>
        </FormulaEquation>
        <ActionEffectSources effects={effects} targets={["specialReactionBigPowerBonus"]} />
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

function TraceFormula({
  entry,
  effects,
  previousStage,
  stats
}: {
  readonly entry: DamageTraceEntry
  readonly effects: readonly AppliedActionEffect[] | undefined
  readonly previousStage: DamageTraceStage
  readonly stats: ResolvedScenarioStats | undefined
}) {
  const formula = entry.formula
  if (
    formula.kind === "special_reaction_base_damage" ||
    formula.kind === "special_reaction_coefficient" ||
    formula.kind === "special_reaction_base_damage_bonus" ||
    formula.kind === "special_reaction_damage_bonus" ||
    formula.kind === "special_reaction_big_power" ||
    formula.kind === "special_reaction_flat_damage_addition" ||
    formula.kind === "special_reaction_ascension"
  ) {
    return <SpecialReactionTraceFormula after={entry.after} before={entry.before} effects={effects} formula={formula} previousStage={previousStage} stats={stats} />
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

function getRotationTraceStage(entry: RotationTraceEntry): PipelineStage {
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

function getRotationEventElementSummary(event: RotationEvent): string {
  const damageElement = getRotationEventDamageElement(event)
  if (damageElement === event.element) return `伤害元素：${getElementLabel(damageElement)}`
  return `触发元素：${getElementLabel(event.element)} · 伤害元素：${getElementLabel(damageElement)}`
}

function RotationTraceFormula({
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

function sourceLabel(build: CharacterBuild): string {
  if (build.source.kind === "builtin") return "内设默认配置"
  if (build.source.kind === "showcase") return `展示柜 ${build.source.uid}`
  if (build.source.kind === "json") return "JSON 导入"
  return "手动配置"
}

function getCharacterLabel(catalog: CatalogResponse, characterId: string): string {
  return catalog.characters.find((character) => character.characterId === characterId)?.label ?? "未知角色"
}

function ArtifactEditor({
  artifact,
  catalog,
  onChange
}: {
  readonly artifact: ArtifactPiece
  readonly catalog: CatalogResponse
  readonly onChange: (artifact: ArtifactPiece) => void
}) {
  const updateSubstat = (index: number, update: Partial<ArtifactPiece["substats"][number]>) => {
    onChange({
      ...artifact,
      substats: artifact.substats.map((substat, substatIndex) =>
        substatIndex === index ? { ...substat, ...update } : substat
      )
    })
  }

  return (
    <article className="artifactEditor">
      <div className="artifactTitle">
        <div>
          <span>{slotLabels[artifact.slot]}</span>
          <strong>{artifact.setId}</strong>
        </div>
        <span className="levelTag">+{artifact.level}</span>
      </div>
      <div className="artifactMainGrid">
        <label>
          <span>套装</span>
          <select value={artifact.setId} onChange={(event) => onChange({ ...artifact, setId: event.target.value })}>
            {catalog.artifactSets.map((set) => (
              <option key={set.setId} value={set.setId}>
                {set.label}
              </option>
            ))}
            {!catalog.artifactSets.some((set) => set.setId === artifact.setId) && (
              <option value={artifact.setId}>{artifact.setId}</option>
            )}
          </select>
        </label>
        <label>
          <span>等级</span>
          <input
            max={20}
            min={0}
            type="number"
            value={artifact.level}
            onChange={(event) => onChange({ ...artifact, level: numberValue(event.target.value) })}
          />
        </label>
        <label>
          <span>主属性</span>
          <select
            value={artifact.mainStat.stat}
            onChange={(event) =>
              onChange({
                ...artifact,
                mainStat: { stat: event.target.value as ArtifactStat, value: 0 }
              })
            }
          >
            {artifactStats.map((stat) => (
              <option key={stat} value={stat}>
                {statLabels[stat]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>数值</span>
          <input
            min={0}
            step="0.1"
            type="number"
            value={toDisplayStatValue(artifact.mainStat.stat, artifact.mainStat.value)}
            onChange={(event) =>
              onChange({
                ...artifact,
                mainStat: {
                  ...artifact.mainStat,
                  value: fromDisplayStatValue(artifact.mainStat.stat, numberValue(event.target.value))
                }
              })
            }
          />
        </label>
      </div>
      <div className="substatList">
        {artifact.substats.map((substat, index) => (
          <div className="substatRow" key={`${artifact.id}-${index}`}>
            <select
              aria-label={`${slotLabels[artifact.slot]}副属性 ${index + 1}`}
              value={substat.stat}
              onChange={(event) => updateSubstat(index, { stat: event.target.value as ArtifactStat, value: 0 })}
            >
              {substatOptions.map((stat) => (
                <option key={stat} value={stat}>
                  {statLabels[stat]}
                </option>
              ))}
            </select>
            <input
              aria-label={`${statLabels[substat.stat]}数值`}
              min={0}
              step="0.1"
              type="number"
              value={toDisplayStatValue(substat.stat, substat.value)}
              onChange={(event) =>
                updateSubstat(index, {
                  value: fromDisplayStatValue(substat.stat, numberValue(event.target.value))
                })
              }
            />
            <button
              aria-label="删除副属性"
              className="iconButton"
              type="button"
              onClick={() =>
                onChange({ ...artifact, substats: artifact.substats.filter((_, substatIndex) => substatIndex !== index) })
              }
            >
              ×
            </button>
          </div>
        ))}
        {artifact.substats.length < 4 && (
          <button
            className="textButton"
            type="button"
            onClick={() =>
              onChange({ ...artifact, substats: [...artifact.substats, { stat: "crit_rate", value: 0.033 }] })
            }
          >
            ＋ 添加副属性
          </button>
        )}
      </div>
    </article>
  )
}

export function BuildEditor({ build, catalog, onChange }: BuildEditorProps) {
  const character = catalog.characters.find((candidate) => candidate.characterId === build.characterId)
  const weapons = catalog.weapons.filter((weapon) => weapon.weaponType === character?.weaponType)
  const updateWeapon = (weaponId: string) => {
    const weapon = weapons.find((candidate) => candidate.weaponId === weaponId)
    onChange({
      ...build,
      weapon: {
        ...build.weapon,
        refinement: weapon ? getWeaponComparisonRefinement(weapon.rarity) : build.weapon.refinement,
        weaponId
      }
    })
  }
  const updateArtifact = (index: number, artifact: ArtifactPiece) => {
    onChange({ ...build, artifacts: build.artifacts.map((current, artifactIndex) => (artifactIndex === index ? artifact : current)) })
  }

  return (
    <div className="buildEditor">
      <div className="identityGrid">
        <label className="wideField">
          <span>配置名称</span>
          <input value={build.label} onChange={(event) => onChange({ ...build, label: event.target.value })} />
        </label>
        <label>
          <span>角色等级</span>
          <input
            max={100}
            min={1}
            type="number"
            value={build.level}
            onChange={(event) => onChange({ ...build, level: numberValue(event.target.value, 1) })}
          />
        </label>
        <label>
          <span>命座</span>
          <input
            max={6}
            min={0}
            type="number"
            value={build.constellation}
            onChange={(event) => onChange({ ...build, constellation: numberValue(event.target.value) })}
          />
        </label>
      </div>

      <div className="editorSection">
        <div className="editorSectionTitle">
          <span>WEAPON</span>
          <strong>武器配置</strong>
        </div>
        <div className="weaponGrid">
          <label className="wideField">
            <span>武器</span>
            <select
              value={build.weapon.weaponId}
              onChange={(event) => updateWeapon(event.target.value)}
            >
              {weapons.map((weapon) => (
                <option key={weapon.weaponId} value={weapon.weaponId}>
                  {weapon.label} · {weapon.rarity}★
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>等级</span>
            <input
              max={90}
              min={1}
              type="number"
              value={build.weapon.level}
              onChange={(event) =>
                onChange({ ...build, weapon: { ...build.weapon, level: numberValue(event.target.value, 1) } })
              }
            />
          </label>
          <label>
            <span>精炼</span>
            <input
              max={5}
              min={1}
              type="number"
              value={build.weapon.refinement}
              onChange={(event) =>
                onChange({ ...build, weapon: { ...build.weapon, refinement: numberValue(event.target.value, 1) } })
              }
            />
          </label>
        </div>
      </div>

      <div className="editorSection">
        <div className="editorSectionTitle">
          <span>TALENTS</span>
          <strong>天赋等级</strong>
        </div>
        <div className="talentGrid">
          {(["normal", "skill", "burst"] as const).map((talent) => (
            <label key={talent}>
              <span>{talent === "normal" ? "普通攻击" : talent === "skill" ? "元素战技" : "元素爆发"}</span>
              <input
                max={15}
                min={1}
                type="number"
                value={build.talents[talent]}
                onChange={(event) =>
                  onChange({
                    ...build,
                    talents: { ...build.talents, [talent]: numberValue(event.target.value, 1) }
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="editorSection artifactsSection">
        <div className="editorSectionTitle">
          <span>ARTIFACTS</span>
          <strong>五件圣遗物 · 原始值输入</strong>
        </div>
        <p className="fieldHint">百分比直接输入面板数值，例如暴击率 31.1% 输入 31.1；展示柜导入会自动换算。</p>
        <div className="artifactGrid">
          {build.artifacts.map((artifact, index) => (
            <ArtifactEditor
              artifact={artifact}
              catalog={catalog}
              key={artifact.slot}
              onChange={(updated) => updateArtifact(index, updated)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function getMaximumReachableConditions(
  conditions: EvaluationScenario["conditions"],
  action: CatalogPrimaryAction | undefined,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  selectedCharacterEffectIds: readonly string[]
): EvaluationScenario["conditions"] {
  const activeEffectIds = reconcileScenarioEffectIds(
    selectedCharacterEffectIds,
    action,
    primary,
    teammates
  )
  const options = getScenarioEffectOptions(action, primary, teammates)
  const activeEffectSourceBuildIds = Object.fromEntries(
    options.flatMap((effect) => {
      if (!activeEffectIds.includes(effect.id)) return []
      const sourceBuilds = [...getScenarioEffectSourceBuilds(effect, primary, teammates)]
      if (sourceBuilds.length < 2) return []
      sourceBuilds.sort((left, right) => right.weapon.refinement - left.weapon.refinement)
      return [[effect.id, sourceBuilds[0]!.buildId] as const]
    })
  )
  return {
    ...conditions,
    activeEffectIds,
    ...(Object.keys(activeEffectSourceBuildIds).length > 0 ? { activeEffectSourceBuildIds } : {})
  }
}

function removeUnavailableResonanceConditions(
  conditions: EvaluationScenario["conditions"],
  hasCryoResonance: boolean,
  hasGeoResonance: boolean
): EvaluationScenario["conditions"] {
  let normalized = conditions
  if (!hasGeoResonance && normalized.primaryShielded !== undefined) {
    const { primaryShielded: _primaryShielded, ...withoutShield } = normalized
    normalized = withoutShield
  }
  if (!hasCryoResonance && normalized.targetFrozen !== undefined) {
    const { targetFrozen: _targetFrozen, ...withoutFrozen } = normalized
    normalized = withoutFrozen
  }
  return normalized
}

function ArtifactRawValueReport({ build, catalog }: { readonly build: CharacterBuild; readonly catalog: CatalogResponse }) {
  return (
    <article className="wideReport rawArtifactReport">
      <div className="cardTitle">
        <span>ARTIFACT INPUT</span>
        <strong>圣遗物原始值输入</strong>
        <small>当前五件圣遗物参与计算的主词条与副词条</small>
      </div>
      <div className="rawArtifactRows">
        {build.artifacts.map((artifact) => (
          <div key={artifact.id}>
            <ArtifactIcon label={catalog.artifactSets.find((set) => set.setId === artifact.setId)?.label ?? artifact.setId} setId={artifact.setId} slot={artifact.slot} />
            <span className="rawArtifactIdentity"><strong>{slotLabels[artifact.slot]}</strong><small>{catalog.artifactSets.find((set) => set.setId === artifact.setId)?.label ?? artifact.setId}</small></span>
            <span>{statLabels[artifact.mainStat.stat]} {toDisplayStatValue(artifact.mainStat.stat, artifact.mainStat.value).toFixed(1)}</span>
            <small>{artifact.substats.map((substat) => `${statLabels[substat.stat]} ${toDisplayStatValue(substat.stat, substat.value).toFixed(1)}`).join(" · ") || "无副词条"}</small>
          </div>
        ))}
      </div>
    </article>
  )
}

function OrderedDamageReport({
  analysis,
  build,
  catalog,
  onWeaponRefinementChange,
  targetAction
}: {
  readonly analysis: AnalysisResponse
  readonly build: CharacterBuild
  readonly catalog: CatalogResponse
  readonly onWeaponRefinementChange: (weaponId: string, refinement: number) => void
  readonly targetAction: CatalogPrimaryAction | undefined
}) {
  const rotationTraceEvents = analysis.evaluation.rotation.events.filter((event) => event.trace.length > 0)
  const usesRotationTrace = analysis.evaluation.formulaAuthority === "rotation_events" && rotationTraceEvents.length > 0
  const traceLegendStages: readonly PipelineStage[] = usesRotationTrace
    ? [...new Set(rotationTraceEvents.flatMap((event) => event.trace.map(getRotationTraceStage)))]
    : analysis.evaluation.result.trace.map((entry) => entry.stage)

  return (
    <div className="orderedReport">
      <article className="damageHero">
        <div className="metricLabel">指标期望结果</div>
        <div className="teamStateStrip" aria-label="队伍共鸣与月兆状态">
          {analysis.evaluation.teamState.activeResonanceIds.map((id) => <span key={id}>{resonanceLabels[id]}</span>)}
          {analysis.evaluation.teamState.hexereiSecretRite ? <span>魔导秘仪</span> : null}
          <span>{moonsignLabels[analysis.evaluation.teamState.moonsign.level]}</span>
        </div>
        <strong>{formatDamage(analysis.evaluation.rotation.dpr)}</strong>
        <span>{targetAction?.label ?? "目标技能"} · 当前配置 C{build.constellation} · 动作总暴击期望</span>
        <div className="damageSplit">
          <div><small>不暴击</small><b>{formatDamage(analysis.evaluation.rotation.events.reduce((total, event) => total + event.nonCritDamage, 0))}</b></div>
          <div><small>暴击</small><b>{formatDamage(analysis.evaluation.rotation.events.reduce((total, event) => total + event.critDamage, 0))}</b></div>
        </div>
      </article>

      <article className="resolvedStats">
        <div className="cardTitle"><span>RESOLVED</span><strong>结算面板</strong></div>
        <dl>
          <div><dt>基础攻击</dt><dd>{formatNumber(analysis.evaluation.stats.baseAttack)}</dd></div>
          <div><dt>最终攻击</dt><dd>{formatNumber(analysis.evaluation.stats.effectiveAttack)}</dd></div>
          <div><dt>攻击力%</dt><dd>{(analysis.evaluation.stats.attackPercent * 100).toFixed(1)}%</dd></div>
          <div><dt>固定攻击</dt><dd>{formatNumber(analysis.evaluation.stats.flatAttack)}</dd></div>
          <div><dt>暴击率</dt><dd>{(analysis.evaluation.stats.critRate * 100).toFixed(1)}%</dd></div>
          <div><dt>暴击伤害</dt><dd>{(analysis.evaluation.stats.critDamage * 100).toFixed(1)}%</dd></div>
          <div><dt>伤害加成</dt><dd>{(analysis.evaluation.stats.damageBonus * 100).toFixed(1)}%</dd></div>
          <div><dt>元素精通</dt><dd>{formatNumber(analysis.evaluation.stats.elementalMastery)}</dd></div>
          <div><dt>元素充能</dt><dd>{(analysis.evaluation.stats.energyRecharge * 100).toFixed(1)}%</dd></div>
          {analysis.evaluation.stats.resistanceReduction > 0 ? <div><dt>抗性降低</dt><dd>{formatPercent(analysis.evaluation.stats.resistanceReduction)}</dd></div> : null}
          <div><dt>倍率</dt><dd>{analysis.evaluation.stats.talentMultiplier === null ? formatScalingTerms(analysis.evaluation.stats.scalingTerms ?? []) : `${(analysis.evaluation.stats.talentMultiplier * 100).toFixed(1)}%`}</dd></div>
        </dl>
      </article>

      <article className="wideReport traceReport">
        <div className="cardTitle"><span>DAMAGE PIPELINE</span><strong>结算轨迹</strong><small>从基础伤害到反应、抗性与命中段数</small></div>
        <div className="traceLegend" aria-label="伤害乘区颜色图例">
          {traceLegendStages.map((stage) => <span className={`traceLegendItem traceLegendItem--${stage}`} key={stage}><i aria-hidden="true" />{traceStageMeta[stage].label}</span>)}
        </div>
        <div className="traceSteps">
          {usesRotationTrace
            ? rotationTraceEvents.map((event, eventIndex) => (
                <section className="traceEvent" key={event.id}>
                  <div className="traceEventTitle"><strong>{`EVENT ${String(eventIndex + 1).padStart(2, "0")} · ${event.id}`}</strong><small>{`${getRotationEventElementSummary(event)} · ${event.time.toFixed(2)}s · ${event.hitCount} 段`}</small></div>
                  {event.trace.map((entry, index) => {
                    const stage = getRotationTraceStage(entry)
                    const previousStage = getRotationTraceStage(event.trace[index - 1] ?? entry)
                    return <div aria-label={`${event.id} ${traceStageMeta[stage].label}结算公式`} className="traceStep" data-stage={stage} key={`${event.id}-${index}-${entry.kind}`}><div className="traceStage"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{traceStageMeta[stage].label}</strong><small>{traceStageMeta[stage].hint}</small></div></div><RotationTraceFormula analysis={analysis} entry={entry} previousStage={previousStage} targetAction={targetAction} /></div>
                  })}
                </section>
              ))
            : analysis.evaluation.result.trace.map((entry, index) => <div aria-label={`${traceStageMeta[entry.stage].label}结算公式`} className="traceStep" data-stage={entry.stage} key={`${entry.stage}-${index}`}><div className="traceStage"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{traceStageMeta[entry.stage].label}</strong><small>{traceStageMeta[entry.stage].hint}</small></div></div><TraceFormula effects={analysis.evaluation.appliedEffects} entry={entry} previousStage={analysis.evaluation.result.trace[index - 1]?.stage ?? entry.stage} stats={analysis.evaluation.stats} /></div>)}
        </div>
        <div className="buffStrip">
          {analysis.evaluation.appliedBuffs.map((buff) => <span key={`${buff.sourceId}-${buff.stat}`}>{buff.label} {formatAppliedScenarioBuff(buff)}</span>)}
          {analysis.evaluation.appliedEffects.map((effect) => <span key={effect.id}>{effect.label} · {actionEffectTargetLabels[effect.target]} {formatAppliedActionEffect(effect)}</span>)}
        </div>
      </article>

      <article className="wideReport effectiveReport">
        <div className="cardTitle"><span>EFFECTIVE ROLLS</span><strong>圣遗物有效词条</strong><small>按当前词条边际收益加权</small></div>
        <div className="effectiveTotal"><strong>{analysis.analysis.totalEffectiveRolls.toFixed(1)}</strong><span>总有效词条</span></div>
        <div className="artifactScores">{analysis.analysis.effectiveArtifacts.map((artifact) => <div key={artifact.artifactId}><span>{slotLabels[artifact.slot]}</span><strong>{formatNumber(artifact.effectiveRolls)}</strong></div>)}</div>
      </article>

      <ArtifactRawValueReport build={build} catalog={catalog} />

      <article className="wideReport substatReport">
        <div className="cardTitle"><span>ONE AVERAGE ROLL</span><strong>词条增加的边际收益</strong><small>额外增加一个五星圣遗物平均档</small></div>
        <div className="gainBars">{analysis.analysis.marginalSubstats.map((result) => <div className="gainBar" key={result.stat}><span>{result.label}</span><div><i style={{ width: `${Math.max(result.weight * 100, 1)}%` }} /></div><b>{formatMarginalPercent(result.gainRatio)}</b></div>)}</div>
        {analysis.analysis.progressionGains.length > 0 ? <><div className="gainGroupTitle">角色成长</div><div className="gainBars">{analysis.analysis.progressionGains.map((result) => <div className="gainBar" key={result.id}><span>{result.label}</span><div><i style={{ width: `${Math.max(result.weight * 100, 1)}%` }} /></div><b>{formatMarginalPercent(result.gainRatio)}</b></div>)}</div></> : null}
      </article>

      <article className="wideReport weaponReport">
        <div className="cardTitle"><span>WEAPON SWAP</span><strong>更换武器收益</strong><small>每把武器可独立选择精炼等级，并重新解析装备效果</small></div>
        <div className="weaponRows">{analysis.analysis.weapons.map((weapon, index) => <div className="weaponRow" key={weapon.weaponId}><span className="rankNumber">{String(index + 1).padStart(2, "0")}</span><WeaponIcon label={weapon.label} weaponId={weapon.weaponId} /><div><strong>{weapon.label}</strong><small>{weapon.rarity}★ · R{weapon.refinement}</small></div><label className="weaponRefinement"><span>精炼</span><select aria-label={`${weapon.label}精炼等级`} value={weapon.refinement} onChange={(event) => onWeaponRefinementChange(weapon.weaponId, numberValue(event.target.value, 1))}>{[1, 2, 3, 4, 5].map((refinement) => <option key={refinement} value={refinement}>R{refinement}</option>)}</select></label><span>{formatDamage(weapon.expectedDamage)}</span><b className={weapon.gainRatio >= 0 ? "positive" : "negative"}>{formatPercent(weapon.gainRatio)}</b></div>)}</div>
      </article>
    </div>
  )
}

export function TeamCalculationWorkspace({ catalog, initialScenario }: TeamCalculationWorkspaceProps) {
  const fallbackBuilds = useMemo(() => [initialScenario.primary, ...initialScenario.teammates], [initialScenario])
  const [builds, setBuilds] = useState<CharacterBuild[]>([])
  const [partyBuildIds, setPartyBuildIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [targetBuildId, setTargetBuildId] = useState<string | null>(null)
  const [targetActionId, setTargetActionId] = useState<string | null>(null)
  const [supportMetricId, setSupportMetricId] = useState<string | null>(null)
  const [supportMetricContext, setSupportMetricContext] = useState<SupportMetricContextDraft>({})
  const [conditions, setConditions] = useState<EvaluationScenario["conditions"]>(() => {
    const { activeEffectSourceBuildIds: _activeEffectSourceBuildIds, ...initialConditions } = initialScenario.conditions
    return { ...initialConditions, activeEffectIds: [], equipmentEffectMode: "maximum_reachable" }
  })
  const [enemy, setEnemy] = useState(initialScenario.enemy)
  const [buffs, setBuffs] = useState([...initialScenario.externalBuffs])
  const [selectedCharacterEffectIds, setSelectedCharacterEffectIds] = useState<string[]>([])
  const [weaponComparisonRefinements, setWeaponComparisonRefinements] = useState<Record<string, number>>({})
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [supportMetricResponse, setSupportMetricResponse] = useState<SupportMetricEvaluationResponse | null>(null)
  const [status, setStatus] = useState("请选择计算对象和指标")
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const library = loadBuildLibrary(window.localStorage, fallbackBuilds)
      const party = loadParty(window.localStorage, library.builds)
      setBuilds([...library.builds])
      setPartyBuildIds([...party.memberBuildIds])
      if (party.memberBuildIds.length === 0) setError("当前队伍为空，请返回配置页选择队伍成员")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法读取队伍配置")
    } finally {
      setReady(true)
    }
  }, [fallbackBuilds])

  const partyBuilds = partyBuildIds.flatMap((buildId) => {
    const build = builds.find((candidate) => candidate.buildId === buildId)
    return build ? [build] : []
  })
  const partyElementCounts = partyBuilds.reduce(
    (counts, build) => {
      const element = getCharacterElement(build.characterId)
      if (element !== "traveler") counts.set(element, (counts.get(element) ?? 0) + 1)
      return counts
    },
    new Map<string, number>()
  )
  const hasCryoResonance = (partyElementCounts.get("cryo") ?? 0) >= 2
  const hasGeoResonance = (partyElementCounts.get("geo") ?? 0) >= 2
  const targetBuild = partyBuilds.find((build) => build.buildId === targetBuildId)
  const targetCharacter = catalog.characters.find((character) => character.characterId === targetBuild?.characterId)
  const targetAction = targetCharacter?.primaryActions.find((action) => action.id === targetActionId)
  const selectedSupportMetric = targetCharacter?.supportMetrics.find((metric) => metric.id === supportMetricId)
  const teammates = targetBuild ? partyBuilds.filter((build) => build.buildId !== targetBuild.buildId) : []
  const characterEffectOptions = targetBuild
    ? getScenarioEffectOptions(targetAction, targetBuild, teammates).filter(
        (effect) => effect.source.kind === "character" && effect.requiredActiveEffectIds === undefined
      )
    : []
  const optionalEffectGroups = targetBuild
    ? [...getScenarioEffectOptions(targetAction, targetBuild, teammates)
        .filter((effect) => effect.selectionMode === "optional")
        .reduce((groups, effect) => {
          const group = effect.exclusiveGroup ?? effect.id
          groups.set(group, [...(groups.get(group) ?? []), effect])
          return groups
        }, new Map<string, ScenarioEffectOption[]>())]
    : []

  useEffect(() => {
    setConditions((current) => {
      const shouldClearShield = !hasGeoResonance && current.primaryShielded !== undefined
      const shouldClearFrozen = !hasCryoResonance && current.targetFrozen !== undefined
      if (!shouldClearShield && !shouldClearFrozen) return current

      const next = { ...current }
      if (shouldClearShield) delete next.primaryShielded
      if (shouldClearFrozen) delete next.targetFrozen
      return next
    })
  }, [hasCryoResonance, hasGeoResonance])

  const clearResults = () => {
    setAnalysis(null)
    setSupportMetricResponse(null)
  }

  const selectTargetBuild = (buildId: string) => {
    setTargetBuildId(buildId)
    setTargetActionId(null)
    setSupportMetricId(null)
    setSupportMetricContext({})
    setSelectedCharacterEffectIds([])
    clearResults()
    setStatus("请选择该角色的计算指标")
  }

  const selectDamageMetric = (action: CatalogPrimaryAction) => {
    setTargetActionId(action.id)
    setSupportMetricId(null)
    setSupportMetricContext({})
    setSelectedCharacterEffectIds([])
    setConditions((current) => {
      const {
        actionParameters: _actionParameters,
        activeEffectSourceBuildIds: _activeEffectSourceBuildIds,
        ...retainedConditions
      } = current
      const actionParameters = getDefaultActionParameters(action)
      return {
        ...retainedConditions,
        activeEffectIds: [],
        ...(actionParameters ? { actionParameters } : {})
      }
    })
    clearResults()
    setStatus(`已选择指标：${action.label}`)
  }

  const selectSupportMetric = (metric: CatalogSupportMetric) => {
    setSupportMetricId(metric.id)
    setTargetActionId(null)
    setSupportMetricContext(createSupportMetricContextDraft())
    setSelectedCharacterEffectIds([])
    clearResults()
    setStatus(`已选择指标：${metric.label}`)
  }

  const runAnalysis = async (refinementOverrides: Readonly<Record<string, number>> = weaponComparisonRefinements) => {
    if (!targetBuild) {
      setError("请选择计算对象")
      return
    }
    setError("")
    if (selectedSupportMetric) {
      const contextError = validateSupportMetricContext(selectedSupportMetric, targetBuild, supportMetricContext)
      if (contextError) {
        setError(contextError)
        return
      }
      setStatus("正在计算辅助指标…")
      try {
        const response = await fetch("/api/backend/v1/support-metrics/evaluate", {
          body: JSON.stringify({
            build: targetBuild,
            context: createSupportMetricEvaluationContext(supportMetricContext, teammates),
            metricId: selectedSupportMetric.id
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        })
        if (!response.ok) throw new Error(`辅助指标接口返回 HTTP ${response.status}`)
        setAnalysis(null)
        setSupportMetricResponse((await response.json()) as SupportMetricEvaluationResponse)
        setStatus("辅助指标计算完成")
      } catch (caught) {
        setStatus("计算失败")
        setError(caught instanceof Error ? caught.message : "辅助指标计算失败")
      }
      return
    }
    if (!targetAction) {
      setError("请选择目标指标")
      return
    }

    setStatus("正在计算指标与边际收益…")
    try {
      const effectiveConditions = getMaximumReachableConditions(
        removeUnavailableResonanceConditions(conditions, hasCryoResonance, hasGeoResonance),
        targetAction,
        targetBuild,
        teammates,
        selectedCharacterEffectIds
      )
      const scenario = assembleEvaluationScenario({
        baseScenario: initialScenario,
        buffs,
        conditions: effectiveConditions,
        enemy,
        metricOwnerBuildId: targetBuild.buildId,
        partyBuilds,
        targetActionId: targetAction.id
      })
      const response = await fetch("/api/backend/v1/analysis", {
        body: JSON.stringify({ ...scenario, weaponComparisonRefinements: refinementOverrides }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? `分析接口返回 HTTP ${response.status}`)
      }
      setSupportMetricResponse(null)
      setAnalysis((await response.json()) as AnalysisResponse)
      setStatus("计算完成")
    } catch (caught) {
      setStatus("计算失败")
      setError(caught instanceof Error ? caught.message : "指标计算失败")
    }
  }

  const changeWeaponComparisonRefinement = (weaponId: string, refinement: number) => {
    const nextRefinements = { ...weaponComparisonRefinements, [weaponId]: refinement }
    setWeaponComparisonRefinements(nextRefinements)
    void runAnalysis(nextRefinements)
  }

  const toggleBuffPreset = (presetId: string) => {
    const preset = catalog.buffPresets.find((candidate) => candidate.id === presetId)
    if (!preset) return
    clearResults()
    setBuffs((current) => current.some((buff) => buff.sourceId === presetId)
      ? current.filter((buff) => buff.sourceId !== presetId)
      : [...current, ...preset.buffs])
  }

  const toggleCharacterEffect = (effectId: string) => {
    clearResults()
    setSelectedCharacterEffectIds((current) => current.includes(effectId)
      ? current.filter((candidate) => candidate !== effectId)
      : [...current, effectId])
  }

  const selectOptionalEffect = (groupEffects: readonly ScenarioEffectOption[], effectId: string) => {
    clearResults()
    const groupIds = new Set(groupEffects.map((effect) => effect.id))
    setSelectedCharacterEffectIds((current) => [
      ...current.filter((candidate) => !groupIds.has(candidate)),
      ...(effectId ? [effectId] : [])
    ])
  }

  return (
    <main className="workspacePage calculationPage">
      <header className="workspaceHeader">
        <div><strong>原神指标分析</strong><span>{status}</span></div>
        <a className="workspaceBackLink" href="/">← 返回配置</a>
      </header>

      <section className="workspaceIntro">
        <span>CALCULATION</span><h1>选择成员与指标</h1><p>队伍保持不变；切换计算对象只改变本次请求的指标来源。</p>
      </section>

      {error ? <div className="workspaceError" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")}>×</button></div> : null}

      <section className="calculationSetup">
        <div className="calculationBlock">
          <div className="workspaceSectionHeading"><div><span>01</span><h2>选择计算对象</h2></div><small>{partyBuilds.length} 名队员</small></div>
          <div className="calculationParty">
            {partyBuilds.map((build) => <button aria-pressed={targetBuildId === build.buildId} className={targetBuildId === build.buildId ? "active" : ""} key={build.buildId} type="button" onClick={() => selectTargetBuild(build.buildId)}><CharacterAvatar characterId={build.characterId} label={getCharacterLabel(catalog, build.characterId)} /><span><strong>{getCharacterLabel(catalog, build.characterId)}</strong><small>{sourceLabel(build)}</small></span></button>)}
          </div>
          {ready && partyBuilds.length === 0 ? <a className="workspaceEmptyLink" href="/">返回配置页添加队伍成员</a> : null}
        </div>

        <div className="calculationBlock">
          <div className="workspaceSectionHeading"><div><span>02</span><h2>选择计算指标</h2></div></div>
          {!targetCharacter ? <p className="workspaceEmpty">请先选择一名队伍成员。</p> : (
            <div className="metricGroups">
              {targetCharacter.primaryActions.length > 0 ? <div><h3>伤害指标</h3><div>{targetCharacter.primaryActions.map((action) => <button aria-pressed={targetActionId === action.id} className={targetActionId === action.id ? "active" : ""} key={action.id} type="button" onClick={() => selectDamageMetric(action)}>{action.label}</button>)}</div></div> : null}
              {targetCharacter.supportMetrics.length > 0 ? <div><h3>辅助指标</h3><div>{targetCharacter.supportMetrics.map((metric) => <button aria-pressed={supportMetricId === metric.id} className={supportMetricId === metric.id ? "active" : ""} key={metric.id} type="button" onClick={() => selectSupportMetric(metric)}>{metric.label}</button>)}</div></div> : null}
            </div>
          )}
        </div>

        {(targetAction || selectedSupportMetric) && targetBuild ? (
          <div className="calculationBlock">
            <div className="workspaceSectionHeading"><div><span>03</span><h2>敌人与 Buff</h2></div></div>
            {selectedSupportMetric ? (
              <div className="scenarioControls">
                {selectedSupportMetric.target === "friendly_recipient" ? <label><span>受益角色</span><select aria-label="受益角色" value={supportMetricContext.recipient?.buildId ?? ""} onChange={(event) => setSupportMetricContext((current) => ({ ...current, recipient: { ...current.recipient, buildId: event.target.value } }))}><option value="">请选择</option>{partyBuilds.map((build) => <option key={build.buildId} value={build.buildId}>{getCharacterLabel(catalog, build.characterId)}</option>)}</select></label> : null}
                {needsRecipientHpFraction(selectedSupportMetric, targetBuild) ? <label><span>受益角色当前生命比例（%）</span><input aria-label="受益角色当前生命比例" max={100} min={0} type="number" value={supportMetricContext.recipient?.currentHpFraction === undefined ? "" : supportMetricContext.recipient.currentHpFraction * 100} onChange={(event) => setSupportMetricContext((current) => ({ ...current, recipient: { ...current.recipient, currentHpFraction: parseOptionalPercent(event.target.value) } }))} /></label> : null}
                {needsRecipientInSourceArea(selectedSupportMetric) ? <label className="toggleRow"><span>受益角色位于来源技能区域内</span><input aria-label="受益角色位于来源区域" checked={supportMetricContext.recipient?.isWithinSourceArea ?? false} type="checkbox" onChange={(event) => setSupportMetricContext((current) => ({ ...current, recipient: { ...current.recipient, isWithinSourceArea: event.target.checked } }))} /></label> : null}
                {selectedSupportMetric.recipientTargetRouting === "active_recipient_if_moonsign_else_self" ? <label className="toggleRow"><span>受益角色处于月兆状态</span><input aria-label="受益角色处于月兆状态" checked={supportMetricContext.recipient?.isMoonsign ?? false} type="checkbox" onChange={(event) => setSupportMetricContext((current) => ({ ...current, recipient: { ...current.recipient, isMoonsign: event.target.checked } }))} /></label> : null}
                {needsSourceHpFraction(selectedSupportMetric) ? <label><span>来源角色当前生命比例（%）</span><input max={100} min={0} type="number" value={supportMetricContext.source?.currentHpFraction === undefined ? "" : supportMetricContext.source.currentHpFraction * 100} onChange={(event) => setSupportMetricContext((current) => ({ ...current, source: { currentHpFraction: parseOptionalPercent(event.target.value) } }))} /></label> : null}
                {selectedSupportMetric.scenarioParameters?.map((parameter) => {
                  const range = getScenarioParameterRange(parameter, targetBuild.constellation)
                  return (
                    <label key={parameter.id}>
                      <span>{parameter.label}</span>
                      <input
                        max={range.maximumValue}
                        min={range.minimumValue}
                        type="number"
                        value={supportMetricContext.actionParameters?.[parameter.id] ?? range.defaultValue}
                        onChange={(event) => setSupportMetricContext((current) => ({
                          ...current,
                          actionParameters: {
                            ...current.actionParameters,
                            [parameter.id]: numberValue(event.target.value, range.defaultValue)
                          }
                        }))}
                      />
                    </label>
                  )
                })}
              </div>
            ) : (
              <>
                <div className="scenarioControls">
                  <label><span>敌人等级</span><input max={200} min={1} type="number" value={enemy.level} onChange={(event) => { clearResults(); setEnemy((current) => ({ ...current, level: numberValue(event.target.value, 1) })) }} /></label>
                  <label><span>目标元素抗性（%）</span><input max={150} min={-100} type="number" value={enemy.resistance * 100} onChange={(event) => { clearResults(); setEnemy((current) => ({ ...current, resistance: numberValue(event.target.value) / 100 })) }} /></label>
                  <label><span>敌人数</span><input max={20} min={1} type="number" value={conditions.enemyCount} onChange={(event) => { clearResults(); setConditions((current) => ({ ...current, enemyCount: numberValue(event.target.value, 1) })) }} /></label>
                  {targetAction?.scenarioParameters?.map((parameter) => <label key={parameter.id}><span>{parameter.label}</span><input aria-label={`${parameter.label}数值`} max={parameter.maximumValue} min={parameter.minimumValue} type="number" value={conditions.actionParameters?.[parameter.id] ?? parameter.defaultValue} onChange={(event) => { clearResults(); setConditions((current) => ({ ...current, actionParameters: { ...current.actionParameters, [parameter.id]: numberValue(event.target.value, parameter.defaultValue) } })) }} /></label>)}
                </div>
                <div className="scenarioToggles">
                  {hasGeoResonance ? <label className="toggleRow"><span>角色处于护盾保护（双岩共鸣）</span><input checked={conditions.primaryShielded ?? false} type="checkbox" onChange={(event) => { clearResults(); setConditions((current) => ({ ...current, primaryShielded: event.target.checked })) }} /></label> : null}
                  {hasCryoResonance ? <label className="toggleRow"><span>目标处于冻结状态（双冰共鸣）</span><input checked={conditions.targetFrozen ?? false} type="checkbox" onChange={(event) => { clearResults(); setConditions((current) => ({ ...current, targetFrozen: event.target.checked })) }} /></label> : null}
                  {characterEffectOptions.map((effect) => <label className="toggleRow" key={effect.id}><span>{effect.label}</span><input checked={selectedCharacterEffectIds.includes(effect.id)} type="checkbox" onChange={() => toggleCharacterEffect(effect.id)} /></label>)}
                  {optionalEffectGroups.map(([group, effects]) => {
                    const label = effects[0]?.label.split("：")[0] ?? "可选效果"
                    return <label className="optionalEffectSelect" key={group}><span>{label}</span><select aria-label={label} value={effects.find((effect) => selectedCharacterEffectIds.includes(effect.id))?.id ?? ""} onChange={(event) => selectOptionalEffect(effects, event.target.value)}><option value="">不触发</option>{effects.map((effect) => <option key={effect.id} value={effect.id}>{effect.label.split("：").at(-1)}</option>)}</select></label>
                  })}
                  {catalog.buffPresets.map((preset) => <label className="toggleRow" key={preset.id}><span>{preset.label}</span><input checked={buffs.some((buff) => buff.sourceId === preset.id)} type="checkbox" onChange={() => toggleBuffPreset(preset.id)} /></label>)}
                </div>
                <p className="automaticEffectsNote">武器与圣遗物效果由系统按照当前角色、队伍和目标动作自动取可达到的最大值。</p>
              </>
            )}
            <button className="workspacePrimaryButton calculateButton" type="button" onClick={() => void runAnalysis()}>开始计算</button>
          </div>
        ) : null}
      </section>

      <section className="resultsSection calculationResults" id="results">
        <div className="resultsHeading"><div><span className="kicker">METRIC REPORT</span><h2>计算结果</h2></div><span className="targetBadge">{selectedSupportMetric?.label ?? targetAction?.label ?? "尚未选择指标"}</span></div>
        {supportMetricResponse ? <SupportMetricReport catalog={catalog} response={supportMetricResponse} /> : analysis && targetBuild ? <OrderedDamageReport analysis={analysis} build={targetBuild} catalog={catalog} onWeaponRefinementChange={changeWeaponComparisonRefinement} targetAction={targetAction} /> : <div className="emptyResult"><span>Σ</span><strong>等待计算</strong><p>选择队伍成员和指标后开始计算。</p></div>}
      </section>
    </main>
  )
}
