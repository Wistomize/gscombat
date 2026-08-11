import {
  evaluateRotation,
  isAmplifyingReaction,
  resolveRotationElementOverride,
  type DamageAction,
  type DamageScalingTerm,
  type DirectSpecialReactionDamageInput,
  type Element, type RotationDamageEvent, type RotationElementOverrideWindow,
  type RotationEventResult,
  type RotationResult,
  type RotationStats,
  type ScalingStat,
  type SpecialReactionBaseDamageTerm,
  type SpecialReactionDamageResult,
  type SustainedAuraWindow
} from "@gscombat/calculator"
import type {
  CombatActionMetadata,
  CombatDamageEventTemplate,
  CombatDamagePart,
  CombatDirectSpecialReactionConfig,
  MoonsignLevel
} from "@gscombat/content"
import { supportedCharacters, supportedWeapons } from "@gscombat/content"
import type { ArtifactStat, CharacterBuild, EnemyConfig, ExternalBuff } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBaseCombatStats } from "../core/base-stats.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount
} from "../core/build-variant.js"
import {
  EMPTY_COMBAT_ACTION_EFFECTS, listSelectedSourceAttackSnapshotEffectIds, listSelectedSourceDefenseSnapshotEffectIds, resolveFinalElementalMasteryToFlatAttack,
  resolveFinalHpToDamageBonus,
  resolveFinalHpToElementalMastery,
  resolveFinalHpToFlatAttack,
  resolveFinalHpToOwnElementDamageBonus,
  type AppliedCombatActionEffect,
  type ResolvedAdditionalDamageEvent,
  type ResolvedCombatActionEffects
} from "../effects/action-effects.js"
import { getBuffTotal, getDelta } from "./context.js"
import {
  resolveDeclaredActionCappedStatToAttackConversion,
  resolveDeclaredActionIntrinsicEffects, resolveDeclaredTalentCoefficientValue
} from "./declared-action.js"
import {
  resolveSourceFinalAttackByBuildId,
  resolveSourceFinalDefenseByBuildId,
  resolveSourceFinalElementalMasteryByBuildId,
  resolveSourceFinalHpByBuildId,
  resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId
} from "./source-stats.js"

export { getScenarioParameterMinimumSourceConstellation, resolveActionScenarioParameters } from "./scenario-parameters.js"

import type {
  DeclaredDamageTimeline,
  DeclaredDamageTimelineEvent,
  DeclaredDirectActionPartEvaluation,
  DeclaredDirectActionScalingTermEvaluation, ResolvedDeclaredScenarioStats,
  ResolvedStatContribution
} from "./types.js"

export type {
  DeclaredDirectActionPartEvaluation,
  DeclaredDirectActionScalingTermEvaluation,
  DeclaredDirectScenarioEvaluation,
  DeclaredDirectScenarioInput,
  DeclaredSpecialReactionScenarioEvaluation,
  DeclaredTransformativeScenarioEvaluation,
  ResolvedDeclaredScenarioStats,
  ResolvedStatContribution,
  ResolvedStatContributionStage
} from "./types.js"

const artifactDamageStatByElement: Readonly<Record<Element, ArtifactStat>> = {
  anemo: "anemo_damage_bonus",
  cryo: "cryo_damage_bonus",
  dendro: "dendro_damage_bonus",
  electro: "electro_damage_bonus",
  geo: "geo_damage_bonus",
  hydro: "hydro_damage_bonus",
  physical: "physical_damage_bonus",
  pyro: "pyro_damage_bonus"
}

const gameDataDamageStatByElement: Readonly<Record<Element, string>> = {
  anemo: "anemo_dmg_",
  cryo: "cryo_dmg_",
  dendro: "dendro_dmg_",
  electro: "electro_dmg_",
  geo: "geo_dmg_",
  hydro: "hydro_dmg_",
  physical: "physical_dmg_",
  pyro: "pyro_dmg_"
}

export { resolveScenarioSourceStatMaps } from "./source-stats.js"

export function getDamageTalentSlot(action: CombatActionMetadata): DamageAction["tags"]["talent"] {
  if (
    action.talentSlot === "normal" ||
    action.talentSlot === "plunge" ||
    action.talentSlot === "skill" ||
    action.talentSlot === "burst" ||
    action.talentSlot === "passive"
  ) {
    return action.talentSlot
  }
  throw new Error(`Declared direct action ${action.id} must belong to a damage-bearing talent category`)
}

export function assertDeclaredDirectAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
  readonly damageParts: NonNullable<CombatActionMetadata["damageParts"]>
} {
  if (action.status !== "verified") throw new Error(`Declared action ${action.id} is not verified`)
  if (action.evaluator !== "declared_direct") {
    throw new Error(`Declared action ${action.id} does not use the declared direct evaluator`)
  }
  if (action.kind !== "damage" || action.damageKind !== "direct") {
    throw new Error(`Declared action ${action.id} must be verified direct damage`)
  }
  if (action.amplifyingReaction && action.additiveReaction) {
    throw new Error(`Declared action ${action.id} cannot declare both amplifying and additive reactions`)
  }
  if (!action.damageParts || action.damageParts.length === 0) {
    throw new Error(`Declared action ${action.id} must contain at least one damage part`)
  }
  const hasMultipleScalingPart = action.damageParts.some(hasMultipleScalingTerms)
  if (hasMultipleScalingPart) {
    const hasLegacyScalingPart = action.damageParts.some((part) => !hasMultipleScalingTerms(part))
    if (hasLegacyScalingPart && !hasDeclaredMixedSpecialReactionEvents(action)) {
      throw new Error(`Declared multi-scaling action ${action.id} must not mix multi-scaling and legacy damage parts`)
    }
    if (hasLegacyScalingPart && !action.scalingStat) {
      throw new Error(`Declared mixed special-reaction action ${action.id} must declare a legacy scaling stat`)
    }
    if (!hasLegacyScalingPart && action.scalingStat) {
      throw new Error(`Declared multi-scaling action ${action.id} must not also declare a legacy scaling stat`)
    }
    return
  }
  if (!action.scalingStat) {
    throw new Error(`Declared action ${action.id} must declare a supported scaling stat`)
  }
}

export function assertDeclaredTransformativeAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
  readonly transformativeReaction: NonNullable<CombatActionMetadata["transformativeReaction"]>
} {
  if (action.status !== "verified") throw new Error(`Declared action ${action.id} is not verified`)
  if (action.evaluator !== "declared_transformative") {
    throw new Error(`Declared action ${action.id} does not use the declared transformative evaluator`)
  }
  if (action.kind !== "damage" || action.damageKind !== "transformative") {
    throw new Error(`Declared action ${action.id} must be verified transformative damage`)
  }
  if (!action.transformativeReaction) {
    throw new Error(`Declared transformative action ${action.id} must declare its reaction kind`)
  }
  if (action.additiveReaction || action.amplifyingReaction || action.damageParts || action.timeline) {
    throw new Error(`Declared transformative action ${action.id} must not declare direct-damage mechanics`)
  }
}

export function assertDeclaredSpecialReactionAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
  readonly damageParts: NonNullable<CombatActionMetadata["damageParts"]>
  readonly specialReaction: CombatDirectSpecialReactionConfig
} {
  if (action.status !== "verified") throw new Error(`Declared action ${action.id} is not verified`)
  if (action.evaluator !== "declared_special_reaction") {
    throw new Error(`Declared action ${action.id} does not use the declared special-reaction evaluator`)
  }
  if (action.kind !== "damage" || action.damageKind !== "special_reaction") {
    throw new Error(`Declared action ${action.id} must be verified special-reaction damage`)
  }
  if (!action.specialReaction) {
    throw new Error(`Declared special-reaction action ${action.id} must declare its reaction kind`)
  }
  if (action.amplifyingReaction || action.additiveReaction || action.transformativeReaction || action.timeline) {
    throw new Error(`Declared special-reaction action ${action.id} must not declare ordinary reaction mechanics`)
  }
  if (!action.damageParts || action.damageParts.length !== 1) {
    throw new Error(`Declared special-reaction action ${action.id} must contain exactly one damage part`)
  }
  const [part] = action.damageParts
  if (!part) throw new Error(`Declared special-reaction action ${action.id} is missing its damage part`)
  if (hasMultipleScalingTerms(part)) {
    if (action.scalingStat) {
      throw new Error(`Declared multi-scaling special-reaction action ${action.id} must not declare a legacy scaling stat`)
    }
  } else if (!action.scalingStat) {
    throw new Error(`Declared special-reaction action ${action.id} must declare a supported scaling stat`)
  }
  assertDeclaredSpecialReactionConfig(action.id, action.specialReaction, action.scenarioParameters)
}

