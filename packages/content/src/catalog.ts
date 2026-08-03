import type { ExternalBuff } from "@gscombat/contracts"

import {
  characterCatalogPresentation,
  type CatalogWeaponType,
  type CharacterCatalogPresentation
} from "./catalog-presentation.js"
import { listCombatActions, listCombatMetrics } from "./combat-registry.js"
import { listPublishedArtifactSets, listPublishedWeapons } from "./equipment-coverage-ledger.js"
import type {
  CombatActionIntegerScenarioParameter,
  CombatActionMetadata,
  CombatDamageMetricDefinition,
  CombatMetricDefinition,
  CombatMetricRecipientHpFractionRequirement,
  CombatMetricRecipientRequirement,
  CombatMetricSourceHpFractionRequirement,
  CombatTalentSlot
} from "./combat/types.js"

export interface CharacterCatalogEntry {
  readonly characterId: string
  readonly label: string
  readonly primaryActions: readonly CharacterPrimaryAction[]
  readonly primaryActionIds: readonly string[]
  /** Verified non-damage indicators calculated through the typed metric pipeline. */
  readonly supportMetrics: readonly CharacterSupportMetric[]
  readonly weaponType: WeaponType
}

export type WeaponType = CatalogWeaponType

/** A selectable, already-verified target action with its player-facing label. */
export interface CharacterPrimaryAction {
  readonly id: string
  readonly label: string
  /** Optional manual snapshot inputs that the selected action validates. */
  readonly scenarioParameters?: readonly CombatActionIntegerScenarioParameter[]
}

/** A selectable verified output that is intentionally not converted into damage. */
export interface CharacterSupportMetric {
  /** Recipient state that is only required after its source constellation is active. */
  readonly conditionalRecipientRequirements?: readonly CharacterSupportConditionalRecipientRequirement[]
  readonly id: string
  readonly kind: Exclude<CombatMetricDefinition["kind"], "damage">
  readonly label: string
  /** Optional action-owned inputs used by this metric's source action. */
  readonly scenarioParameters?: readonly CombatActionIntegerScenarioParameter[]
  /** Source HP-state conditions required by a source-owned healing modifier. */
  readonly sourceHpRequirements?: readonly CombatMetricSourceHpFractionRequirement[]
  readonly sourceActionId: string
  readonly target: CombatMetricDefinition["target"]
  /** Recipient conditions are exposed so the UI can request them explicitly rather than guessing. */
  readonly recipientRequirements?: readonly CombatMetricRecipientRequirement[]
  /** Explicit recipient state needed by a metric that routes its result from active recipient back to source. */
  readonly recipientTargetRouting?: "active_recipient_if_moonsign_else_self"
}

/** A recipient condition belonging to one constellation-gated support contribution. */
export interface CharacterSupportConditionalRecipientRequirement {
  readonly minimumSourceConstellation: number
  readonly requirement: CombatMetricRecipientHpFractionRequirement
}

export interface WeaponCatalogEntry {
  readonly label: string
  readonly rarity: 3 | 4 | 5
  readonly weaponId: string
  readonly weaponType: WeaponType
}

export interface ArtifactSetCatalogEntry {
  readonly label: string
  readonly setId: string
}

export interface BuffPresetCatalogEntry {
  readonly buffs: readonly ExternalBuff[]
  readonly id: string
  readonly label: string
}

