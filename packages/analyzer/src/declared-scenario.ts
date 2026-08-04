import {
  calculateDirectSpecialReactionDamage,
  evaluateExpectedDamage,
  evaluateRotation,
  isAmplifyingReaction,
  resolveRotationElementOverride,
  type DamageAction,
  type DamageScalingTerm,
  type DirectSpecialReactionDamageInput,
  type Element,
  type ExpectedDamageResult,
  type Modifier,
  type RotationDamageEvent,
  type RotationElementalApplication,
  type RotationEffectWindow,
  type RotationElementOverrideTarget,
  type RotationElementOverrideWindow,
  type RotationEventResult,
  type RotationResult,
  type RotationStats,
  type SpecialReactionBaseDamageTerm,
  type SpecialReactionDamageResult,
  type ScalingStat,
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
import type { ArtifactStat, CharacterBuild, EnemyConfig, EvaluationScenario, ExternalBuff } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBaseCombatStats } from "./base-stats.js"
import {
  EMPTY_COMBAT_ACTION_EFFECTS,
  listSelectedSourceAttackSnapshotActivationEffectIds,
  listSelectedSourceAttackSnapshotEffectIds,
  listSelectedSourceDefenseSnapshotActivationEffectIds,
  listSelectedSourceDefenseSnapshotEffectIds,
  resolveAdditionalDamageEventEffects,
  resolveCombatActionAttackEffects,
  resolveCombatActionDefenseEffects,
  resolveCombatActionElementalMasteryEffects,
  resolveCombatActionEffects,
  resolveSelfAutomaticEquipmentEffects,
  resolveSelfMaximumReachableEquipmentStatEffects,
  resolveFinalElementalMasteryToFlatAttack,
  resolveFinalHpToFlatAttack,
  resolveFinalHpToDamageBonus,
  resolveFinalHpToElementalMastery,
  resolveFinalHpToOwnElementDamageBonus,
  type AppliedCombatActionEffect,
  type ResolvedAdditionalDamageEvent,
  type ResolvedCombatActionEffects
} from "./action-effects.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount
} from "./build-variant.js"
import {
  resolveDeclaredActionCappedStatToAttackConversion,
  resolveDeclaredActionIntrinsicEffects,
  resolveDeclaredActionTalentLevelConstellationBonuses,
  resolveDeclaredTalentCoefficientValue
} from "./declared-action.js"
import { normalizeScenarioEffectSelections } from "./scenario-effect-selection.js"
import { resolveTeamState } from "./team-state.js"

/** A resolved hit coefficient inside a semantic direct-action declaration. */
export interface DeclaredDirectActionPartEvaluation {
  readonly coefficient?: number
  readonly id: string
  readonly terms?: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]]
}

/** A resolved stat-specific coefficient that contributes to a single declared direct hit. */
export interface DeclaredDirectActionScalingTermEvaluation {
  readonly coefficient: number
  readonly stat: ScalingStat
}

/** A resolved content event that connects one damage part to its relative timing and snapshot policy. */
interface DeclaredDamageTimelineEvent {
  readonly coefficientMultiplier: number
  readonly elementalApplication?: RotationElementalApplication
  readonly elementOverrideTarget?: RotationElementOverrideTarget
  readonly hitCount: number
  readonly id: string
  readonly part: DeclaredDirectActionPartEvaluation
  readonly specialReaction?: CombatDirectSpecialReactionConfig
  readonly statSnapshotTime: number
  readonly time: number
}

/** The resolved event sequence for a declared action, including its action-relative duration. */
interface DeclaredDamageTimeline {
  readonly duration: number
  readonly events: readonly DeclaredDamageTimelineEvent[]
}

/** Shared resolved stat shape returned by scenario target evaluators. */
export interface ResolvedDeclaredScenarioStats {
  readonly attackPercent: number
  /** Resolved, bounded manual snapshot input used by the target action. */
  readonly actionParameters?: Readonly<Record<string, number>>
  readonly baseAttack: number
  readonly baseDefense: number
  readonly baseElementalMastery: number
  readonly baseHp: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  readonly defensePercent: number
  readonly effectiveAttack: number
  readonly effectiveDefense: number
  readonly effectiveHp: number
  readonly elementalMastery: number
  readonly energyRecharge: number
  readonly flatAttack: number
  /** Every non-base elemental-mastery contribution, including action-owned derived conversions. */
  readonly flatElementalMastery: number
  readonly flatDefense: number
  readonly flatHp: number
  readonly hpPercent: number
  readonly resistanceReduction: number
  readonly statContributions: readonly ResolvedStatContribution[]
  readonly scalingTerms?: readonly DeclaredDirectActionScalingTermEvaluation[]
  readonly talentMultiplier: number | null
}

export type ResolvedStatContributionStage =
  | "attackPercent"
  | "baseAttack"
  | "baseDefense"
  | "baseElementalMastery"
  | "baseHp"
  | "damageBonus"
  | "defensePercent"
  | "elementalMastery"
  | "flatAttack"
  | "flatDefense"
  | "flatHp"
  | "hpPercent"

export interface ResolvedStatContribution {
  readonly label: string
  readonly stage: ResolvedStatContributionStage
  readonly value: number
}

/** Result of a verified content-declared, baseline direct action within a full scenario. */
export interface DeclaredDirectScenarioEvaluation {
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  readonly parts: readonly DeclaredDirectActionPartEvaluation[]
  /** Legacy aggregate formula trace retained for one-hit compatibility; use rotation DPR for timed action totals. */
  readonly result: ExpectedDamageResult
  readonly rotation: RotationResult
  readonly stats: ResolvedDeclaredScenarioStats
}

/** Result of one explicit standalone transformative-reaction metric within a full scenario. */
export interface DeclaredTransformativeScenarioEvaluation {
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  /** A direct-compatible trace of the single reaction event; the rotation event remains authoritative. */
  readonly result: ExpectedDamageResult
  readonly rotation: RotationResult
  readonly stats: ResolvedDeclaredScenarioStats
}

/** Result of one explicit direct Moon or stellar-reaction action in a full selected-action scenario. */
export interface DeclaredSpecialReactionScenarioEvaluation {
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  readonly parts: readonly DeclaredDirectActionPartEvaluation[]
  /** Independent Moon or stellar formula trace; no ordinary damage-bonus or defense stage is present. */
  readonly result: SpecialReactionDamageResult
  /** Legacy single-event container for the selected action, never a full rotation. */
  readonly rotation: RotationResult
  readonly stats: ResolvedDeclaredScenarioStats
}

/** Input for evaluating a declared baseline direct action in a normalized team scenario. */
export interface DeclaredDirectScenarioInput {
  /** Active current-action snapshots selected through the scenario rather than inferred from a rotation. */
  readonly activeEffectIds?: readonly string[]
  /** Explicit source-build choices for active snapshots with multiple eligible party-owned holders. */
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  readonly action: CombatActionMetadata
  /** Manual snapshot inputs selected for the target action, such as its current number of projectiles that hit. */
  readonly actionParameters?: Readonly<Record<string, number>>
  readonly artifactStatDeltas?: Partial<Readonly<Record<ArtifactStat, number>>>
  readonly build: CharacterBuild
  readonly buffs: readonly ExternalBuff[]
  readonly enemy: EnemyConfig
  /** Number of enemies configured for the selected action; defaults to the single-target training setup. */
  readonly enemyCount?: number
  readonly gameData: GameDataRepository
  /** Party-derived Moonsign level used by equipment variants and Moon reactions. */
  readonly moonsignLevel?: MoonsignLevel
  /** Possible sources for current-action character snapshots, excluding the primary build. */
  readonly teammates?: readonly CharacterBuild[]
  /** Single-target non-consuming aura windows used to derive reactions for timed events. */
  readonly rotationAuras?: readonly SustainedAuraWindow[]
  /** Action-relative stat effect windows used to resolve cast-time and hit-time snapshots. */
  readonly rotationEffects?: readonly RotationEffectWindow[]
  /** Action-relative elemental override windows used by explicitly tagged normal-attack events. */
  readonly rotationElementOverrides?: readonly RotationElementOverrideWindow[]
}

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