/** Validates one explicitly declared Moon or Stellar formula configuration, whether action- or event-owned. */
export function assertDeclaredSpecialReactionConfig(
  actionId: string,
  config: CombatDirectSpecialReactionConfig,
  scenarioParameters: CombatActionMetadata["scenarioParameters"]
): void {
  const storedApplicationsParameterId = config.stellarStoredElementalApplicationsParameterId
  if (config.kind === "stellar_superconduct") {
    if (!storedApplicationsParameterId) {
      throw new Error(`Stellar-Superconduct action ${actionId} must declare its manual application snapshot parameter`)
    }
    if (!scenarioParameters?.some((parameter) => parameter.id === storedApplicationsParameterId)) {
      throw new Error(`Stellar-Superconduct action ${actionId} references an undeclared application snapshot parameter`)
    }
    return
  }
  if (storedApplicationsParameterId !== undefined) {
    throw new Error(`Moon-reaction action ${actionId} must not declare a Stellar-Superconduct application snapshot`)
  }
}

/** Validates that one mixed special-reaction event remains outside the ordinary aura and infusion pipeline. */
export function assertDeclaredMixedSpecialReactionEvent(
  action: CombatActionMetadata,
  event: CombatDamageEventTemplate
): void {
  const config = event.specialReaction
  if (!config) return
  if (event.elementalApplication || event.elementOverrideTarget) {
    throw new Error(`Special-reaction event ${event.id} for action ${action.id} cannot declare ordinary elemental mechanics`)
  }
  assertDeclaredSpecialReactionConfig(action.id, config, action.scenarioParameters)
}

/** Identifies a direct action that evaluates both ordinary and independent special-reaction damage events. */
export function hasDeclaredMixedSpecialReactionEvents(action: CombatActionMetadata): boolean {
  return action.timeline?.damageEvents.some((event) => event.specialReaction !== undefined) ?? false
}

export function isDeclaredSpecialReactionTimelineEvent(
  event: DeclaredDamageTimelineEvent
): event is DeclaredDamageTimelineEvent & { readonly specialReaction: CombatDirectSpecialReactionConfig } {
  return event.specialReaction !== undefined
}

export function resolveStats(
  build: CharacterBuild,
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  buffs: readonly ExternalBuff[],
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  actionParameters: ReadonlyMap<string, number>,
  actionEffects: ResolvedCombatActionEffects
): {
  readonly additionalDamageEventRotation: RotationStats
  /** Mastery stage used by a deferred elemental-mastery-to-attack equipment conversion. */
  readonly elementalMasteryForAttackConversion: number
  readonly rotation: RotationStats
  readonly scenario: ResolvedDeclaredScenarioStats
} {
  const base = resolveBaseCombatStats(build, gameData, action.element)
  const baseAttack = base.baseAttack + actionEffects.baseAttackFlat
  const attackPercent =
    base.attackPercent + getDelta(deltas, "atk_percent") + getBuffTotal(buffs, "attack_percent") + actionEffects.attackPercent
  const flatAttack = base.flatAttack + getDelta(deltas, "atk") + getBuffTotal(buffs, "attack_flat") + actionEffects.flatAttack
  const baseCritRate =
    base.critRate + getDelta(deltas, "crit_rate") + getBuffTotal(buffs, "crit_rate") + actionEffects.critRate
  const critDamage =
    base.critDamage + getDelta(deltas, "crit_damage") + getBuffTotal(buffs, "crit_damage") + actionEffects.critDamage
  const energyRecharge =
    base.energyRecharge + getDelta(deltas, "energy_recharge") + getBuffTotal(buffs, "energy_recharge") + actionEffects.energyRecharge
  const defensePercent =
    base.defensePercent +
    getDelta(deltas, "def_percent") +
    getBuffTotal(buffs, "defense_percent") +
    actionEffects.defensePercent
  const flatDefense = base.flatDefense + getDelta(deltas, "def") + getBuffTotal(buffs, "defense_flat") + actionEffects.defenseFlat
  const hpPercent = base.hpPercent + getDelta(deltas, "hp_percent") + getBuffTotal(buffs, "hp_percent") + actionEffects.hpPercent
  const flatHp = base.flatHp + getDelta(deltas, "hp") + getBuffTotal(buffs, "hp_flat") + actionEffects.hpFlat
  // Preserve the established arithmetic order for final-stat-derived effects. The normalized fields above are
  // presentation data, while this path must remain bit-for-bit compatible with existing final-HP/DEF conversions.
  const defense =
    base.defense +
    base.baseDefense * (getDelta(deltas, "def_percent") + getBuffTotal(buffs, "defense_percent") + actionEffects.defensePercent) +
    getDelta(deltas, "def") +
    getBuffTotal(buffs, "defense_flat") +
    actionEffects.defenseFlat
  const hp =
    base.hp +
    base.baseHp * (getDelta(deltas, "hp_percent") + getBuffTotal(buffs, "hp_percent") + actionEffects.hpPercent) +
    getDelta(deltas, "hp") +
    getBuffTotal(buffs, "hp_flat") +
    actionEffects.hpFlat
  const finalHpSourcedFlatAttack = resolveFinalHpToFlatAttack(hp, actionEffects)
  const finalHpSourcedElementalMastery = resolveFinalHpToElementalMastery(hp, actionEffects)
  const finalHpSourcedDamageBonus = resolveFinalHpToDamageBonus(hp, actionEffects)
  const finalHpSourcedOwnElementDamageBonus = resolveFinalHpToOwnElementDamageBonus(hp, actionEffects)
  const characterBaseElementalMastery = gameData.getCharacterBaseStats(build.characterId).eleMas ?? 0
  const preIntrinsicElementalMastery =
    base.elementalMastery +
    getDelta(deltas, "elemental_mastery") +
    getBuffTotal(buffs, "elemental_mastery") +
    actionEffects.elementalMastery +
    finalHpSourcedElementalMastery
  const preliminaryAttack = baseAttack * (1 + attackPercent) + flatAttack + finalHpSourcedFlatAttack
  const preliminaryIntrinsicEffects = resolveDeclaredActionIntrinsicEffects(
    action,
    build,
    gameData,
    { attack: preliminaryAttack, defense, elementalMastery: preIntrinsicElementalMastery, hp },
    actionParameters
  )
  const cappedStatToAttackConversion = resolveDeclaredActionCappedStatToAttackConversion(
    action,
    build,
    gameData,
    {
      baseAttack,
      defense,
      elementalMastery: preliminaryIntrinsicEffects.elementalMastery,
      hp
    }
  )
  const finalElementalMasterySourcedFlatAttack = resolveFinalElementalMasteryToFlatAttack(
    preliminaryIntrinsicEffects.elementalMastery,
    actionEffects
  )
  const effectiveFlatAttack =
    flatAttack + finalHpSourcedFlatAttack + cappedStatToAttackConversion + finalElementalMasterySourcedFlatAttack
  const attack = baseAttack * (1 + attackPercent) + effectiveFlatAttack
  const intrinsicEffects = resolveDeclaredActionIntrinsicEffects(
    action,
    build,
    gameData,
    { attack, defense, elementalMastery: preIntrinsicElementalMastery, hp },
    actionParameters
  )
  const elementalMastery = intrinsicEffects.elementalMastery
  const flatElementalMastery = elementalMastery - characterBaseElementalMastery
  const critRate = baseCritRate + intrinsicEffects.critRate
  const baseDamageBonusByElement = resolveDamageBonusByElement(build, gameData, deltas, action.element, base.damageBonus)
  const primaryElement = resolveBuildElement(build, gameData)
  const damageBonusByElement =
    primaryElement === null
      ? baseDamageBonusByElement
      : {
          ...baseDamageBonusByElement,
          [primaryElement]: (baseDamageBonusByElement[primaryElement] ?? 0) + finalHpSourcedOwnElementDamageBonus
        }
  const actionIndependentDamageBonus =
    getBuffTotal(buffs, "damage_bonus") + actionEffects.damageBonus + finalHpSourcedDamageBonus
  const universalDamageBonus = actionIndependentDamageBonus + intrinsicEffects.damageBonus
  const damageBonus = damageBonusByElement[action.element] + universalDamageBonus
  const statContributions = resolveStatContributions({
    action,
    actionEffects,
    attackPercent,
    baseElementalMastery: characterBaseElementalMastery,
    buffs,
    build,
    critDamage,
    critRate,
    damageBonus,
    defensePercent,
    deltas,
    effectiveHp: hp,
    effectiveFlatAttack,
    elementalMastery,
    flatDefense,
    flatHp,
    gameData,
    intrinsicDamageBonusContributions: intrinsicEffects.contributions.filter(
      (contribution) => contribution.target === "damageBonus"
    ),
    intrinsicCritRateContributions: intrinsicEffects.contributions.filter(
      (contribution) => contribution.target === "critRate"
    ),
    intrinsicElementalMasteryContributions: intrinsicEffects.contributions.filter(
      (contribution) => contribution.target === "elementalMastery"
    ),
    hpPercent
  })
  const rotation: RotationStats = {
    attack,
    critDamage,
    critRate,
    damageBonus: universalDamageBonus,
    damageBonusByElement,
    defense,
    elementalMastery,
    hp,
    level: build.level
  }
  return {
    additionalDamageEventRotation: { ...rotation, damageBonus: actionIndependentDamageBonus },
    elementalMasteryForAttackConversion: preliminaryIntrinsicEffects.elementalMastery,
    rotation,
    scenario: {
      attackPercent,
      baseAttack,
      baseDefense: base.baseDefense,
      baseElementalMastery: characterBaseElementalMastery,
      baseHp: base.baseHp,
      critDamage,
      critRate,
      damageBonus,
      defensePercent,
      effectiveAttack: attack,
      effectiveDefense: defense,
      effectiveHp: hp,
      elementalMastery,
      energyRecharge,
      flatAttack: effectiveFlatAttack,
      flatElementalMastery,
      flatDefense,
      flatHp,
      hpPercent,
      resistanceReduction:
        actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      statContributions,
      talentMultiplier: null
    }
  }
}