const friendlyPrimaryActionLabels: Readonly<Record<string, string>> = {
  "raiden.burst.initial_slash": "奥义 · 梦想真说 / 初始一刀",
  "bennett.burst.initial_hit": "美妙旅程 / 施放伤害",
  "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit": "孤心沙龙 / 谢贝蕾妲小姐单次命中（荒性）",
  "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit": "神里流·镜花 / 四层浪闪瞬水剑首段（无反应）",
  "lohen.skill.bone_chilling_heart.single_hit": "镂骨彻心 / 单次命中（争胜100、无反应）",
  "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom": "流天射术 / C0 二段蓄力霜华矢 + 霜华绽发（无反应）",
  "amber.skill.explosive_puppet.baron_bunny.explosion": "爆弹玩偶 / 兔兔伯爵单次爆炸（无反应）",
  "eula.burst.glacial_illumination.lightfall_sword.explosion": "凝浪之光剑 / 光降之剑爆炸（手填层数）",
  "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum": "冲浪时光 / 满层鲨鲨撕咬（火底蒸发需火附着）",
  "neuvillette.normal.charged_attack.equitable_judgment.single_tick": "如水从平 / 衡平推裁单次命中",
  "yelan.skill.lingering_lifeline.explosion": "萦络纵命索 / 生命之线爆发",
  "yelan.burst.exquisite_throw.single_wave": "渊图玲珑骰 / 玄掷玲珑一轮三箭",
  "kinich.skill.scalespiker_cannon.single_hit": "悬猎·游骋高狩 / 迴猎贯鳞炮单次命中（满夜魂值，C0，无预设反应）",
  "emilie.burst.aromatic_explication.lumidouce_case.stage_three_attack.single_hit": "香氛演绎 / 柔灯之匣·三阶攻击单次命中（C0，无预设反应）",
  "albedo.skill.transient_blossom": "创生法·拟造阳华 / 刹那之花",
  "dehya.burst.flame_manes_fist": "炎啸狮子咬 / 单次炽鬃拳",
  "collei.skill.floral_sidewinder.outbound.spread": "拂花偈叶 / 去程单次命中 · 蔓激化",
  "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit": "所闻遍计 / 灭净三业单次触发（反应由场景决定）",
  "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread": "所闻遍计 / 灭净三业单次触发 · 蔓激化",
  "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread": "殊境·显象缚结 / 琢光镜投影攻击 · 蔓激化",
  "tighnari.normal.wreath_arrow.single_hit.spread": "藏蕴破障 / 藏蕴花矢单次命中 · 蔓激化",
  "xiangling.burst.pyronado.reverse_vaporize": "旋火轮 / 单次命中 · 水底蒸发",
  "xingqiu.skill.fatal_rainscreen": "画雨笼山 / 双段伤害",
  "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize": "画雨笼山 / 双段火底蒸发",
  "xingqiu.burst.raincutter.rain_sword.single_volley": "古华剑·裁雨留虹 / 一次雨帘剑齐射（手填数量）",
  "navia.skill.ceremonial_crystalshot": "典仪式晶火 / 实际命中玫瑰晶弹",
  "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe": "如同晴天般的霰落 / 初始范围伤害",
  "navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire": "如同晴天般的霰落 / 单次支援炮击",
  "ningguang.normal.charged_attack.with_star_jades": "普通攻击·千金掷 / 重击与当前星璇",
  "ningguang.burst.starshatter.full": "天权崩玉 / 全部命中宝石",
  "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final": "最恶鬼王·一斗轰临！！ / 荒泷乱舞连斩与最后一击",
  "noelle.burst.sweeping_time.normal_attack_combo": "大扫除 / C0 四段普通攻击",
  "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom":
    "越祓雷草之轮 / 越祓草轮单枚超绽放（已存在草原核）"
}

const genericActionPrefixes: Readonly<Record<CombatTalentSlot, string>> = {
  burst: "元素爆发",
  constellation: "命之座",
  normal: "普通攻击",
  passive: "固有天赋",
  plunge: "下落攻击",
  skill: "元素战技"
}

function isSelectablePrimaryAction(action: CombatActionMetadata, selectedDamageActionIds: ReadonlySet<string>): boolean {
  return action.kind === "damage" && action.status === "verified" && selectedDamageActionIds.has(action.id)
}

function getPrimaryActionLabel(action: CombatActionMetadata, metricLabel?: string): string {
  const friendlyLabel = friendlyPrimaryActionLabels[action.id]
  if (friendlyLabel) return friendlyLabel
  if (metricLabel) return metricLabel
  const hitLabel = action.damageParts && action.damageParts.length > 1 ? "已验证基础多段伤害" : "已验证基础单段伤害"
  return `${genericActionPrefixes[action.talentSlot]} / ${hitLabel}`
}