function getBuffTotal(buffs: readonly ExternalBuff[], stat: ExternalBuff["stat"]): number {
  return buffs.reduce((total, buff) => total + (buff.stat === stat ? buff.value : 0), 0)
}

function resolvePartyElements(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  gameData: GameDataRepository
): readonly Exclude<Element, "physical">[] {
  return [primary, ...teammates].flatMap((build) => {
    const element = resolveBuildElement(build, gameData)
    return element === null || element === "physical" ? [] : [element]
  })
}

function getDelta(
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  stat: ArtifactStat
): number {
  return deltas?.[stat] ?? 0
}

/**
 * Resolves the selected source build's own stable equipment stat state without importing a teammate's team buff.
 *
 * Each source is temporarily the primary build only for maximum-reachable equipment selection. The effect resolver
 * then filters the selected IDs to self-owned direct stat effects, so the source can receive its own full stacks
 * (for example, Shenhe's off-field six-stack Calamity Queller) without treating that weapon as a recipient buff.
 */
function resolveSourceSelfMaximumReachableEquipmentStatEffects(
  action: CombatActionMetadata,
  source: CharacterBuild,
  sourceTeammates: readonly CharacterBuild[],
  gameData: GameDataRepository,
  enemyCount: number,
  baseEnergyRecharge: number,
  primaryElement: CombatActionMetadata["element"] | null,
  primaryDifferentElementTeammateCount: number | null,
  primarySameElementTeammateCount: number | null,
  teamUniqueElementCount: number | null
): ResolvedCombatActionEffects {
  const sourceScenario: EvaluationScenario = {
    conditions: { activeEffectIds: [], enemyCount, equipmentEffectMode: "maximum_reachable" },
    enemy: { defenseReduction: 0, level: 100, name: "来源属性快照", resistance: 0.1 },
    externalBuffs: [],
    gameDataVersion: gameData.getManifest().gameVersion,
    primary: source,
    targetActionId: action.id,
    teammates: [...sourceTeammates]
  }
  const normalizedScenario = normalizeScenarioEffectSelections(
    sourceScenario,
    gameData,
    resolveTeamState(source, sourceTeammates, gameData)
  )
  return resolveSelfMaximumReachableEquipmentStatEffects({
    action,
    activeEffectIds: normalizedScenario.conditions.activeEffectIds,
    ...(normalizedScenario.conditions.activeEffectSourceBuildIds === undefined
      ? {}
      : { activeEffectSourceBuildIds: normalizedScenario.conditions.activeEffectSourceBuildIds }),
    baseEnergyRecharge,
    enemyCount,
    gameData,
    ...(primaryElement === null ? {} : { primaryElement }),
    primary: source,
    ...(primaryDifferentElementTeammateCount === null
      ? {}
      : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(source, sourceTeammates, gameData),
    teammates: sourceTeammates
  })
}

/** Resolves every party member's source-owned maximum-reachable equipment state once for one action evaluation. */
function resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  enemyCount: number
): ReadonlyMap<string, ResolvedCombatActionEffects> {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  return new Map(
    party.map((source) => {
      const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
      const base = resolveBaseCombatStats(source, gameData, action.element)
      const primaryElement = resolveBuildElement(source, gameData)
      const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      return [
        source.buildId,
        resolveSourceSelfMaximumReachableEquipmentStatEffects(
          action,
          source,
          sourceTeammates,
          gameData,
          enemyCount,
          base.energyRecharge,
          primaryElement,
          primaryDifferentElementTeammateCount,
          primarySameElementTeammateCount,
          teamUniqueElementCount
        )
      ] as const
    })
  )
}

/** Reads one cached source-owned equipment state, keeping source-stat resolver failures actionable. */
function getSourceSelfMaximumReachableEquipmentEffects(
  effectsByBuildId: ReadonlyMap<string, ResolvedCombatActionEffects>,
  sourceBuildId: string
): ResolvedCombatActionEffects {
  const effects = effectsByBuildId.get(sourceBuildId)
  if (effects === undefined) throw new Error(`Missing maximum-reachable equipment state for source build ${sourceBuildId}`)
  return effects
}

/** Resolves each configured source build's final HP before an active party effect reads that source stat. */
function resolveSourceFinalHpByBuildId(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  buffs: readonly ExternalBuff[],
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  enemyCount: number,
  sourceSelfMaximumEquipmentEffectsByBuildId: ReadonlyMap<string, ResolvedCombatActionEffects>
): ReadonlyMap<string, number> {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  return new Map(
    party.map((source) => {
      const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
      const base = resolveBaseCombatStats(source, gameData, action.element)
      const primaryElement = resolveBuildElement(source, gameData)
      const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const automaticEffects = resolveSelfAutomaticEquipmentEffects({
        action,
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null
          ? {}
          : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teammates: sourceTeammates
      })
      const maximumReachableEffects = getSourceSelfMaximumReachableEquipmentEffects(
        sourceSelfMaximumEquipmentEffectsByBuildId,
        source.buildId
      )
      const isPrimary = source.buildId === primary.buildId
      const hpPercent =
        automaticEffects.hpPercent +
        maximumReachableEffects.hpPercent +
        (isPrimary ? getDelta(deltas, "hp_percent") + getBuffTotal(buffs, "hp_percent") : 0)
      const flatHp =
        automaticEffects.hpFlat +
        maximumReachableEffects.hpFlat +
        (isPrimary ? getDelta(deltas, "hp") + getBuffTotal(buffs, "hp_flat") : 0)
      return [source.buildId, base.hp + base.baseHp * hpPercent + flatHp] as const
    })
  )
}

/** Resolves each configured source build's final elemental mastery before an active party effect reads that source stat. */
function resolveSourceFinalElementalMasteryByBuildId(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  buffs: readonly ExternalBuff[],
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  enemyCount: number,
  sourceFinalHpByBuildId: ReadonlyMap<string, number>,
  sourceSelfMaximumEquipmentEffectsByBuildId: ReadonlyMap<string, ResolvedCombatActionEffects>
): ReadonlyMap<string, number> {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  return new Map(
    party.map((source) => {
      const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
      const base = resolveBaseCombatStats(source, gameData, action.element)
      const primaryElement = resolveBuildElement(source, gameData)
      const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const automaticEffects = resolveCombatActionElementalMasteryEffects({
        action,
        activeEffectIds: [],
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        gameData,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        sourceFinalHpByBuildId,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teamElements: resolvePartyElements(source, sourceTeammates, gameData),
        teammates: sourceTeammates
      })
      const maximumReachableEffects = getSourceSelfMaximumReachableEquipmentEffects(
        sourceSelfMaximumEquipmentEffectsByBuildId,
        source.buildId
      )
      const sourceFinalHp = sourceFinalHpByBuildId.get(source.buildId)
      if (sourceFinalHp === undefined) throw new Error(`Missing final HP for source build ${source.buildId}`)
      const isPrimary = source.buildId === primary.buildId
      const elementalMastery =
        base.elementalMastery +
        automaticEffects.elementalMastery +
        maximumReachableEffects.elementalMastery +
        resolveFinalHpToElementalMastery(sourceFinalHp, automaticEffects) +
        (isPrimary ? getDelta(deltas, "elemental_mastery") + getBuffTotal(buffs, "elemental_mastery") : 0)
      return [source.buildId, elementalMastery] as const
    })
  )
}