interface ResolveStatContributionsInput {
  readonly action: CombatActionMetadata
  readonly actionEffects: ResolvedCombatActionEffects
  readonly attackPercent: number
  readonly baseElementalMastery: number
  readonly buffs: readonly ExternalBuff[]
  readonly build: CharacterBuild
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  readonly defensePercent: number
  readonly deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined
  readonly effectiveFlatAttack: number
  readonly effectiveHp: number
  readonly elementalMastery: number
  readonly flatDefense: number
  readonly flatHp: number
  readonly gameData: GameDataRepository
  readonly intrinsicDamageBonusContributions: readonly { readonly label: string; readonly value: number }[]
  readonly intrinsicCritRateContributions: readonly { readonly label: string; readonly value: number }[]
  readonly intrinsicElementalMasteryContributions: readonly { readonly label: string; readonly value: number }[]
  readonly hpPercent: number
}

const artifactSlotLabels: Readonly<Record<CharacterBuild["artifacts"][number]["slot"], string>> = {
  circlet: "理之冠",
  flower: "生之花",
  goblet: "空之杯",
  plume: "死之羽",
  sands: "时之沙"
}

const elementLabels: Readonly<Record<Element, string>> = {
  anemo: "风元素",
  cryo: "冰元素",
  dendro: "草元素",
  electro: "雷元素",
  geo: "岩元素",
  hydro: "水元素",
  physical: "物理",
  pyro: "火元素"
}

