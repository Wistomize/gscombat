import type { CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { AnalysisPreparation } from "../core/analysis-preparation.js"
import { resolveBuildElement, resolvePrimaryDifferentElementTeammateCount, resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount } from "../core/build-variant.js"
import type { FieldContext } from "../core/field-presence.js"
import { resolveSelfAutomaticEquipmentEffects } from "../effects/action-effects.js"

/** A single variant's source-only preparation. Recipient stats, active snapshots and conversions stay separate. */
export function prepareSources(primary: CharacterBuild, teammates: readonly CharacterBuild[], action: CombatActionMetadata,
  gameData: GameDataRepository, enemyCount: number, fieldContext: FieldContext,
  preparation = new AnalysisPreparation(gameData)) {
  const party = [primary, ...teammates]
  const teamUniqueElementCount = resolveTeamUniqueElementCount(party, gameData)
  const sources = new Map(party.map((source) => {
    const sourceTeammates = party.filter((build) => build.buildId !== source.buildId)
    const base = preparation.baseStats(source, action.element, gameData)
    const primaryElement = resolveBuildElement(source, gameData)
    const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(source, sourceTeammates, gameData)
    const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(source, sourceTeammates, gameData)
    let automatic: ReturnType<typeof resolveSelfAutomaticEquipmentEffects> | undefined
    return [source, { base, sourceTeammates, primaryElement, primaryDifferentElementTeammateCount,
      primarySameElementTeammateCount, automaticEffects: () => automatic ??= resolveSelfAutomaticEquipmentEffects({
        excludePreparedWeaponChoiceStats: true, action, fieldContext, baseEnergyRecharge: base.energyRecharge,
        enemyCount, gameData, primary: source, teammates: sourceTeammates,
        ...(primaryElement === null ? {} : { primaryElement }),
        ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
        ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
        ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount })
      }) }] as const
  }))
  return { party, teamUniqueElementCount, get(source: CharacterBuild) {
    const prepared = sources.get(source)
    if (!prepared) throw new Error(`Source ${source.buildId} is not owned by this preparation`)
    return prepared
  } }
}

export type SourcePreparation = ReturnType<typeof prepareSources>