/** Resolves each source build's defense at the explicit state captured by a source-defense conversion. */
function resolveSourceFinalDefenseByBuildId(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  buffs: readonly ExternalBuff[],
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  enemyCount: number,
  activeEffectIds: readonly string[],
  activeEffectSourceBuildIds: Readonly<Record<string, string>> | undefined,
  sourceSelfMaximumEquipmentEffectsByBuildId: ReadonlyMap<string, ResolvedCombatActionEffects>
): ReadonlyMap<string, number> {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  return new Map(
    party.map((source) => {
      const sourceDefenseSnapshotActivationEffectIds = listSelectedSourceDefenseSnapshotActivationEffectIds({
        activeEffectIds,
        ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
        primary,
        sourceBuild: source,
        teammates
      })
      const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
      const base = resolveBaseCombatStats(source, gameData, action.element)
      const primaryElement = resolveBuildElement(source, gameData)
      const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const automaticEffects = resolveSelfAutomaticEquipmentEffects({
        action,
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teammates: sourceTeammates
      })
      const maximumReachableEffects = getSourceSelfMaximumReachableEquipmentEffects(
        sourceSelfMaximumEquipmentEffectsByBuildId,
        source.buildId
      )
      const sourceDefenseEffects = resolveCombatActionDefenseEffects({
        action,
        activeEffectIds: sourceDefenseSnapshotActivationEffectIds,
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teammates: sourceTeammates
      })
      const isPrimary = source.buildId === primary.buildId
      const defensePercent =
        automaticEffects.defensePercent +
        maximumReachableEffects.defensePercent +
        sourceDefenseEffects.defensePercent +
        (isPrimary ? getDelta(deltas, "def_percent") + getBuffTotal(buffs, "defense_percent") : 0)
      const flatDefense =
        automaticEffects.defenseFlat +
        maximumReachableEffects.defenseFlat +
        sourceDefenseEffects.defenseFlat +
        (isPrimary ? getDelta(deltas, "def") + getBuffTotal(buffs, "defense_flat") : 0)
      return [source.buildId, base.defense + base.baseDefense * defensePercent + flatDefense] as const
    })
  )
}