export function resolveStatContributions(input: ResolveStatContributionsInput): readonly ResolvedStatContribution[] {
  const { action, actionEffects, buffs, build, deltas, gameData } = input
  const contributions: ResolvedStatContribution[] = []
  const add = (stage: ResolvedStatContribution["stage"], label: string, value: number) => {
    if (Math.abs(value) >= 0.000001) contributions.push({ label, stage, value })
  }
  add(
    "baseAttack",
    `角色基础攻击 · ${supportedCharacters.find((character) => character.characterId === build.characterId)?.label ?? build.characterId}`,
    gameData.getCharacterStat(build.characterId, "atk", build.level, build.ascension) ?? 0
  )
  add(
    "baseAttack",
    `武器基础攻击 · ${supportedWeapons.find((weapon) => weapon.weaponId === build.weapon.weaponId)?.label ?? build.weapon.weaponId}`,
    gameData.getWeaponStat(build.weapon.weaponId, "atk", build.weapon.level, build.weapon.ascension) ?? 0
  )
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "baseAttackFlat")) {
    add("baseAttack", effect.label, effect.value)
  }
  addArtifactStatContributions(contributions, build, "atk_percent", "attackPercent", "攻击力%")
  add("attackPercent", "角色突破属性 · 攻击力%", gameData.getCharacterAscensionBonus(build.characterId, "atk_", build.ascension) ?? 0)
  add("attackPercent", "武器副属性 · 攻击力%", gameData.getWeaponStat(build.weapon.weaponId, "atk_", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "attack_percent")) add("attackPercent", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "attackPercent")) {
    add("attackPercent", effect.label, effect.value)
  }
  add("attackPercent", "边际模拟 · 攻击力%", getDelta(deltas, "atk_percent"))

  addArtifactStatContributions(contributions, build, "atk", "flatAttack", "固定攻击力")
  for (const buff of buffs.filter((candidate) => candidate.stat === "attack_flat")) add("flatAttack", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "flatAttack")) {
    add("flatAttack", effect.label, effect.value)
  }
  add("flatAttack", "边际模拟 · 固定攻击力", getDelta(deltas, "atk"))
  addResidualContribution(contributions, "flatAttack", "其他派生固定攻击力", input.effectiveFlatAttack)

  add(
    "baseHp",
    `角色基础生命值 · ${supportedCharacters.find((character) => character.characterId === build.characterId)?.label ?? build.characterId}`,
    gameData.getCharacterStat(build.characterId, "hp", build.level, build.ascension) ?? 0
  )
  addArtifactStatContributions(contributions, build, "hp_percent", "hpPercent", "生命值%")
  add("hpPercent", "角色突破属性 · 生命值%", gameData.getCharacterAscensionBonus(build.characterId, "hp_", build.ascension) ?? 0)
  add("hpPercent", "武器副属性 · 生命值%", gameData.getWeaponStat(build.weapon.weaponId, "hp_", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "hp_percent")) add("hpPercent", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "hpPercent")) {
    add("hpPercent", effect.label, effect.value)
  }
  add("hpPercent", "边际模拟 · 生命值%", getDelta(deltas, "hp_percent"))
  addResidualContribution(contributions, "hpPercent", "其他生命值%", input.hpPercent)

  addArtifactStatContributions(contributions, build, "hp", "flatHp", "固定生命值")
  for (const buff of buffs.filter((candidate) => candidate.stat === "hp_flat")) add("flatHp", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "hpFlat")) {
    add("flatHp", effect.label, effect.value)
  }
  add("flatHp", "边际模拟 · 固定生命值", getDelta(deltas, "hp"))
  addResidualContribution(contributions, "flatHp", "其他固定生命值", input.flatHp)

  add(
    "baseDefense",
    `角色基础防御力 · ${supportedCharacters.find((character) => character.characterId === build.characterId)?.label ?? build.characterId}`,
    gameData.getCharacterStat(build.characterId, "def", build.level, build.ascension) ?? 0
  )
  addArtifactStatContributions(contributions, build, "def_percent", "defensePercent", "防御力%")
  add("defensePercent", "角色突破属性 · 防御力%", gameData.getCharacterAscensionBonus(build.characterId, "def_", build.ascension) ?? 0)
  add("defensePercent", "武器副属性 · 防御力%", gameData.getWeaponStat(build.weapon.weaponId, "def_", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "defense_percent")) {
    add("defensePercent", buff.label, buff.value)
  }
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "defensePercent")) {
    add("defensePercent", effect.label, effect.value)
  }
  add("defensePercent", "边际模拟 · 防御力%", getDelta(deltas, "def_percent"))
  addResidualContribution(contributions, "defensePercent", "其他防御力%", input.defensePercent)

  addArtifactStatContributions(contributions, build, "def", "flatDefense", "固定防御力")
  for (const buff of buffs.filter((candidate) => candidate.stat === "defense_flat")) {
    add("flatDefense", buff.label, buff.value)
  }
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "defenseFlat")) {
    add("flatDefense", effect.label, effect.value)
  }
  add("flatDefense", "边际模拟 · 固定防御力", getDelta(deltas, "def"))
  addResidualContribution(contributions, "flatDefense", "其他固定防御力", input.flatDefense)

  add("critRate", "角色基础暴击率", 0.05)
  addArtifactStatContributions(contributions, build, "crit_rate", "critRate", "暴击率")
  add("critRate", "角色突破属性 · 暴击率", gameData.getCharacterAscensionBonus(build.characterId, "critRate_", build.ascension) ?? 0)
  add("critRate", "武器副属性 · 暴击率", gameData.getWeaponStat(build.weapon.weaponId, "critRate_", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "crit_rate")) add("critRate", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "critRate")) {
    add("critRate", effect.label, effect.value)
  }
  for (const contribution of input.intrinsicCritRateContributions) {
    add("critRate", contribution.label, contribution.value)
  }
  add("critRate", "边际模拟 · 暴击率", getDelta(deltas, "crit_rate"))
  addResidualContribution(contributions, "critRate", "其他暴击率", input.critRate)

  add("critDamage", "角色基础暴击伤害", 0.5)
  addArtifactStatContributions(contributions, build, "crit_damage", "critDamage", "暴击伤害")
  add("critDamage", "角色突破属性 · 暴击伤害", gameData.getCharacterAscensionBonus(build.characterId, "critDMG_", build.ascension) ?? 0)
  add("critDamage", "武器副属性 · 暴击伤害", gameData.getWeaponStat(build.weapon.weaponId, "critDMG_", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "crit_damage")) add("critDamage", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "critDamage")) {
    add("critDamage", effect.label, effect.value)
  }
  add("critDamage", "边际模拟 · 暴击伤害", getDelta(deltas, "crit_damage"))
  addResidualContribution(contributions, "critDamage", "其他暴击伤害", input.critDamage)

  add("baseElementalMastery", "角色基础元素精通", input.baseElementalMastery)
  addArtifactStatContributions(contributions, build, "elemental_mastery", "elementalMastery", "元素精通")
  add("elementalMastery", "角色突破属性 · 元素精通", gameData.getCharacterAscensionBonus(build.characterId, "eleMas", build.ascension) ?? 0)
  add("elementalMastery", "武器副属性 · 元素精通", gameData.getWeaponStat(build.weapon.weaponId, "eleMas", build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "elemental_mastery")) {
    add("elementalMastery", buff.label, buff.value)
  }
  for (const effect of actionEffects.appliedEffects) {
    if (effect.target === "elementalMastery") add("elementalMastery", effect.label, effect.value)
    if (effect.target === "finalHpToElementalMastery") {
      add("elementalMastery", `${effect.label} · 最终生命值转元素精通`, effect.value * input.effectiveHp)
    }
  }
  for (const contribution of input.intrinsicElementalMasteryContributions) {
    add("elementalMastery", contribution.label, contribution.value)
  }
  add("elementalMastery", "边际模拟 · 元素精通", getDelta(deltas, "elemental_mastery"))
  addResidualContribution(contributions, "elementalMastery", "其他元素精通", input.elementalMastery)

  const artifactDamageStat = artifactDamageStatByElement[action.element]
  addArtifactStatContributions(contributions, build, artifactDamageStat, "damageBonus", `${elementLabels[action.element]}伤害加成`)
  const gameDataDamageStat = gameDataDamageStatByElement[action.element]
  add("damageBonus", "角色突破属性 · 元素伤害", gameData.getCharacterAscensionBonus(build.characterId, gameDataDamageStat, build.ascension) ?? 0)
  add("damageBonus", "武器副属性 · 元素伤害", gameData.getWeaponStat(build.weapon.weaponId, gameDataDamageStat, build.weapon.level, build.weapon.ascension) ?? 0)
  for (const buff of buffs.filter((candidate) => candidate.stat === "damage_bonus")) add("damageBonus", buff.label, buff.value)
  for (const effect of actionEffects.appliedEffects.filter((candidate) => candidate.target === "damageBonus")) {
    add("damageBonus", effect.label, effect.value)
  }
  for (const contribution of input.intrinsicDamageBonusContributions) {
    add("damageBonus", contribution.label, contribution.value)
  }
  add("damageBonus", "边际模拟 · 元素伤害", getDelta(deltas, artifactDamageStat))
  addResidualContribution(contributions, "damageBonus", "其他派生增伤", input.damageBonus)
  addResidualContribution(contributions, "attackPercent", "其他攻击力%", input.attackPercent)
  return contributions
}

export function addArtifactStatContributions(
  contributions: ResolvedStatContribution[],
  build: CharacterBuild,
  stat: ArtifactStat,
  stage: ResolvedStatContribution["stage"],
  statLabel: string
): void {
  for (const artifact of build.artifacts) {
    if (artifact.mainStat.stat === stat && artifact.mainStat.value !== 0) {
      contributions.push({ label: `${artifactSlotLabels[artifact.slot]}主词条 · ${statLabel}`, stage, value: artifact.mainStat.value })
    }
    for (const substat of artifact.substats) {
      if (substat.stat === stat && substat.value !== 0) {
        contributions.push({ label: `${artifactSlotLabels[artifact.slot]}副词条 · ${statLabel}`, stage, value: substat.value })
      }
    }
  }
}

export function addResidualContribution(
  contributions: ResolvedStatContribution[],
  stage: ResolvedStatContribution["stage"],
  label: string,
  expectedTotal: number
): void {
  const recorded = contributions.reduce(
    (total, contribution) => total + (contribution.stage === stage ? contribution.value : 0),
    0
  )
  const residual = expectedTotal - recorded
  if (Math.abs(residual) >= 0.000001) contributions.push({ label, stage, value: residual })
}

export function resolveSpecialReactionBaseDamage(
  action: CombatActionMetadata,
  part: DeclaredDirectActionPartEvaluation,
  stats: RotationStats,
  coefficientMultiplier = 1
): number {
  return resolveSpecialReactionBaseDamageTerms(action, part, stats, coefficientMultiplier).reduce(
    (total, term) => total + term.coefficient * term.value,
    0
  )
}

/** Resolves one special-reaction event's stat-specific base-damage terms for its formula trace. */
export function resolveSpecialReactionBaseDamageTerms(
  action: CombatActionMetadata,
  part: DeclaredDirectActionPartEvaluation,
  stats: RotationStats,
  coefficientMultiplier = 1
): readonly SpecialReactionBaseDamageTerm[] {
  if (hasResolvedMultipleScalingTerms(part)) {
    return part.terms.map((term) => ({
      coefficient: term.coefficient * coefficientMultiplier,
      stat: term.stat,
      value: resolveSpecialReactionScalingValue(stats, term.stat)
    }))
  }
  const scalingStat = requireLegacyScalingStat(action.id, action.scalingStat)
  return [
    {
      coefficient: (part.coefficient ?? 0) * coefficientMultiplier,
      stat: scalingStat,
      value: resolveSpecialReactionScalingValue(stats, scalingStat)
    }
  ]
}