function cloneScenarioParameter(
  parameter: CombatActionIntegerScenarioParameter
): CombatActionIntegerScenarioParameter {
  return {
    ...parameter,
    ...(parameter.allowedValues ? { allowedValues: [...parameter.allowedValues] } : {}),
    ...(parameter.maximumValueByParameter
      ? {
          maximumValueByParameter: {
            ...parameter.maximumValueByParameter,
            values: parameter.maximumValueByParameter.values.map((value) => ({ ...value }))
          }
        }
      : {})
  }
}

function cloneRecipientRequirement(
  requirement: CombatMetricRecipientRequirement
): CombatMetricRecipientRequirement {
  return { ...requirement }
}

function cloneSourceHpRequirement(
  requirement: CombatMetricSourceHpFractionRequirement
): CombatMetricSourceHpFractionRequirement {
  return { ...requirement }
}

function cloneRecipientHpFractionRequirement(
  requirement: CombatMetricRecipientHpFractionRequirement
): CombatMetricRecipientHpFractionRequirement {
  return { ...requirement }
}

function createPrimaryAction(action: CombatActionMetadata, metricLabel?: string): CharacterPrimaryAction {
  return {
    id: action.id,
    label: getPrimaryActionLabel(action, metricLabel),
    ...(action.scenarioParameters?.length
      ? { scenarioParameters: action.scenarioParameters.map(cloneScenarioParameter) }
      : {})
  }
}