/** Resolves each configured source build's final attack before an active party effect reads that source stat. */
function resolveSourceFinalAttackByBuildId(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  buffs: readonly ExternalBuff[],
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  enemyCount: number,
  activeEffectIds: readonly string[],
  activeEffectSourceBuildIds: Readonly<Record<string, string>> | undefined,
  sourceSelfMaximumEquipmentEffectsByBuildId: ReadonlyMap<string, ResolvedCombatActionEffects>
): ReadonlyMap<string, number> {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  return new Map(
    party.map((source) => {
      const sourceAttackSnapshotActivationEffectIds = listSelectedSourceAttackSnapshotActivationEffectIds({
        activeEffectIds,
        ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
        primary,
        sourceBuild: source,
        teammates
      })
      const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
      const base = resolveBaseCombatStats(source, gameData, action.element)
      const primaryElement = resolveBuildElement(source, gameData)
      const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(
        source,
        sourceTeammates,
        gameData
      )
      const automaticEffects = resolveSelfAutomaticEquipmentEffects({
        action,
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null
          ? {}
          : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teammates: sourceTeammates
      })
      const maximumReachableEffects = getSourceSelfMaximumReachableEquipmentEffects(
        sourceSelfMaximumEquipmentEffectsByBuildId,
        source.buildId
      )
      const sourceAttackEffects = resolveCombatActionAttackEffects({
        action,
        activeEffectIds: sourceAttackSnapshotActivationEffectIds,
        baseEnergyRecharge: base.energyRecharge,
        enemyCount,
        gameData,
        ...(primaryElement === null ? {} : { primaryElement }),
        primary: source,
        ...(primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
        teammates: sourceTeammates
      })
      const isPrimary = source.buildId === primary.buildId
      const attackPercent =
        automaticEffects.attackPercent +
        maximumReachableEffects.attackPercent +
        sourceAttackEffects.attackPercent +
        (isPrimary ? getDelta(deltas, "atk_percent") + getBuffTotal(buffs, "attack_percent") : 0)
      const flatAttack =
        automaticEffects.flatAttack +
        maximumReachableEffects.flatAttack +
        sourceAttackEffects.flatAttack +
        (isPrimary ? getDelta(deltas, "atk") + getBuffTotal(buffs, "attack_flat") : 0)
      return [source.buildId, base.attack + base.baseAttack * attackPercent + flatAttack] as const
    })
  )
}

/** Resolves final source stats consumed by party effects before evaluating the selected recipient action. */
export function resolveScenarioSourceStatMaps(input: {
  readonly action: CombatActionMetadata
  readonly activeEffectIds: readonly string[]
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  readonly artifactStatDeltas?: Partial<Readonly<Record<ArtifactStat, number>>>
  readonly buffs: readonly ExternalBuff[]
  readonly enemyCount: number
  readonly gameData: GameDataRepository
  readonly primary: CharacterBuild
  readonly teammates: readonly CharacterBuild[]
}): {
  readonly sourceFinalAttackByBuildId: ReadonlyMap<string, number>
  readonly sourceFinalDefenseByBuildId: ReadonlyMap<string, number>
  readonly sourceFinalElementalMasteryByBuildId: ReadonlyMap<string, number>
  readonly sourceFinalHpByBuildId: ReadonlyMap<string, number>
} {
  const sourceSelfMaximumEquipmentEffectsByBuildId = resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId(
    input.primary,
    input.teammates,
    input.action,
    input.gameData,
    input.enemyCount
  )
  const sourceFinalHpByBuildId = resolveSourceFinalHpByBuildId(
    input.primary,
    input.teammates,
    input.action,
    input.gameData,
    input.buffs,
    input.artifactStatDeltas,
    input.enemyCount,
    sourceSelfMaximumEquipmentEffectsByBuildId
  )
  const sourceFinalElementalMasteryByBuildId = resolveSourceFinalElementalMasteryByBuildId(
    input.primary,
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
    input.primary,
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
    input.primary,
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
  return {
    sourceFinalAttackByBuildId,
    sourceFinalDefenseByBuildId,
    sourceFinalElementalMasteryByBuildId,
    sourceFinalHpByBuildId
  }
}

function getDamageTalentSlot(action: CombatActionMetadata): DamageAction["tags"]["talent"] {
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

function assertDeclaredDirectAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
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

function assertDeclaredTransformativeAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
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

function assertDeclaredSpecialReactionAction(action: CombatActionMetadata): asserts action is CombatActionMetadata & {
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
function assertDeclaredSpecialReactionConfig(
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
function assertDeclaredMixedSpecialReactionEvent(
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
function hasDeclaredMixedSpecialReactionEvents(action: CombatActionMetadata): boolean {
  return action.timeline?.damageEvents.some((event) => event.specialReaction !== undefined) ?? false
}

function isDeclaredSpecialReactionTimelineEvent(
  event: DeclaredDamageTimelineEvent
): event is DeclaredDamageTimelineEvent & { readonly specialReaction: CombatDirectSpecialReactionConfig } {
  return event.specialReaction !== undefined
}

function resolveStats(
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
  const preliminaryAttack = base.baseAttack * (1 + attackPercent) + flatAttack + finalHpSourcedFlatAttack
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
      baseAttack: base.baseAttack,
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
  const attack = base.baseAttack * (1 + attackPercent) + effectiveFlatAttack
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
      baseAttack: base.baseAttack,
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

function resolveStatContributions(input: ResolveStatContributionsInput): readonly ResolvedStatContribution[] {
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

function addArtifactStatContributions(
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

function addResidualContribution(
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

function resolveSpecialReactionBaseDamage(
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
function resolveSpecialReactionBaseDamageTerms(
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
function createDeclaredScenarioStats(
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

function resolveSpecialReactionScalingValue(stats: RotationStats, stat: ScalingStat): number {
  if (stat === "attack") return stats.attack
  if (stat === "defense") return stats.defense
  if (stat === "elementalMastery") return stats.elementalMastery
  return stats.hp
}

function resolveDirectSpecialReactionInput(
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
    .map((effect) => ({
      coefficient: stats.elementalMastery === 0 ? 1 : effect.value / stats.elementalMastery,
      label: effect.label,
      stat: "elementalMastery" as const,
      value: stats.elementalMastery === 0 ? effect.value : stats.elementalMastery
    }))
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

function isSpecialReactionStatEffect(effect: AppliedCombatActionEffect): boolean {
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

function createDirectSpecialReactionRotation(
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
function createDeclaredSpecialReactionRotationEvent(
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
function deduplicateAppliedEffects(
  effects: readonly AppliedCombatActionEffect[]
): readonly AppliedCombatActionEffect[] {
  const uniqueEffects = new Map<string, AppliedCombatActionEffect>()
  for (const effect of effects) {
    const key = [effect.id, effect.sourceId, effect.target, effect.value].join("\u0000")
    if (!uniqueEffects.has(key)) uniqueEffects.set(key, effect)
  }
  return [...uniqueEffects.values()]
}

function resolveDamageBonusByElement(
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
export function evaluateDeclaredDirectScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredDirectScenarioEvaluation {
  const {
    activeEffectIds = [],
    activeEffectSourceBuildIds,
    action,
    artifactStatDeltas,
    build,
    buffs,
    enemy,
    enemyCount = 1,
    gameData,
    actionParameters,
    rotationAuras,
    rotationEffects,
    rotationElementOverrides,
    teammates = [],
    moonsignLevel = "none"
  } = input
  assertDeclaredDirectAction(action)
  if (hasDeclaredMixedSpecialReactionEvents(action)) return evaluateDeclaredMixedSpecialReactionScenarioAction(input)
  const talent = getDamageTalentSlot(action)
  const resolvedActionParameters = new Map(
    resolveActionScenarioParameters(action, actionParameters, build.constellation)
  )
  let parts = action.damageParts.map((part) =>
    resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  let timeline = resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  const effectiveElements = resolveDeclaredActionEffectElements(
    action,
    build.buildId,
    timeline,
    rotationElementOverrides
  )
  const {
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
  } = resolveScenarioActionEffectContext({
    action,
    activeEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    ...(artifactStatDeltas === undefined ? {} : { artifactStatDeltas }),
    build,
    buffs,
    enemyCount,
    gameData,
    moonsignLevel,
    resolvedActionParameters,
    teammates
  })
  const legacyScalingStat = action.scalingStat
  const candidateAmplifyingReactionKinds = resolveActualDynamicAmplifyingReactionKinds(
    action,
    build.buildId,
    action.additiveReaction ?? action.amplifyingReaction,
    legacyScalingStat,
    timeline,
    baseStats.rotation,
    enemy,
    rotationAuras,
    rotationElementOverrides
  )
  const actionEffects = resolveCombatActionEffects({
    action,
    activeEffectIds: resolvedActiveEffectIds,
    ...(candidateAmplifyingReactionKinds.length > 0 ? { candidateAmplifyingReactionKinds } : {}),
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements,
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  })
  applyActionParameterEffects(action, resolvedActionParameters, actionEffects.appliedEffects)
  parts = action.damageParts.map((part) =>
    resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  timeline = resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  const effectiveDefenseReduction = enemy.defenseReduction + actionEffects.enemyDefenseReduction
  const stats = resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    actionEffects
  )
  const multiScalingPart = parts.find(hasResolvedMultipleScalingTerms)
  const additiveReaction = resolveAdditiveReactionWithActionEffects(
    action.additiveReaction,
    actionEffects.reactionDamageBonus
  )
  const amplifyingReaction = resolveAmplifyingReactionWithActionEffects(
    action.amplifyingReaction,
    actionEffects.amplifyingReactionBonus
  )
  const declaredReaction = additiveReaction ?? amplifyingReaction
  const matchedActionDamageScalingTerms = resolveMatchedActionDamageScalingTerms(actionEffects)
  const talentMultiplier = multiScalingPart
    ? null
    : parts.reduce((total, part) => total + (part.coefficient ?? 0), 0)
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    ...(multiScalingPart ? { scalingTerms: multiScalingPart.terms } : {}),
    talentMultiplier
  }
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects: readonly AppliedCombatActionEffect[] = [
    ...materializeDeferredStatEffects(
      actionEffects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ]
  const actionModifiers: Modifier[] = [
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "baseDamageFlat")
      .map((effect) => ({
        filter: { actionId: action.id },
        kind: "base_damage_flat" as const,
        source: effect.id,
        value: effect.value
      })),
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "enemyResistanceReduction")
      .map((effect) => ({
        element: action.element,
        kind: "resistance_reduction" as const,
        source: effect.id,
        value: effect.value
      })),
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "enemyDefenseIgnore")
      .map((effect) => ({
        filter: { actionId: action.id },
        kind: "defense_ignore" as const,
        source: effect.id,
        value: effect.value
      }))
  ]
  const directDamageScalingTerms = createDirectDamageScalingTerms(
    action.id,
    legacyScalingStat,
    talentMultiplier,
    multiScalingPart,
    matchedActionDamageScalingTerms
  )
  const damageAction: DamageAction = directDamageScalingTerms
    ? {
        ...(additiveReaction ? { additiveReaction } : {}),
        ...(amplifyingReaction ? { amplifyingReaction } : {}),
        canCrit: true,
        scalingTerms: directDamageScalingTerms,
        tags: {
          actionId: action.id,
          element: action.element,
          ownerId: action.characterId,
          talent
        }
      }
    : {
        ...(additiveReaction ? { additiveReaction } : {}),
        ...(amplifyingReaction ? { amplifyingReaction } : {}),
        canCrit: true,
        multiplier: talentMultiplier ?? 0,
        scalingStat: requireLegacyScalingStat(action.id, legacyScalingStat),
        tags: {
          actionId: action.id,
          element: action.element,
          ownerId: action.characterId,
          talent
        }
      }
  const result = evaluateExpectedDamage({
    action: damageAction,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    modifiers: actionModifiers,
    stats: {
      attackPercent: scenarioStats.attackPercent,
      baseAttack: scenarioStats.baseAttack,
      critDamage: scenarioStats.critDamage,
      critRate: scenarioStats.critRate,
      damageBonus: scenarioStats.damageBonus,
      defense: stats.rotation.defense,
      elementalMastery: scenarioStats.elementalMastery,
      flatAttack: scenarioStats.flatAttack,
      hp: stats.rotation.hp,
      level: build.level
    }
  })
  const declaredRotationEvents = timeline.events.map((event) =>
    createDeclaredRotationEvent(
      action,
      build.buildId,
      declaredReaction,
      legacyScalingStat,
      matchedActionDamageScalingTerms,
      actionEffects.baseDamageFlat,
      stats.rotation,
      event,
      actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      actionEffects.enemyDefenseIgnore,
      actionEffects.amplifyingReactionBonus
    )
  )
  const additionalDamageEventTime = timeline.events[0]?.time ?? 0
  const additionalDamageEventSnapshotTime = timeline.events[0]?.statSnapshotTime ?? 0
  const additionalDamageRotationEvents = actionEffects.additionalDamageEvents.map((event) => {
    const additionalDamageEventEffects = resolveAdditionalDamageEventEffects({
      action,
      activeEffectIds: resolvedActiveEffectIds,
      ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
      additionalDamageEvent: event,
      baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    gameData,
    moonsignLevel,
    primary: build,
      ...(primaryElement === null ? {} : { primaryElement }),
      sourceFinalDefenseByBuildId,
      sourceFinalAttackByBuildId,
      sourceFinalHpByBuildId,
      sourceFinalElementalMasteryByBuildId,
      ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
      ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
      ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
      teamElements: resolvePartyElements(build, teammates, gameData),
      teammates
    })
    const additionalDamageEventStats = resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      additionalDamageEventEffects
    )
    return createAdditionalDamageRotationEvent(
      action.id,
      build.buildId,
      additionalDamageEventStats.additionalDamageEventRotation,
      event,
      additionalDamageEventTime,
      additionalDamageEventSnapshotTime,
      additionalDamageEventEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      additionalDamageEventEffects.enemyDefenseIgnore
    )
  })
  const rotation = evaluateRotation({
    duration: timeline.duration,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    ...(rotationEffects ? { effects: rotationEffects } : {}),
    ...(rotationElementOverrides ? { elementOverrides: rotationElementOverrides } : {}),
    ...(rotationAuras ? { sustainedAuras: rotationAuras } : {}),
    events: [...declaredRotationEvents, ...additionalDamageRotationEvents].sort((left, right) => left.time - right.time)
  })
  return { appliedEffects, parts, result, rotation, stats: scenarioStats }
}

/**
 * Evaluates a verified direct action whose timeline contains both ordinary direct hits and independent Moon or
 * Stellar-reaction hits. The two event families deliberately resolve their effects and formula stages separately.
 */
function evaluateDeclaredMixedSpecialReactionScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredDirectScenarioEvaluation {
  const {
    activeEffectIds = [],
    activeEffectSourceBuildIds,
    action,
    artifactStatDeltas,
    build,
    buffs,
    enemy,
    enemyCount = 1,
    gameData,
    actionParameters,
    rotationAuras,
    rotationEffects,
    rotationElementOverrides,
    teammates = [],
    moonsignLevel = "none"
  } = input
  assertDeclaredDirectAction(action)
  const talent = getDamageTalentSlot(action)
  const resolvedActionParameters = new Map(
    resolveActionScenarioParameters(action, actionParameters, build.constellation)
  )
  let parts = action.damageParts.map((part) =>
    resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  let timeline = resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  let ordinaryEvents = timeline.events.filter((event) => event.specialReaction === undefined)
  let specialEvents = timeline.events.filter(isDeclaredSpecialReactionTimelineEvent)
  const ordinaryTimeline = { duration: timeline.duration, events: ordinaryEvents }
  const effectiveElements = resolveDeclaredActionEffectElements(
    action,
    build.buildId,
    ordinaryTimeline,
    rotationElementOverrides
  )
  const {
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
  } = resolveScenarioActionEffectContext({
    action,
    activeEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    ...(artifactStatDeltas === undefined ? {} : { artifactStatDeltas }),
    build,
    buffs,
    enemyCount,
    gameData,
    moonsignLevel,
    resolvedActionParameters,
    teammates
  })
  const legacyScalingStat = action.scalingStat
  const candidateAmplifyingReactionKinds = resolveActualDynamicAmplifyingReactionKinds(
    action,
    build.buildId,
    action.additiveReaction ?? action.amplifyingReaction,
    legacyScalingStat,
    ordinaryTimeline,
    baseStats.rotation,
    enemy,
    rotationAuras,
    rotationElementOverrides
  )
  const actionEffectContext = {
    action,
    activeEffectIds: resolvedActiveEffectIds,
    ...(candidateAmplifyingReactionKinds.length > 0 ? { candidateAmplifyingReactionKinds } : {}),
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements,
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  }
  const specialReactionKinds = [...new Set(specialEvents.map((event) => event.specialReaction.kind))]
  const parameterEffects = resolveCombatActionEffects({
    ...actionEffectContext,
    candidateSpecialReactionKinds: specialReactionKinds
  })
  applyActionParameterEffects(action, resolvedActionParameters, parameterEffects.appliedEffects)
  parts = action.damageParts.map((part) => resolveDamagePart(action, build, part, gameData, resolvedActionParameters))
  timeline = resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  ordinaryEvents = timeline.events.filter((event) => event.specialReaction === undefined)
  specialEvents = timeline.events.filter(isDeclaredSpecialReactionTimelineEvent)
  const resolvedOrdinaryTimeline = { duration: timeline.duration, events: ordinaryEvents }
  const ordinaryActionEffects = resolveCombatActionEffects({
    ...actionEffectContext,
    candidateSpecialReactionKinds: [],
    effectiveElements: resolveDeclaredActionEffectElements(
      action,
      build.buildId,
      resolvedOrdinaryTimeline,
      rotationElementOverrides
    )
  })
  const ordinaryStats = resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    ordinaryActionEffects
  )
  const ordinaryPartIds = new Set(ordinaryEvents.map((event) => event.part.id))
  const ordinaryParts = parts.filter((part) => ordinaryPartIds.has(part.id))
  const ordinaryMultiScalingPart = ordinaryParts.find(hasResolvedMultipleScalingTerms)
  const ordinaryTalentMultiplier = ordinaryMultiScalingPart
    ? null
    : ordinaryParts.reduce((total, part) => total + (part.coefficient ?? 0), 0)
  const ordinaryScenarioStats = createDeclaredScenarioStats(
    action,
    resolvedActionParameters,
    ordinaryStats.scenario,
    ordinaryMultiScalingPart,
    ordinaryTalentMultiplier
  )
  const effectiveDefenseReduction = enemy.defenseReduction + ordinaryActionEffects.enemyDefenseReduction
  const additiveReaction = resolveAdditiveReactionWithActionEffects(
    action.additiveReaction,
    ordinaryActionEffects.reactionDamageBonus
  )
  const amplifyingReaction = resolveAmplifyingReactionWithActionEffects(
    action.amplifyingReaction,
    ordinaryActionEffects.amplifyingReactionBonus
  )
  const declaredReaction = additiveReaction ?? amplifyingReaction
  const matchedActionDamageScalingTerms = resolveMatchedActionDamageScalingTerms(ordinaryActionEffects)
  const ordinaryAppliedEffects = materializeDeferredStatEffects(
    ordinaryActionEffects.appliedEffects,
    ordinaryStats.rotation.hp,
    ordinaryStats.elementalMasteryForAttackConversion
  )
  const declaredRotationEvents = ordinaryEvents.map((event) =>
    createDeclaredRotationEvent(
      action,
      build.buildId,
      declaredReaction,
      legacyScalingStat,
      matchedActionDamageScalingTerms,
      ordinaryActionEffects.baseDamageFlat,
      ordinaryStats.rotation,
      event,
      ordinaryActionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      ordinaryActionEffects.enemyDefenseIgnore,
      ordinaryActionEffects.amplifyingReactionBonus
    )
  )
  const additionalDamageEventTime = ordinaryEvents[0]?.time ?? 0
  const additionalDamageEventSnapshotTime = ordinaryEvents[0]?.statSnapshotTime ?? 0
  const additionalDamageRotationEvents = ordinaryActionEffects.additionalDamageEvents.map((event) => {
    const additionalDamageEventEffects = resolveAdditionalDamageEventEffects({
      ...actionEffectContext,
      additionalDamageEvent: event,
      candidateSpecialReactionKinds: [],
      effectiveElements: [event.element]
    })
    const additionalDamageEventStats = resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      additionalDamageEventEffects
    )
    return createAdditionalDamageRotationEvent(
      action.id,
      build.buildId,
      additionalDamageEventStats.additionalDamageEventRotation,
      event,
      additionalDamageEventTime,
      additionalDamageEventSnapshotTime,
      additionalDamageEventEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      additionalDamageEventEffects.enemyDefenseIgnore
    )
  })
  const ordinaryRotation = evaluateRotation({
    duration: timeline.duration,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    ...(rotationEffects ? { effects: rotationEffects } : {}),
    ...(rotationElementOverrides ? { elementOverrides: rotationElementOverrides } : {}),
    ...(rotationAuras ? { sustainedAuras: rotationAuras } : {}),
    events: [...declaredRotationEvents, ...additionalDamageRotationEvents].sort((left, right) => left.time - right.time)
  })
  const specialEffectsByKind = new Map<string, ResolvedCombatActionEffects>()
  const specialStatsByKind = new Map<string, ReturnType<typeof resolveStats>>()
  const resolveSpecialEffects = (kind: NonNullable<CombatActionMetadata["specialReaction"]>["kind"]) => {
    const known = specialEffectsByKind.get(kind)
    if (known) return known
    const effects = resolveCombatActionEffects({
      ...actionEffectContext,
      candidateSpecialReactionKinds: [kind],
      effectiveElements: [action.element]
    })
    specialEffectsByKind.set(kind, effects)
    return effects
  }
  const resolveSpecialStats = (kind: NonNullable<CombatActionMetadata["specialReaction"]>["kind"]) => {
    const known = specialStatsByKind.get(kind)
    if (known) return known
    const stats = resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      resolveSpecialEffects(kind)
    )
    specialStatsByKind.set(kind, stats)
    return stats
  }
  const specialEventResults = specialEvents.map((event) => {
    const effects = resolveSpecialEffects(event.specialReaction.kind)
    const stats = resolveSpecialStats(event.specialReaction.kind)
    const scenarioStats = createDeclaredScenarioStats(
      action,
      resolvedActionParameters,
      stats.scenario,
      hasResolvedMultipleScalingTerms(event.part) ? event.part : undefined,
      hasResolvedMultipleScalingTerms(event.part) ? null : event.part.coefficient ?? 0
    )
    const baseDamageTerms = resolveSpecialReactionBaseDamageTerms(
      action,
      event.part,
      stats.rotation,
      event.coefficientMultiplier
    )
    const baseDamage = baseDamageTerms.reduce((total, term) => total + term.coefficient * term.value, 0)
    const result = calculateDirectSpecialReactionDamage(
      resolveDirectSpecialReactionInput(
        event.specialReaction,
        baseDamage,
        baseDamageTerms,
        scenarioStats,
        effects,
        getBuffTotal(buffs, "special_reaction_damage_bonus"),
        enemy.resistance,
        effects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
        resolvedActionParameters
      )
    )
    const appliedEffects = materializeDeferredStatEffects(
      effects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ).filter(isSpecialReactionStatEffect)
    return { appliedEffects, event, result, scenarioStats }
  })
  const specialRotationEvents = specialEventResults.map(({ appliedEffects, event, result }) =>
    createDeclaredSpecialReactionRotationEvent(action, build.buildId, event, result, appliedEffects)
  )
  const rotationEvents = [...ordinaryRotation.events, ...specialRotationEvents].sort((left, right) => left.time - right.time)
  const dpr = rotationEvents.reduce((total, event) => total + event.expectedDamage, 0)
  const rotation: RotationResult = { dpr, dps: dpr / timeline.duration, duration: timeline.duration, events: rotationEvents }
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects = deduplicateAppliedEffects([
    ...ordinaryAppliedEffects,
    ...specialEventResults.flatMap((entry) => entry.appliedEffects),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ])
  const firstSpecialScenarioStats = specialEventResults[0]?.scenarioStats
  const stats = ordinaryEvents.length > 0 || !firstSpecialScenarioStats ? ordinaryScenarioStats : firstSpecialScenarioStats
  const result: ExpectedDamageResult = {
    critDamage: rotationEvents.reduce((total, event) => total + event.critDamage, 0),
    expectedDamage: rotation.dpr,
    nonCritDamage: rotationEvents.reduce((total, event) => total + event.nonCritDamage, 0),
    trace: []
  }
  return { appliedEffects, parts, result, rotation, stats }
}

/**
 * Evaluates one explicitly declared transformative reaction without deriving aura state, hit timing, or repeated
 * reaction ticks. The content action represents exactly one resolved reaction event.
 */
export function evaluateDeclaredTransformativeScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredTransformativeScenarioEvaluation {
  const {
    activeEffectIds = [],
    activeEffectSourceBuildIds,
    action,
    artifactStatDeltas,
    build,
    buffs,
    enemy,
    enemyCount = 1,
    gameData,
    actionParameters,
    teammates = [],
    moonsignLevel = "none"
  } = input
  assertDeclaredTransformativeAction(action)
  const resolvedActionParameters = resolveActionScenarioParameters(action, actionParameters, build.constellation)
  const {
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
  } = resolveScenarioActionEffectContext({
    action,
    activeEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    ...(artifactStatDeltas === undefined ? {} : { artifactStatDeltas }),
    build,
    buffs,
    enemyCount,
    gameData,
    moonsignLevel,
    resolvedActionParameters,
    teammates
  })
  const actionEffects = resolveCombatActionEffects({
    action,
    activeEffectIds: resolvedActiveEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    candidateReactionKinds: [action.transformativeReaction.kind],
    enemyCount,
    effectiveElements: [action.element],
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  })
  const stats = resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    actionEffects
  )
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    talentMultiplier: null
  }
  const appliedEffects = materializeDeferredStatEffects(
    actionEffects.appliedEffects,
    stats.rotation.hp,
    stats.elementalMasteryForAttackConversion
  )
  const rotation = evaluateRotation({
    duration: 1,
    enemy: {
      defenseReduction: enemy.defenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    events: [
      {
        canCrit: false,
        element: action.element,
        hitCount: 1,
        id: `${action.id}.single-reaction`,
        ownerId: build.buildId,
        reaction: {
          ...action.transformativeReaction,
          bonus: actionEffects.reactionDamageBonus,
          ...(actionEffects.transformativeReactionFlatDamageAddition === 0
            ? {}
            : { flatDamageAddition: actionEffects.transformativeReactionFlatDamageAddition })
        },
        ...(actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction") > 0
          ? {
              resistanceReduction:
                actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction")
            }
          : {}),
        scaling: { coefficient: 0, stat: "elementalMastery" },
        stats: stats.rotation,
        time: 0
      }
    ]
  })
  const event = rotation.events[0]
  if (!event) throw new Error(`Declared transformative action ${action.id} did not produce a reaction event`)
  return {
    appliedEffects,
    result: createTransformativeExpectedDamageResult(event),
    rotation,
    stats: scenarioStats
  }
}

/** Projects a single transformative rotation event into the legacy result shape while retaining its exact formula. */
function createTransformativeExpectedDamageResult(event: RotationEventResult): ExpectedDamageResult {
  const trace: Array<ExpectedDamageResult["trace"][number]> = []
  for (const entry of event.trace) {
    if (entry.kind === "transformative_reaction") {
      trace.push({
        after: entry.after,
        before: entry.before,
        formula: {
          baseDamage: entry.baseDamage,
          bonus: entry.bonus,
          elementalMastery: entry.elementalMastery,
          flatDamageAddition: entry.flatDamageAddition,
          kind: "transformative_reaction",
          multiplier: entry.multiplier,
          reaction: entry.reaction
        },
        source: "reaction",
        stage: "transformative_reaction"
      })
      continue
    }
    if (entry.kind === "resistance") {
      trace.push({
        after: entry.after,
        before: entry.before,
        formula: {
          effectiveResistance: entry.effectiveResistance,
          kind: "resistance",
          multiplier: entry.multiplier,
          resistance: entry.baseResistance,
          resistanceReduction: entry.resistanceReduction
        },
        source: "enemy",
        stage: "resistance"
      })
    }
  }
  return {
    critDamage: event.critDamage,
    expectedDamage: event.expectedDamage,
    nonCritDamage: event.nonCritDamage,
    trace
  }
}

/**
 * Evaluates one explicit direct Moon or stellar-reaction action. The action declaration supplies
 * one damage part and any bounded current-window snapshot; it never derives an aura sequence or
 * a full rotation.
 */
export function evaluateDeclaredSpecialReactionScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredSpecialReactionScenarioEvaluation {
  const {
    activeEffectIds = [],
    activeEffectSourceBuildIds,
    action,
    artifactStatDeltas,
    build,
    buffs,
    enemy,
    enemyCount = 1,
    gameData,
    actionParameters,
    teammates = [],
    moonsignLevel = "none"
  } = input
  assertDeclaredSpecialReactionAction(action)
  const resolvedActionParameters = resolveActionScenarioParameters(action, actionParameters, build.constellation)
  const parts = action.damageParts.map((part) =>
    resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  const {
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
  } = resolveScenarioActionEffectContext({
    action,
    activeEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    ...(artifactStatDeltas === undefined ? {} : { artifactStatDeltas }),
    build,
    buffs,
    enemyCount,
    gameData,
    moonsignLevel,
    resolvedActionParameters,
    teammates
  })
  const actionEffects = resolveCombatActionEffects({
    action,
    activeEffectIds: resolvedActiveEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements: [action.element],
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  })
  const stats = resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    actionEffects
  )
  const part = parts[0]
  if (!part) throw new Error(`Declared special-reaction action ${action.id} did not resolve a damage part`)
  const multiScalingPart = hasResolvedMultipleScalingTerms(part) ? part : undefined
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    ...(multiScalingPart ? { scalingTerms: multiScalingPart.terms } : {}),
    talentMultiplier: multiScalingPart ? null : part.coefficient ?? 0
  }
  const baseDamageTerms = resolveSpecialReactionBaseDamageTerms(action, part, stats.rotation)
  const baseDamage = resolveSpecialReactionBaseDamage(action, part, stats.rotation)
  const result = calculateDirectSpecialReactionDamage(
    resolveDirectSpecialReactionInput(
      action.specialReaction,
      baseDamage,
      baseDamageTerms,
      scenarioStats,
      actionEffects,
      getBuffTotal(buffs, "special_reaction_damage_bonus"),
      enemy.resistance,
      actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      resolvedActionParameters
    )
  )
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects: readonly AppliedCombatActionEffect[] = [
    ...materializeDeferredStatEffects(
      actionEffects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ).filter(isSpecialReactionStatEffect),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ]
  const rotation = createDirectSpecialReactionRotation(action, build.buildId, result, appliedEffects)

  return { appliedEffects, parts, result, rotation, stats: scenarioStats }
}

/** Resolves the shared stat and source context used by direct and standalone transformative action metrics. */
function resolveScenarioActionEffectContext(input: {
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
    input.enemyCount
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
function materializeDeferredStatEffects(
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

function resolveAmplifyingReactionWithActionEffects(
  reaction: CombatActionMetadata["amplifyingReaction"],
  amplifyingReactionBonus: number
): CombatActionMetadata["amplifyingReaction"] {
  if (!reaction) return undefined
  return { ...reaction, bonus: reaction.bonus + amplifyingReactionBonus }
}

/** Adds typed equipment bonuses only to the current direct action's declared Additive-reaction term. */
function resolveAdditiveReactionWithActionEffects(
  reaction: CombatActionMetadata["additiveReaction"],
  reactionDamageBonus: number
): CombatActionMetadata["additiveReaction"] {
  if (!reaction) return undefined
  return { ...reaction, bonus: reaction.bonus + reactionDamageBonus }
}

function resolveDeclaredTimeline(
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
function resolveDeclaredActionEffectElements(
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
function resolveActualDynamicAmplifyingReactionKinds(
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

function createDeclaredRotationEvent(
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
function resolveMatchedActionDamageScalingTerms(
  effects: Pick<ResolvedCombatActionEffects, "matchedActionAdditiveDamageTerms">
): readonly DamageScalingTerm[] {
  return effects.matchedActionAdditiveDamageTerms.map((term) => ({
    coefficient: term.coefficient,
    label: term.label,
    stat: term.scalingStat
  }))
}

/** Builds the legacy direct-result term list without mutating audited character damage-part declarations. */
function createDirectDamageScalingTerms(
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
function appendMatchedActionDamageScalingTerms(
  originalTerms: readonly [DamageScalingTerm, ...DamageScalingTerm[]],
  matchedActionDamageScalingTerms: readonly DamageScalingTerm[]
): readonly [DamageScalingTerm, ...DamageScalingTerm[]] {
  const [first, ...rest] = originalTerms
  return [first, ...rest, ...matchedActionDamageScalingTerms]
}

function createAdditionalDamageRotationEvent(
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

/** Resolves and validates manual integer snapshot inputs declared by one target action. */
export function resolveActionScenarioParameters(
  action: CombatActionMetadata,
  selectedParameters: Readonly<Record<string, number>> | undefined,
  sourceConstellation: number
): ReadonlyMap<string, number> {
  if (!Number.isInteger(sourceConstellation) || sourceConstellation < 0 || sourceConstellation > 6) {
    throw new Error(`Declared action ${action.id} requires a source constellation from 0 to 6`)
  }
  const definitions = action.scenarioParameters ?? []
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]))
  if (definitionsById.size !== definitions.length) {
    throw new Error(`Declared action ${action.id} has duplicate scenario parameter IDs`)
  }
  for (const parameterId of Object.keys(selectedParameters ?? {})) {
    if (!definitionsById.has(parameterId)) {
      throw new Error(`Declared action ${action.id} does not declare scenario parameter ${parameterId}`)
    }
  }

  const resolved = new Map<string, number>()
  for (const definition of definitions) {
    assertScenarioParameterDefinition(action.id, definition)
    const hasSelectedValue = Object.prototype.hasOwnProperty.call(selectedParameters ?? {}, definition.id)
    const range = resolveActionScenarioParameterRange(definition, sourceConstellation)
    const selectedValue = hasSelectedValue ? selectedParameters?.[definition.id] : range.defaultValue
    if (
      typeof selectedValue !== "number" ||
      !Number.isInteger(selectedValue) ||
      selectedValue < range.minimumValue ||
      selectedValue > range.maximumValue ||
      (definition.allowedValues !== undefined && !definition.allowedValues.includes(selectedValue))
    ) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} must be an allowed integer from ${range.minimumValue} to ${range.maximumValue}`
      )
    }
    const requiredConstellation = getScenarioParameterMinimumSourceConstellation(definition, selectedValue)
    if (requiredConstellation !== undefined && sourceConstellation < requiredConstellation) {
      throw new Error(
        `Scenario parameter ${definition.id} value ${selectedValue} for action ${action.id} requires source constellation ` +
          `${requiredConstellation}, but build has constellation ${sourceConstellation}`
      )
    }
    resolved.set(definition.id, selectedValue)
  }
  for (const definition of definitions) {
    const maximumByParameter = definition.maximumValueByParameter
    if (!maximumByParameter) continue
    const sourceValue = resolved.get(maximumByParameter.parameterId)
    const matchingMaximum = maximumByParameter.values.find((entry) => entry.parameterValue === sourceValue)
    if (!matchingMaximum) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} has no maximum for ${maximumByParameter.parameterId}=${sourceValue}`
      )
    }
    const value = resolved.get(definition.id)
    if (value === undefined || value > matchingMaximum.maximumValue) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} must not exceed ${matchingMaximum.maximumValue} when ${maximumByParameter.parameterId}=${sourceValue}`
      )
    }
  }
  return resolved
}

type ActionScenarioParameterDefinition = NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
type ActionScenarioParameterConstellationRange = NonNullable<
  ActionScenarioParameterDefinition["rangeBySourceConstellation"]
>[number]

interface ResolvedActionScenarioParameterRange {
  readonly defaultValue: number
  readonly maximumValue: number
  readonly minimumValue: number
}

/** Resolves the highest applicable constellation-specific bounds for one action snapshot input. */
function resolveActionScenarioParameterRange(
  definition: ActionScenarioParameterDefinition,
  sourceConstellation: number
): ResolvedActionScenarioParameterRange {
  let selectedRange: ActionScenarioParameterConstellationRange | undefined
  for (const candidate of definition.rangeBySourceConstellation ?? []) {
    if (candidate.minimumSourceConstellation > sourceConstellation) continue
    if (
      selectedRange === undefined ||
      candidate.minimumSourceConstellation > selectedRange.minimumSourceConstellation
    ) {
      selectedRange = candidate
    }
  }
  return {
    defaultValue: selectedRange?.defaultValue ?? definition.defaultValue,
    maximumValue: selectedRange?.maximumValue ?? definition.maximumValue,
    minimumValue: selectedRange?.minimumValue ?? definition.minimumValue
  }
}

function assertScenarioParameterDefinition(
  actionId: string,
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
): void {
  if (!definition.id || !Number.isInteger(definition.defaultValue) || !Number.isInteger(definition.minimumValue)) {
    throw new Error(`Scenario parameter declaration for action ${actionId} must use a non-empty integer ID and bounds`)
  }
  if (!Number.isInteger(definition.maximumValue) || definition.minimumValue > definition.maximumValue) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has invalid bounds`)
  }
  if (definition.defaultValue < definition.minimumValue || definition.defaultValue > definition.maximumValue) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range default`)
  }
  const constellationRanges = definition.rangeBySourceConstellation
  if (constellationRanges) {
    const thresholds = new Set<number>()
    for (const range of constellationRanges) {
      if (
        !Number.isInteger(range.minimumSourceConstellation) ||
        range.minimumSourceConstellation < 1 ||
        range.minimumSourceConstellation > 6
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid constellation range threshold`)
      }
      if (thresholds.has(range.minimumSourceConstellation)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate constellation range thresholds`)
      }
      thresholds.add(range.minimumSourceConstellation)
      if (range.defaultValue === undefined && range.maximumValue === undefined && range.minimumValue === undefined) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an empty constellation range`)
      }
      if (
        (range.defaultValue !== undefined && !Number.isInteger(range.defaultValue)) ||
        (range.maximumValue !== undefined && !Number.isInteger(range.maximumValue)) ||
        (range.minimumValue !== undefined && !Number.isInteger(range.minimumValue))
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has non-integer constellation range bounds`)
      }
      const minimumValue = range.minimumValue ?? definition.minimumValue
      const maximumValue = range.maximumValue ?? definition.maximumValue
      const defaultValue = range.defaultValue ?? definition.defaultValue
      if (minimumValue > maximumValue || defaultValue < minimumValue || defaultValue > maximumValue) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has invalid constellation range bounds`)
      }
    }
  }
  if (definition.allowedValues) {
    const allowedValues = new Set<number>()
    for (const value of definition.allowedValues) {
      if (!Number.isInteger(value) || !isScenarioParameterValueWithinAnyDeclaredRange(definition, value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range allowed value`)
      }
      if (allowedValues.has(value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate allowed values`)
      }
      allowedValues.add(value)
    }
    if (!allowedValues.has(definition.defaultValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has a disallowed default`)
    }
    for (const range of constellationRanges ?? []) {
      const defaultValue = range.defaultValue ?? definition.defaultValue
      if (!allowedValues.has(defaultValue)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has a disallowed constellation default`)
      }
    }
  }
  const constellationRequirements = definition.minimumSourceConstellationByValue
  if (constellationRequirements) {
    const gatedValues = new Set<number>()
    for (const requirement of constellationRequirements) {
      if (
        !Number.isInteger(requirement.minimumSourceConstellation) ||
        requirement.minimumSourceConstellation < 1 ||
        requirement.minimumSourceConstellation > 6
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid constellation threshold`)
      }
      if (
        !Number.isInteger(requirement.value) ||
        !isScenarioParameterValueWithinRangeAtConstellation(
          definition,
          requirement.value,
          requirement.minimumSourceConstellation
        )
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range constellation-gated value`)
      }
      if (definition.allowedValues && !definition.allowedValues.includes(requirement.value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} gates a disallowed value`)
      }
      if (gatedValues.has(requirement.value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate constellation-gated values`)
      }
      gatedValues.add(requirement.value)
    }
  }
  const maximumByParameter = definition.maximumValueByParameter
  if (!maximumByParameter) return
  if (!maximumByParameter.parameterId || maximumByParameter.values.length === 0) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid dependent maximum`)
  }
  const sourceValues = new Set<number>()
  for (const entry of maximumByParameter.values) {
    if (!Number.isInteger(entry.parameterValue) || !Number.isInteger(entry.maximumValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has non-integer dependent bounds`)
    }
    if (!isScenarioParameterValueWithinAnyDeclaredRange(definition, entry.maximumValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range dependent maximum`)
    }
    if (sourceValues.has(entry.parameterValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate dependent bounds`)
    }
    sourceValues.add(entry.parameterValue)
  }
}