/** Combines resolved shared stats with the one selected event's actual base scaling declaration. */
export function createDeclaredScenarioStats(
  action: CombatActionMetadata,
  actionParameters: ReadonlyMap<string, number>,
  stats: ResolvedDeclaredScenarioStats,
  multiScalingPart:
    | (DeclaredDirectActionPartEvaluation & {
        readonly terms: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]]
      })
    | undefined,
  talentMultiplier: number | null
): ResolvedDeclaredScenarioStats {
  return {
    ...stats,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(actionParameters) }
      : {}),
    ...(multiScalingPart ? { scalingTerms: multiScalingPart.terms } : {}),
    talentMultiplier
  }
}

export function resolveSpecialReactionScalingValue(stats: RotationStats, stat: ScalingStat): number {
  if (stat === "attack") return stats.attack
  if (stat === "defense") return stats.defense
  if (stat === "elementalMastery") return stats.elementalMastery
  return stats.hp
}

export function resolveDeclaredScenarioSpecialReactionScalingValue(
  stats: ResolvedDeclaredScenarioStats,
  stat: ScalingStat
): number {
  if (stat === "attack") return stats.effectiveAttack
  if (stat === "defense") return stats.effectiveDefense
  if (stat === "elementalMastery") return stats.elementalMastery
  return stats.effectiveHp
}

export function resolveDirectSpecialReactionInput(
  config: CombatDirectSpecialReactionConfig,
  baseDamage: number,
  baseDamageTerms: readonly SpecialReactionBaseDamageTerm[],
  stats: ResolvedDeclaredScenarioStats,
  actionEffects: Pick<
    ResolvedCombatActionEffects,
    | "appliedEffects"
    | "specialReactionBaseDamageBonus"
    | "specialReactionBaseDamageFlat"
    | "specialReactionDamageBonus"
    | "specialReactionElevation"
    | "specialReactionFlatDamageAddition"
  >,
  externalReactionDamageBonus: number,
  enemyResistance: number,
  resistanceReduction: number,
  actionParameters: ReadonlyMap<string, number>
): DirectSpecialReactionDamageInput {
  const baseDamageEffectTerms = actionEffects.appliedEffects
    .filter((effect) => effect.target === "specialReactionBaseDamageFlat")
    .map((effect) => {
      const stat = effect.scalingStat ?? "elementalMastery"
      const value = effect.scalingStatValue ?? resolveDeclaredScenarioSpecialReactionScalingValue(stats, stat)
      return {
        coefficient: value === 0 ? 1 : effect.value / value,
        label: effect.label,
        stat,
        value: value === 0 ? effect.value : value
      }
    })
  const resolvedBaseDamageTerms = [...baseDamageTerms, ...baseDamageEffectTerms]
  const common = {
    ascensionBonus: (config.ascensionBonus ?? 0) + actionEffects.specialReactionElevation,
    baseDamage: baseDamage + actionEffects.specialReactionBaseDamageFlat,
    baseDamageTerms: resolvedBaseDamageTerms,
    baseDamageBonus: (config.baseDamageBonus ?? 0) + actionEffects.specialReactionBaseDamageBonus,
    critDamage: stats.critDamage,
    critRate: stats.critRate,
    elementalMastery: stats.elementalMastery,
    enemyResistance,
    ...(config.flatDamageAddition === undefined && actionEffects.specialReactionFlatDamageAddition === 0
      ? {}
      : { flatDamageAddition: (config.flatDamageAddition ?? 0) + actionEffects.specialReactionFlatDamageAddition }),
    reactionDamageBonus:
      (config.reactionDamageBonus ?? 0) +
      actionEffects.specialReactionDamageBonus +
      externalReactionDamageBonus,
    resistanceReduction
  }
  if (config.kind !== "stellar_superconduct") return { ...common, kind: config.kind }

  const parameterId = config.stellarStoredElementalApplicationsParameterId
  if (!parameterId) throw new Error("Stellar-Superconduct action is missing its manual application snapshot parameter")
  const storedElementalApplications = actionParameters.get(parameterId)
  if (storedElementalApplications === undefined) {
    throw new Error(`Stellar-Superconduct action is missing selected parameter ${parameterId}`)
  }
  return { ...common, kind: config.kind, storedElementalApplications }
}

export function isSpecialReactionStatEffect(effect: AppliedCombatActionEffect): boolean {
  return (
    effect.target === "attackPercent" ||
    effect.target === "flatAttack" ||
    effect.target === "critDamage" ||
    effect.target === "critRate" ||
    effect.target === "defenseFlat" ||
    effect.target === "defensePercent" ||
    effect.target === "elementalMastery" ||
    effect.target === "specialReactionBaseDamageFlat" ||
    effect.target === "specialReactionBaseDamageBonus" ||
    effect.target === "specialReactionDamageBonus" ||
    effect.target === "specialReactionFlatDamageAddition" ||
    effect.target === "specialReactionElevation" ||
    effect.target === "enemyResistanceReduction" ||
    effect.target === "energyRecharge" ||
    effect.target === "hpFlat" ||
    effect.target === "hpPercent" ||
    effect.target === "finalHpToFlatAttack" ||
    effect.target === "finalHpToElementalMastery" ||
    effect.target === "finalElementalMasteryToFlatAttack"
  )
}

export function createDirectSpecialReactionRotation(
  action: CombatActionMetadata,
  ownerId: string,
  result: SpecialReactionDamageResult,
  appliedEffects: readonly AppliedCombatActionEffect[]
): RotationResult {
  const event: RotationEventResult = {
    appliedEffectIds: appliedEffects.map((effect) => effect.id),
    critDamage: result.critDamage,
    element: action.element,
    expectedDamage: result.expectedDamage,
    hitCount: 1,
    id: `${action.id}.single-special-reaction`,
    nonCritDamage: result.nonCritDamage,
    ownerId,
    statSnapshotTime: 0,
    time: 0,
    trace: result.trace.map((entry) => ({
      after: entry.after,
      before: entry.before,
      formula: entry.formula,
      kind: "special_reaction" as const,
      stage: entry.stage
    }))
  }
  return { dpr: result.expectedDamage, dps: result.expectedDamage, duration: 1, events: [event] }
}

/** Projects one special-reaction event result into the shared rotation-event response shape. */
export function createDeclaredSpecialReactionRotationEvent(
  action: CombatActionMetadata,
  ownerId: string,
  event: DeclaredDamageTimelineEvent & { readonly specialReaction: CombatDirectSpecialReactionConfig },
  result: SpecialReactionDamageResult,
  appliedEffects: readonly AppliedCombatActionEffect[]
): RotationEventResult {
  const expectedDamage = result.expectedDamage * event.hitCount
  return {
    appliedEffectIds: appliedEffects.map((effect) => effect.id),
    critDamage: result.critDamage * event.hitCount,
    element: action.element,
    expectedDamage,
    hitCount: event.hitCount,
    id: `${action.id}.${event.id}`,
    nonCritDamage: result.nonCritDamage * event.hitCount,
    ownerId,
    statSnapshotTime: event.statSnapshotTime,
    time: event.time,
    trace: [
      ...result.trace.map((entry) => ({
        after: entry.after,
        before: entry.before,
        formula: entry.formula,
        kind: "special_reaction" as const,
        stage: entry.stage
      })),
      ...(event.hitCount === 1
        ? []
        : [{ after: expectedDamage, before: result.expectedDamage, hitCount: event.hitCount, kind: "hit_count" as const }])
    ]
  }
}

/** Keeps a mixed action's shared applied-effects ledger compact while retaining distinct resolved values. */
export function deduplicateAppliedEffects(
  effects: readonly AppliedCombatActionEffect[]
): readonly AppliedCombatActionEffect[] {
  const uniqueEffects = new Map<string, AppliedCombatActionEffect>()
  for (const effect of effects) {
    const key = [effect.id, effect.sourceId, effect.target, effect.value].join("\u0000")
    if (!uniqueEffects.has(key)) uniqueEffects.set(key, effect)
  }
  return [...uniqueEffects.values()]
}

