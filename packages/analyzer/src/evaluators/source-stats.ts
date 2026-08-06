import { listCombatActionEffects, type CombatActionMetadata } from "@gscombat/content"
import type { ArtifactStat, CharacterBuild, EvaluationScenario, ExternalBuff } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBaseCombatStats } from "../core/base-stats.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount
} from "../core/build-variant.js"
import {
  listSelectedSourceAttackSnapshotActivationEffectIds, listSelectedSourceDefenseSnapshotActivationEffectIds, resolveCombatActionAttackEffects,
  resolveCombatActionDefenseEffects,
  resolveCombatActionElementalMasteryEffects,
  resolveFinalHpToElementalMastery,
  resolveSelfAutomaticEquipmentEffects,
  resolveSelfMaximumReachableEquipmentStatEffects,
  type ResolvedCombatActionEffects
} from "../effects/action-effects.js"
import { normalizeScenarioEffectSelections } from "../effects/effect-selection.js"
import { resolveTeamState } from "../scenario/team-state.js"
import { getBuffTotal, getDelta, resolvePartyElements } from "./context.js"

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
export function resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId(
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
export function resolveSourceFinalHpByBuildId(
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
export function resolveSourceFinalElementalMasteryByBuildId(
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
export function resolveSourceFinalDefenseByBuildId(
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
  const selectedCharacterDefenseEffectIds = new Set(
    listCombatActionEffects().flatMap((effect) =>
      activeEffectIds.includes(effect.id) &&
      effect.source.kind === "character" &&
      (effect.target === "defenseFlat" || effect.target === "defensePercent")
        ? [effect.id]
        : []
    )
  )
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
        activeEffectIds: [
          ...new Set([
            ...activeEffectIds.filter((effectId) => selectedCharacterDefenseEffectIds.has(effectId)),
            ...sourceDefenseSnapshotActivationEffectIds
          ])
        ],
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
        teamElements: resolvePartyElements(source, sourceTeammates, gameData),
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
export function resolveSourceFinalAttackByBuildId(
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
        gameData,
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