function isScenarioParameterValueWithinAnyDeclaredRange(
  definition: ActionScenarioParameterDefinition,
  value: number
): boolean {
  if (value >= definition.minimumValue && value <= definition.maximumValue) return true
  return (definition.rangeBySourceConstellation ?? []).some((range) => {
    const minimumValue = range.minimumValue ?? definition.minimumValue
    const maximumValue = range.maximumValue ?? definition.maximumValue
    return value >= minimumValue && value <= maximumValue
  })
}

function isScenarioParameterValueWithinRangeAtConstellation(
  definition: ActionScenarioParameterDefinition,
  value: number,
  sourceConstellation: number
): boolean {
  const range = resolveActionScenarioParameterRange(definition, sourceConstellation)
  return value >= range.minimumValue && value <= range.maximumValue
}

/** Returns the source-constellation threshold for one declared snapshot value, when it has one. */
export function getScenarioParameterMinimumSourceConstellation(
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number],
  value: number
): number | undefined {
  return definition.minimumSourceConstellationByValue?.find((entry) => entry.value === value)?.minimumSourceConstellation
}

function resolveDeclaredEventHitCount(
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

function resolveDeclaredEventCoefficientMultiplier(
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

function multiplyScalingTerms(
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

function resolveDeclaredEventSnapshotTime(
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

function resolveDamagePart(
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

function hasMultipleScalingTerms(part: CombatDamagePart): part is Extract<CombatDamagePart, { readonly scalingTerms: unknown }> {
  return "scalingTerms" in part
}

function hasResolvedMultipleScalingTerms(
  part: DeclaredDirectActionPartEvaluation
): part is DeclaredDirectActionPartEvaluation & {
  readonly terms: readonly [DeclaredDirectActionScalingTermEvaluation, ...DeclaredDirectActionScalingTermEvaluation[]]
} {
  return part.terms !== undefined
}

function resolveScalingTerms(
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

function applyActionParameterEffects(
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

function requireLegacyScalingStat(actionId: string, scalingStat: ScalingStat | undefined): ScalingStat {
  if (!scalingStat) throw new Error(`Declared action ${actionId} must declare a supported scaling stat`)
  return scalingStat
}