export function resolveDamageBonusByElement(
  build: CharacterBuild,
  gameData: GameDataRepository,
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  actionElement: Element,
  actionElementBaseBonus: number
): Readonly<Record<Element, number>> {
  const resolveElementBonus = (element: Element): number => {
    const baseDamageBonus =
      element === actionElement ? actionElementBaseBonus : resolveBaseCombatStats(build, gameData, element).damageBonus
    return baseDamageBonus + getDelta(deltas, artifactDamageStatByElement[element])
  }
  return {
    anemo: resolveElementBonus("anemo"),
    cryo: resolveElementBonus("cryo"),
    dendro: resolveElementBonus("dendro"),
    electro: resolveElementBonus("electro"),
    geo: resolveElementBonus("geo"),
    hydro: resolveElementBonus("hydro"),
    physical: resolveElementBonus("physical"),
    pyro: resolveElementBonus("pyro")
  }
}

/**
 * Evaluates a verified direct-action declaration using base character, weapon, artifact, and selected team buffs.
 *
 * This bridge supports attack, health, defense, and elemental-mastery direct damage with explicitly declared
 * amplifying or additive reactions.
 * Maintained typed equipment effects and explicit current-action snapshots are resolved before this bridge; broader
 * kit timing and rotation states remain action-specific.
 */
export function resolveScenarioActionEffectContext(input: {
  readonly action: CombatActionMetadata
  readonly activeEffectIds: readonly string[]
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  readonly artifactStatDeltas?: Partial<Readonly<Record<ArtifactStat, number>>>
  readonly build: CharacterBuild
  readonly buffs: readonly ExternalBuff[]
  readonly enemyCount: number
  readonly gameData: GameDataRepository
  readonly moonsignLevel: MoonsignLevel
  readonly resolvedActionParameters: ReadonlyMap<string, number>
  readonly teammates: readonly CharacterBuild[]
}) {
  const primaryElement = resolveBuildElement(input.build, input.gameData)
  const teamUniqueElementCount = resolveTeamUniqueElementCount([input.build, ...input.teammates], input.gameData)
  const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
    input.build,
    input.teammates,
    input.gameData
  )
  const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
    input.build,
    input.teammates,
    input.gameData
  )
  const resolvedActiveEffectIds = [
    ...new Set([
      ...input.activeEffectIds,
      ...listSelectedSourceDefenseSnapshotEffectIds({
        activeEffectIds: input.activeEffectIds,
        ...(input.activeEffectSourceBuildIds === undefined
          ? {}
          : { activeEffectSourceBuildIds: input.activeEffectSourceBuildIds }),
        primary: input.build,
        sourceBuild: input.build,
        teammates: input.teammates
      }),
      ...listSelectedSourceAttackSnapshotEffectIds({
        activeEffectIds: input.activeEffectIds,
        ...(input.activeEffectSourceBuildIds === undefined
          ? {}
          : { activeEffectSourceBuildIds: input.activeEffectSourceBuildIds }),
        primary: input.build,
        sourceBuild: input.build,
        teammates: input.teammates
      })
    ])
  ]
  const sourceSelfMaximumEquipmentEffectsByBuildId = resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId(
    input.build,
    input.teammates,
    input.action,
    input.gameData,
    input.enemyCount,
    resolvedActiveEffectIds,
    input.activeEffectSourceBuildIds
  )
  const sourceFinalHpByBuildId = resolveSourceFinalHpByBuildId(
    input.build,
    input.teammates,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.enemyCount,
    sourceSelfMaximumEquipmentEffectsByBuildId
  )
  const sourceFinalElementalMasteryByBuildId = resolveSourceFinalElementalMasteryByBuildId(
    input.build,
    input.teammates,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.enemyCount,
    sourceFinalHpByBuildId,
    sourceSelfMaximumEquipmentEffectsByBuildId
  )
  const sourceFinalDefenseByBuildId = resolveSourceFinalDefenseByBuildId(
    input.build,
    input.teammates,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.enemyCount,
    input.activeEffectIds,
    input.activeEffectSourceBuildIds,
    sourceSelfMaximumEquipmentEffectsByBuildId
  )
  const sourceFinalAttackByBuildId = resolveSourceFinalAttackByBuildId(
    input.build,
    input.teammates,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.enemyCount,
    resolvedActiveEffectIds,
    input.activeEffectSourceBuildIds,
    sourceSelfMaximumEquipmentEffectsByBuildId
  )
  const baseStats = resolveStats(
    input.build,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.resolvedActionParameters,
    EMPTY_COMBAT_ACTION_EFFECTS
  )
  return {
    baseStats,
    primaryDifferentElementTeammateCount,
    primaryElement,
    primarySameElementTeammateCount,
    resolvedActiveEffectIds,
    sourceFinalAttackByBuildId,
    sourceFinalDefenseByBuildId,
    sourceFinalElementalMasteryByBuildId,
    sourceFinalHpByBuildId,
    teamUniqueElementCount
  }
}

/** Replaces deferred stat-conversion ratios with their resolved contributions for the UI trace. */
export function materializeDeferredStatEffects(
  appliedEffects: readonly AppliedCombatActionEffect[],
  finalHp: number,
  finalElementalMastery: number
): readonly AppliedCombatActionEffect[] {
  return appliedEffects.map((effect) => {
    if (effect.target === "finalHpToFlatAttack") return { ...effect, target: "flatAttack", value: effect.value * finalHp }
    if (effect.target === "finalElementalMasteryToFlatAttack") {
      return { ...effect, target: "flatAttack", value: effect.value * finalElementalMastery }
    }
    if (effect.target === "finalHpToElementalMastery") {
      return { ...effect, target: "elementalMastery", value: effect.value * finalHp }
    }
    if (effect.target === "finalHpToDamageBonus" || effect.target === "finalHpToOwnElementDamageBonus") {
      const { finalHpMaximumValue: _, ...materializedEffect } = effect
      const value =
        effect.finalHpMaximumValue === undefined
          ? effect.value * finalHp
          : Math.min(effect.value * finalHp, effect.finalHpMaximumValue)
      return { ...materializedEffect, target: "damageBonus", value }
    }
    return effect
  })
}

export function resolveAmplifyingReactionWithActionEffects(
  reaction: CombatActionMetadata["amplifyingReaction"],
  amplifyingReactionBonus: number
): CombatActionMetadata["amplifyingReaction"] {
  if (!reaction) return undefined
  return { ...reaction, bonus: reaction.bonus + amplifyingReactionBonus }
}

/** Adds typed equipment bonuses only to the current direct action's declared Additive-reaction term. */
export function resolveAdditiveReactionWithActionEffects(
  reaction: CombatActionMetadata["additiveReaction"],
  reactionDamageBonus: number
): CombatActionMetadata["additiveReaction"] {
  if (!reaction) return undefined
  return { ...reaction, bonus: reaction.bonus + reactionDamageBonus }
}

export function resolveDeclaredTimeline(
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  parts: readonly DeclaredDirectActionPartEvaluation[],
  actionParameters: ReadonlyMap<string, number>
): DeclaredDamageTimeline {
  const actionTimeline = action.timeline
  if (!actionTimeline) {
    return {
      duration: 1,
      events: parts.map((part) => ({
        coefficientMultiplier: 1,
        hitCount: 1,
        id: part.id,
        part,
        statSnapshotTime: 0,
        time: 0
      }))
    }
  }

  const partsById = new Map(parts.map((part) => [part.id, part]))
  const events: DeclaredDamageTimelineEvent[] = []
  for (const event of actionTimeline.damageEvents) {
    assertDeclaredMixedSpecialReactionEvent(action, event)
    const hitCount = resolveDeclaredEventHitCount(event, actionParameters, action.id)
    if (hitCount === 0) continue
    const part = partsById.get(event.damagePartId)
    if (!part) {
      throw new Error(`Damage event ${event.id} for action ${action.id} references missing part ${event.damagePartId}`)
    }
    events.push({
      ...(event.elementalApplication ? { elementalApplication: event.elementalApplication } : {}),
      ...(event.elementOverrideTarget ? { elementOverrideTarget: event.elementOverrideTarget } : {}),
      ...(event.specialReaction ? { specialReaction: event.specialReaction } : {}),
      coefficientMultiplier: resolveDeclaredEventCoefficientMultiplier(
        event,
        action,
        build,
        gameData,
        actionParameters,
        action.id
      ),
      hitCount,
      id: event.id,
      part,
      statSnapshotTime: resolveDeclaredEventSnapshotTime(event, actionTimeline.duration, action.id),
      time: event.at
    })
  }
  return {
    duration: actionTimeline.duration,
    events
  }
}