function createSupportMetric(
  metric: Exclude<CombatMetricDefinition, CombatDamageMetricDefinition>,
  actionById: ReadonlyMap<string, CombatActionMetadata>
): CharacterSupportMetric {
  const sourceAction = actionById.get(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Support metric ${metric.id} references missing action ${metric.sourceActionId}`)

  const recipientRequirements = metric.target === "friendly_recipient" ? metric.recipientRequirements : undefined
  const sourceHpRequirements =
    metric.kind === "healing"
      ? metric.sourceHealingBonuses?.flatMap((bonus) =>
          bonus.sourceRequirement === undefined ? [] : [cloneSourceHpRequirement(bonus.sourceRequirement)]
        )
      : undefined
  const recipientTargetRouting =
    metric.kind === "scalar" && metric.target === "friendly_recipient"
      ? metric.recipientTargetRouting
      : undefined
  const conditionalRecipientRequirements =
    metric.kind === "healing"
      ? metric.conditionalScalingBonuses?.map((bonus) => ({
          minimumSourceConstellation: bonus.minimumSourceConstellation,
          requirement: cloneRecipientHpFractionRequirement(bonus.recipientRequirement)
        }))
      : undefined
  return {
    ...(conditionalRecipientRequirements?.length ? { conditionalRecipientRequirements } : {}),
    id: metric.id,
    kind: metric.kind,
    label: metric.label,
    ...(sourceAction.scenarioParameters?.length
      ? { scenarioParameters: sourceAction.scenarioParameters.map(cloneScenarioParameter) }
      : {}),
    ...(sourceHpRequirements?.length ? { sourceHpRequirements } : {}),
    sourceActionId: metric.sourceActionId,
    target: metric.target,
    ...(recipientRequirements?.length
      ? { recipientRequirements: recipientRequirements.map(cloneRecipientRequirement) }
      : {}),
    ...(recipientTargetRouting === undefined ? {} : { recipientTargetRouting })
  }
}

interface SelectableDamageAction {
  readonly action: CombatActionMetadata
  readonly metric: CombatDamageMetricDefinition
}

function groupSelectableDamageActionsByCharacter(): ReadonlyMap<string, readonly SelectableDamageAction[]> {
  const actionsByCharacter = new Map<string, SelectableDamageAction[]>()
  const selectedDamageMetrics = listCombatMetrics().filter(
    (metric): metric is CombatDamageMetricDefinition => metric.kind === "damage" && metric.status === "verified"
  )
  const selectedDamageMetricsByActionId = new Map(selectedDamageMetrics.map((metric) => [metric.actionId, metric]))
  const selectedDamageActionIds = new Set(selectedDamageMetricsByActionId.keys())
  for (const action of listCombatActions().filter((candidate) => isSelectablePrimaryAction(candidate, selectedDamageActionIds))) {
    const metric = selectedDamageMetricsByActionId.get(action.id)
    if (!metric) continue
    const characterActions = actionsByCharacter.get(action.characterId)
    if (characterActions) {
      characterActions.push({ action, metric })
      continue
    }
    actionsByCharacter.set(action.characterId, [{ action, metric }])
  }
  return actionsByCharacter
}

function groupSelectableSupportMetricsByCharacter(): ReadonlyMap<string, readonly CharacterSupportMetric[]> {
  const metricsByCharacter = new Map<string, CharacterSupportMetric[]>()
  const actionById = new Map(listCombatActions().map((action) => [action.id, action]))
  const selectedSupportMetrics = listCombatMetrics().filter(
    (metric): metric is Exclude<CombatMetricDefinition, CombatDamageMetricDefinition> =>
      metric.kind !== "damage" && metric.status === "verified"
  )
  for (const metric of selectedSupportMetrics) {
    const characterMetrics = metricsByCharacter.get(metric.characterId)
    const catalogMetric = createSupportMetric(metric, actionById)
    if (characterMetrics) {
      characterMetrics.push(catalogMetric)
      continue
    }
    metricsByCharacter.set(metric.characterId, [catalogMetric])
  }
  return metricsByCharacter
}

function indexCharacterPresentation(): ReadonlyMap<string, CharacterCatalogPresentation> {
  const presentationByCharacter = new Map<string, CharacterCatalogPresentation>()
  for (const presentation of characterCatalogPresentation) {
    if (presentationByCharacter.has(presentation.characterId)) {
      throw new Error(`Duplicate character catalog presentation: ${presentation.characterId}`)
    }
    presentationByCharacter.set(presentation.characterId, presentation)
  }
  return presentationByCharacter
}

function createSupportedCharacters(): readonly CharacterCatalogEntry[] {
  const actionsByCharacter = groupSelectableDamageActionsByCharacter()
  const supportMetricsByCharacter = groupSelectableSupportMetricsByCharacter()
  const presentationByCharacter = indexCharacterPresentation()
  const selectableCharacterIds = new Set([...actionsByCharacter.keys(), ...supportMetricsByCharacter.keys()])
  const missingPresentation = [...selectableCharacterIds].filter((characterId) => !presentationByCharacter.has(characterId))
  if (missingPresentation.length > 0) {
    throw new Error(`Missing character catalog presentation: ${missingPresentation.join(", ")}`)
  }

  return characterCatalogPresentation.flatMap((presentation) => {
    const actions = actionsByCharacter.get(presentation.characterId)
    const supportMetrics = supportMetricsByCharacter.get(presentation.characterId) ?? []
    if (!actions && supportMetrics.length === 0) return []
    const primaryActions = actions?.map(({ action, metric }) => createPrimaryAction(action, metric.label)) ?? []
    return [
      {
        characterId: presentation.characterId,
        label: presentation.label,
        primaryActions,
        primaryActionIds: primaryActions.map((action) => action.id),
        supportMetrics,
        weaponType: presentation.weaponType
      }
    ]
  })
}

/**
 * Configurable characters projected from maintainer-selected verified outputs and browser-safe presentation metadata.
 * Damage actions and typed support indicators remain separate because only damage actions use a team damage scenario.
 */
export const supportedCharacters: readonly CharacterCatalogEntry[] = createSupportedCharacters()

/** The current user-facing equipment projection; full inventory and review state live in the coverage ledger. */
export const supportedWeapons: readonly WeaponCatalogEntry[] = listPublishedWeapons()

/** The current user-facing artifact projection; unreviewed or unsupported set effects remain hidden. */
export const supportedArtifactSets: readonly ArtifactSetCatalogEntry[] = listPublishedArtifactSets()

export const supportedBuffPresets: readonly BuffPresetCatalogEntry[] = [
  {
    buffs: [
      { label: "仙跳墙 · 攻击力", sourceId: "food.adeptus-temptation", stat: "attack_flat", value: 372 },
      { label: "仙跳墙 · 暴击率", sourceId: "food.adeptus-temptation", stat: "crit_rate", value: 0.12 }
    ],
    id: "food.adeptus-temptation",
    label: "美味的仙跳墙"
  }
]