/** Resolves the final element set used to match one selected action's action-scoped effects. */
export function resolveDeclaredActionEffectElements(
  action: CombatActionMetadata,
  ownerId: string,
  timeline: DeclaredDamageTimeline,
  elementOverrides: readonly RotationElementOverrideWindow[] | undefined
): readonly Element[] {
  const elements = new Set<Element>()
  for (const event of timeline.events) {
    const override = resolveRotationElementOverride(
      {
        ...(event.elementOverrideTarget ? { elementOverrideTarget: event.elementOverrideTarget } : {}),
        ownerId,
        time: event.time
      },
      elementOverrides ?? []
    )
    elements.add(override?.element ?? action.element)
  }
  return [...elements]
}

/** Lists the Vaporize or Melt reactions that the calculator actually resolves before applying their action effects. */
export function resolveActualDynamicAmplifyingReactionKinds(
  action: CombatActionMetadata,
  ownerId: string,
  reaction: CombatActionMetadata["additiveReaction"] | CombatActionMetadata["amplifyingReaction"],
  legacyScalingStat: ScalingStat | undefined,
  timeline: DeclaredDamageTimeline,
  stats: RotationStats,
  enemy: EnemyConfig,
  rotationAuras: readonly SustainedAuraWindow[] | undefined,
  rotationElementOverrides: readonly RotationElementOverrideWindow[] | undefined
): readonly NonNullable<CombatActionMetadata["amplifyingReaction"]>["kind"][] {
  if (!rotationAuras || rotationAuras.length === 0) return []
  const preflight = evaluateRotation({
    duration: timeline.duration,
    enemy: {
      defenseReduction: enemy.defenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    ...(rotationElementOverrides ? { elementOverrides: rotationElementOverrides } : {}),
    sustainedAuras: rotationAuras,
    events: timeline.events.map((event) =>
      createDeclaredRotationEvent(action, ownerId, reaction, legacyScalingStat, [], 0, stats, event, 0, 0, 0)
    )
  })
  return [
    ...new Set(
      preflight.events.flatMap((event) => {
        const eventReaction = event.elementalApplication?.reaction
        return eventReaction && isAmplifyingReaction(eventReaction) ? [eventReaction] : []
      })
    )
  ]
}

export function createDeclaredRotationEvent(
  action: CombatActionMetadata,
  ownerId: string,
  reaction: CombatActionMetadata["additiveReaction"] | CombatActionMetadata["amplifyingReaction"],
  legacyScalingStat: ScalingStat | undefined,
  matchedActionDamageScalingTerms: readonly DamageScalingTerm[],
  baseDamageFlat: number,
  stats: RotationStats,
  event: DeclaredDamageTimelineEvent,
  resistanceReduction: number,
  defenseIgnore: number,
  amplifyingReactionBonus: number
): RotationDamageEvent {
  const base = {
    canCrit: true,
    element: action.element,
    id: `${action.id}.${event.id}`,
    ownerId,
    ...(event.elementalApplication ? { elementalApplication: event.elementalApplication } : {}),
    ...(event.elementOverrideTarget ? { elementOverrideTarget: event.elementOverrideTarget } : {}),
    ...(reaction ? { reaction } : {}),
    ...(amplifyingReactionBonus > 0 ? { amplifyingReactionBonus } : {}),
    ...(defenseIgnore > 0 ? { defenseIgnore } : {}),
    ...(resistanceReduction > 0 ? { resistanceReduction } : {}),
    hitCount: event.hitCount,
    statSnapshotTime: event.statSnapshotTime,
    stats,
    time: event.time
  }
  if (hasResolvedMultipleScalingTerms(event.part)) {
    return {
      ...base,
      scaling: {
        ...(baseDamageFlat === 0 ? {} : { flatDamage: baseDamageFlat }),
        terms: appendMatchedActionDamageScalingTerms(
          multiplyScalingTerms(event.part.terms, event.coefficientMultiplier),
          matchedActionDamageScalingTerms
        )
      }
    }
  }
  if (matchedActionDamageScalingTerms.length > 0) {
    return {
      ...base,
      scaling: {
        ...(baseDamageFlat === 0 ? {} : { flatDamage: baseDamageFlat }),
        terms: [
          {
            coefficient: (event.part.coefficient ?? 0) * event.coefficientMultiplier,
            stat: requireLegacyScalingStat(action.id, legacyScalingStat)
          },
          ...matchedActionDamageScalingTerms
        ]
      }
    }
  }
  return {
    ...base,
    scaling: {
      coefficient: (event.part.coefficient ?? 0) * event.coefficientMultiplier,
      ...(baseDamageFlat === 0 ? {} : { flatDamage: baseDamageFlat }),
      stat: requireLegacyScalingStat(action.id, legacyScalingStat)
    }
  }
}

/** Maps self-owned resolved same-hit equipment terms into calculator scaling terms after final stats are available. */
export function resolveMatchedActionDamageScalingTerms(
  effects: Pick<ResolvedCombatActionEffects, "matchedActionAdditiveDamageTerms">
): readonly DamageScalingTerm[] {
  return effects.matchedActionAdditiveDamageTerms.map((term) => ({
    coefficient: term.coefficient,
    label: term.label,
    stat: term.scalingStat
  }))
}

/** Builds the legacy direct-result term list without mutating audited character damage-part declarations. */
export function createDirectDamageScalingTerms(
  actionId: string,
  legacyScalingStat: ScalingStat | undefined,
  talentMultiplier: number | null,
  multiScalingPart: (DeclaredDirectActionPartEvaluation & {
    readonly terms: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]]
  }) | undefined,
  matchedActionDamageScalingTerms: readonly DamageScalingTerm[]
): readonly [DamageScalingTerm, ...DamageScalingTerm[]] | undefined {
  if (multiScalingPart) {
    return appendMatchedActionDamageScalingTerms(multiScalingPart.terms, matchedActionDamageScalingTerms)
  }
  if (matchedActionDamageScalingTerms.length === 0) return undefined
  return [
    {
      coefficient: talentMultiplier ?? 0,
      stat: requireLegacyScalingStat(actionId, legacyScalingStat)
    },
    ...matchedActionDamageScalingTerms
  ]
}

/** Appends same-hit terms only after the event-specific original multiplier has been applied. */
export function appendMatchedActionDamageScalingTerms(
  originalTerms: readonly [DamageScalingTerm, ...DamageScalingTerm[]],
  matchedActionDamageScalingTerms: readonly DamageScalingTerm[]
): readonly [DamageScalingTerm, ...DamageScalingTerm[]] {
  const [first, ...rest] = originalTerms
  return [first, ...rest, ...matchedActionDamageScalingTerms]
}

export function createAdditionalDamageRotationEvent(
  actionId: string,
  ownerId: string,
  stats: RotationStats,
  event: ResolvedAdditionalDamageEvent,
  time: number,
  statSnapshotTime: number,
  resistanceReduction: number,
  defenseIgnore: number
): RotationDamageEvent {
  if (event.reactionPolicy !== "none") {
    throw new Error(`Additional damage event ${event.id} must explicitly disable reactions`)
  }
  return {
    canCrit: event.canCrit,
    ...(event.critPolicy === undefined ? {} : { critPolicy: event.critPolicy }),
    element: event.element,
    hitCount: 1,
    id: `${actionId}.${event.id}`,
    ownerId,
    ...(defenseIgnore > 0 ? { defenseIgnore } : {}),
    ...(resistanceReduction > 0 ? { resistanceReduction } : {}),
    scaling: {
      coefficient: event.coefficient * event.expectedTriggerProbability,
      ...(event.flatDamage === undefined
        ? {}
        : { flatDamage: event.flatDamage * event.expectedTriggerProbability }),
      stat: event.scalingStat
    },
    statSnapshotTime,
    stats,
    time
  }
}

export function resolveDeclaredEventHitCount(
  event: CombatDamageEventTemplate,
  actionParameters: ReadonlyMap<string, number>,
  actionId: string
): number {
  const hitCount =
    event.hitCount === undefined
      ? 1
      : typeof event.hitCount === "number"
        ? event.hitCount
        : actionParameters.get(event.hitCount.parameterId)
  if (typeof hitCount !== "number" || !Number.isInteger(hitCount) || hitCount < 0) {
    throw new Error(`Damage event ${event.id} for action ${actionId} must resolve to a non-negative integer hit count`)
  }
  return hitCount
}

export function resolveDeclaredEventCoefficientMultiplier(
  event: CombatDamageEventTemplate,
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  actionParameters: ReadonlyMap<string, number>,
  actionId: string
): number {
  const multiplierDefinition = event.coefficientMultiplier
  if (!multiplierDefinition) return 1
  const parameterValue = actionParameters.get(multiplierDefinition.parameterId)
  if (parameterValue === undefined || !Number.isInteger(parameterValue)) {
    throw new Error(`Damage event ${event.id} for action ${actionId} has no valid coefficient multiplier parameter`)
  }
  if (multiplierDefinition.kind === "scenario_parameter_lookup") {
    const matchingMultiplier = multiplierDefinition.values.find((entry) => entry.parameterValue === parameterValue)
    if (!matchingMultiplier || !Number.isFinite(matchingMultiplier.multiplier) || matchingMultiplier.multiplier < 0) {
      throw new Error(`Damage event ${event.id} for action ${actionId} has no valid coefficient multiplier`)
    }
    return matchingMultiplier.multiplier
  }
  const perParameterCoefficient = resolveDeclaredTalentCoefficientValue({
    action,
    build,
    coefficientParameterId: multiplierDefinition.perParameterTalentCoefficientId,
    gameData
  })
  const multiplier = multiplierDefinition.base + parameterValue * perParameterCoefficient
  if (!Number.isFinite(multiplier) || multiplier < 0) {
    throw new Error(`Damage event ${event.id} for action ${actionId} has no valid coefficient multiplier`)
  }
  return multiplier
}

export function multiplyScalingTerms(
  terms: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]],
  multiplier: number
): readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]] {
  const [first, ...rest] = terms
  const multiplyTerm = (term: DeclaredDirectActionScalingTermEvaluation) => ({
    ...term,
    coefficient: term.coefficient * multiplier
  })
  return [multiplyTerm(first), ...rest.map(multiplyTerm)]
}

export function resolveDeclaredEventSnapshotTime(
  event: CombatDamageEventTemplate,
  duration: number,
  actionId: string
): number {
  const snapshotTime = event.snapshot === "cast" ? 0 : event.snapshot === "hit" ? event.at : event.snapshotAt
  if (!Number.isFinite(snapshotTime) || snapshotTime < 0 || snapshotTime > duration || snapshotTime > event.at) {
    throw new Error(
      `Damage event ${event.id} for action ${actionId} must snapshot at a finite time within the action before its hit`
    )
  }
  return snapshotTime
}

export function resolveDamagePart(
  action: CombatActionMetadata,
  build: CharacterBuild,
  part: CombatDamagePart,
  gameData: GameDataRepository,
  actionParameters: ReadonlyMap<string, number>
): DeclaredDirectActionPartEvaluation {
  if (hasMultipleScalingTerms(part)) {
    return {
      id: part.id,
      terms: resolveScalingTerms(action, build, part.scalingTerms, gameData, actionParameters)
    }
  }
  return {
    coefficient: resolveDeclaredTalentCoefficientValue({
      action,
      build,
      coefficientParameterId: part.coefficientParameterId,
      gameData
    }),
    id: part.id
  }
}

export function hasMultipleScalingTerms(part: CombatDamagePart): part is Extract<CombatDamagePart, { readonly scalingTerms: unknown }> {
  return "scalingTerms" in part
}

export function hasResolvedMultipleScalingTerms(
  part: DeclaredDirectActionPartEvaluation
): part is DeclaredDirectActionPartEvaluation & {
  readonly terms: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]]
} {
  return part.terms !== undefined
}

export function resolveScalingTerms(
  action: CombatActionMetadata,
  build: CharacterBuild,
  terms: readonly [
    {
      readonly coefficientMultiplierParameterId?: string
      readonly coefficientMultiplierScenarioParameterId?: string
      readonly coefficientMultiplierScenarioParameterScale?: number
      readonly coefficientParameterId: string
      readonly minimumSourceAscension?: number
      readonly stat: ScalingStat
    },
    ...{
      readonly coefficientMultiplierParameterId?: string
      readonly coefficientMultiplierScenarioParameterId?: string
      readonly coefficientMultiplierScenarioParameterScale?: number
      readonly coefficientParameterId: string
      readonly minimumSourceAscension?: number
      readonly stat: ScalingStat
    }[]
  ],
  gameData: GameDataRepository,
  actionParameters: ReadonlyMap<string, number>
): readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]] {
  const [first, ...rest] = terms
  const resolveTerm = (term: {
    readonly coefficientMultiplierParameterId?: string
    readonly coefficientMultiplierScenarioParameterId?: string
    readonly coefficientMultiplierScenarioParameterScale?: number
    readonly coefficientParameterId: string
    readonly minimumSourceAscension?: number
    readonly stat: ScalingStat
  }) => {
    if (term.minimumSourceAscension !== undefined && build.ascension < term.minimumSourceAscension) {
      return { coefficient: 0, stat: term.stat }
    }
    const coefficient = resolveDeclaredTalentCoefficientValue({
      action,
      build,
      coefficientParameterId: term.coefficientParameterId,
      gameData
    })
    const multiplierParameterId = term.coefficientMultiplierParameterId
    const multiplier =
      multiplierParameterId === undefined
        ? 1
        : resolveDeclaredTalentCoefficientValue({
            action,
            build,
          coefficientParameterId: multiplierParameterId,
          gameData
        })
    const scenarioMultiplierParameterId = term.coefficientMultiplierScenarioParameterId
    const scenarioMultiplier =
      scenarioMultiplierParameterId === undefined ? 1 : actionParameters.get(scenarioMultiplierParameterId)
    if (scenarioMultiplier === undefined || !Number.isInteger(scenarioMultiplier) || scenarioMultiplier < 0) {
      throw new Error(
        `Damage term ${term.coefficientParameterId} for action ${action.id} has no valid scenario multiplier parameter`
      )
    }
    return {
      coefficient: coefficient * multiplier * scenarioMultiplier * (term.coefficientMultiplierScenarioParameterScale ?? 1),
      stat: term.stat
    }
  }
  return [resolveTerm(first), ...rest.map(resolveTerm)]
}

export function applyActionParameterEffects(
  action: CombatActionMetadata,
  actionParameters: Map<string, number>,
  effects: readonly AppliedCombatActionEffect[]
): void {
  for (const effect of effects) {
    if (effect.target !== "actionParameter") continue
    const parameterId = effect.actionParameterId
    const definition = action.scenarioParameters?.find((parameter) => parameter.id === parameterId)
    if (!parameterId || !definition) {
      throw new Error(`Action-parameter effect ${effect.id} does not target a declared parameter of ${action.id}`)
    }
    const currentValue = actionParameters.get(parameterId) ?? definition.defaultValue
    const adjustedValue = Math.min(
      Math.max(currentValue + effect.value, definition.minimumValue),
      definition.maximumValue
    )
    actionParameters.set(parameterId, adjustedValue)
  }
}

export function requireLegacyScalingStat(actionId: string, scalingStat: ScalingStat | undefined): ScalingStat {
  if (!scalingStat) throw new Error(`Declared action ${actionId} must declare a supported scaling stat`)
  return scalingStat
}
