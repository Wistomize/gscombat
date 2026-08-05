import type { Element } from "@gscombat/calculator"
import {
  canEnterNightsoulBlessing,
  getCharacterBurstEnergyCost,
  getCombatActionDefinition,
  hasHexereiSecretRite,
  isCombatActionEffectApplicable,
  listCombatActionEffects,
  resolveMaximumNightsoulBurstTriggers,
  supportedWeapons,
  type CombatActionEffect
} from "@gscombat/content"
import { getWeaponComparisonRefinement, type ArtifactStat, type EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { evaluateScenario } from "./scenario.js"
import { resolveTeamState } from "./team-state.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount
} from "./build-variant.js"

interface AnalyzableSubstat {
  readonly gameDataStat: string
  readonly label: string
  readonly stat: ArtifactStat
}

interface MarginalStatCandidate {
  readonly averageRoll: number
  readonly label: string
  readonly stat: ArtifactStat
}

export interface MarginalSubstatResult {
  readonly averageRoll: number
  readonly deltaDamage: number
  readonly gainRatio: number
  readonly label: string
  readonly stat: ArtifactStat
  readonly weight: number
}

export interface EffectiveArtifactResult {
  readonly artifactId: string
  readonly effectiveRolls: number
  readonly slot: EvaluationScenario["primary"]["artifacts"][number]["slot"]
}

export interface WeaponComparisonResult {
  /** Expected damage of the unchanged selected core action. */
  readonly expectedDamage: number
  readonly gainRatio: number
  readonly label: string
  readonly rarity: number
  readonly refinement: number
  readonly weaponId: string
}

export interface ProgressionGainResult {
  readonly deltaDamage: number
  readonly gainRatio: number
  readonly id: string
  readonly label: string
  readonly weight: number
}

export interface AnalyzeScenarioOptions {
  readonly weaponComparisonRefinements?: Readonly<Record<string, number>>
}

export interface ScenarioAnalysis {
  /** Expected damage of the unchanged selected core action. */
  readonly baselineExpectedDamage: number
  readonly effectiveArtifacts: readonly EffectiveArtifactResult[]
  readonly marginalSubstats: readonly MarginalSubstatResult[]
  readonly progressionGains: readonly ProgressionGainResult[]
  readonly totalEffectiveRolls: number
  readonly weapons: readonly WeaponComparisonResult[]
}

const analyzableSubstats: readonly AnalyzableSubstat[] = [
  { gameDataStat: "hp", label: "生命值", stat: "hp" },
  { gameDataStat: "hp_", label: "生命值%", stat: "hp_percent" },
  { gameDataStat: "atk", label: "攻击力", stat: "atk" },
  { gameDataStat: "atk_", label: "攻击力%", stat: "atk_percent" },
  { gameDataStat: "def", label: "防御力", stat: "def" },
  { gameDataStat: "def_", label: "防御力%", stat: "def_percent" },
  { gameDataStat: "eleMas", label: "元素精通", stat: "elemental_mastery" },
  { gameDataStat: "enerRech_", label: "元素充能效率", stat: "energy_recharge" },
  { gameDataStat: "critRate_", label: "暴击率", stat: "crit_rate" },
  { gameDataStat: "critDMG_", label: "暴击伤害", stat: "crit_damage" }
]

const elementalDamageBonusMarginals: Readonly<Record<Element, Omit<MarginalStatCandidate, "averageRoll">>> = {
  anemo: { label: "风元素伤害加成", stat: "anemo_damage_bonus" },
  cryo: { label: "冰元素伤害加成", stat: "cryo_damage_bonus" },
  dendro: { label: "草元素伤害加成", stat: "dendro_damage_bonus" },
  electro: { label: "雷元素伤害加成", stat: "electro_damage_bonus" },
  geo: { label: "岩元素伤害加成", stat: "geo_damage_bonus" },
  hydro: { label: "水元素伤害加成", stat: "hydro_damage_bonus" },
  physical: { label: "物理伤害加成", stat: "physical_damage_bonus" },
  pyro: { label: "火元素伤害加成", stat: "pyro_damage_bonus" }
}

function average(values: readonly number[]): number {
  if (values.length === 0) throw new Error("Cannot calculate an average from an empty list")
  return values.reduce((total, value) => total + value, 0) / values.length
}

function getAverageRolls(gameData: GameDataRepository): ReadonlyMap<ArtifactStat, number> {
  return new Map(
    analyzableSubstats.map(({ gameDataStat, stat }) => [stat, average(gameData.getArtifactSubstatRolls(5, gameDataStat))])
  )
}

function analyzeMarginalSubstats(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  baselineExpectedDamage: number,
  averageRolls: ReadonlyMap<ArtifactStat, number>
): readonly MarginalSubstatResult[] {
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (!action) throw new Error(`Target action ${scenario.targetActionId} is not registered`)
  const candidates: readonly MarginalStatCandidate[] = [
    ...analyzableSubstats.map(({ label, stat }) => ({ averageRoll: averageRolls.get(stat) ?? 0, label, stat })),
    { averageRoll: 0.05, ...elementalDamageBonusMarginals[action.element] }
  ]
  const rawResults = candidates.map(({ averageRoll, label, stat }) => {
    const expectedDamage = evaluateScenario(scenario, gameData, {
      artifactStatDeltas: { [stat]: averageRoll }
    }).actionExpectedDamage
    const deltaDamage = expectedDamage - baselineExpectedDamage
    return {
      averageRoll,
      deltaDamage,
      gainRatio: baselineExpectedDamage === 0 ? 0 : deltaDamage / baselineExpectedDamage,
      label,
      stat
    }
  })
  const bestGain = Math.max(...rawResults.map((result) => result.gainRatio), 0)
  return rawResults
    .map((result) => ({ ...result, weight: bestGain === 0 ? 0 : Math.max(result.gainRatio, 0) / bestGain }))
    .sort((left, right) => right.gainRatio - left.gainRatio)
}

function analyzeEffectiveArtifacts(
  scenario: EvaluationScenario,
  averageRolls: ReadonlyMap<ArtifactStat, number>,
  marginalSubstats: readonly MarginalSubstatResult[]
): readonly EffectiveArtifactResult[] {
  const weights = new Map(marginalSubstats.map((result) => [result.stat, result.weight]))
  return scenario.primary.artifacts.map((artifact) => ({
    artifactId: artifact.id,
    effectiveRolls: artifact.substats.reduce((total, substat) => {
      const averageRoll = averageRolls.get(substat.stat)
      if (!averageRoll) return total
      return total + (substat.value / averageRoll) * (weights.get(substat.stat) ?? 0)
    }, 0),
    slot: artifact.slot
  }))
}

interface CandidateActiveEffects {
  readonly activeEffectIds: string[]
  readonly activeEffectSourceBuildIds?: Record<string, string>
}

function getCandidateActiveEffects(
  scenario: EvaluationScenario,
  candidateWeaponId: string
): CandidateActiveEffects {
  const activeEffectSourceBuildIds = { ...(scenario.conditions.activeEffectSourceBuildIds ?? {}) }
  const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
  const activeEffectIds = scenario.conditions.activeEffectIds.filter((effectId) => {
    const effect = effectsById.get(effectId)
    if (effect?.activation !== "active" || effect.source.kind !== "weapon") return true

    if (effect.source.resolveAllMatchingPartySources === true) {
      delete activeEffectSourceBuildIds[effectId]
      return hasCandidateWeaponEffectSource(scenario, candidateWeaponId, effect.source)
    }
    const sourceBuildId = resolveCurrentWeaponEffectSourceBuildId(scenario, effectId, effect.source)
    const sourceIsPrimary = sourceBuildId === scenario.primary.buildId
    if (effect.source.holder === "party_member" && sourceBuildId !== undefined && !sourceIsPrimary) {
      activeEffectSourceBuildIds[effectId] = sourceBuildId
      return true
    }
    if (effect.source.weaponId !== candidateWeaponId) {
      delete activeEffectSourceBuildIds[effectId]
      return false
    }
    activeEffectSourceBuildIds[effectId] = scenario.primary.buildId
    return true
  })

  const selectedEffectIds = new Set(activeEffectIds)
  for (const effectId of Object.keys(activeEffectSourceBuildIds)) {
    if (!selectedEffectIds.has(effectId)) delete activeEffectSourceBuildIds[effectId]
  }
  return {
    activeEffectIds,
    ...(Object.keys(activeEffectSourceBuildIds).length === 0 ? {} : { activeEffectSourceBuildIds })
  }
}

function hasCandidateWeaponEffectSource(
  scenario: EvaluationScenario,
  candidateWeaponId: string,
  source: Extract<CombatActionEffect["source"], { readonly kind: "weapon" }>
): boolean {
  if (candidateWeaponId === source.weaponId) return true
  if (source.holder !== "party_member") return false
  return scenario.teammates.some((build) => build.weapon.weaponId === source.weaponId)
}

function resolveCurrentWeaponEffectSourceBuildId(
  scenario: EvaluationScenario,
  effectId: string,
  source: Extract<CombatActionEffect["source"], { readonly kind: "weapon" }>
): string | undefined {
  const sourceCandidates = (source.holder === "party_member" ? [scenario.primary, ...scenario.teammates] : [scenario.primary]).filter(
    (build) => build.weapon.weaponId === source.weaponId
  )
  const selectedSourceBuildId = scenario.conditions.activeEffectSourceBuildIds?.[effectId]
  if (selectedSourceBuildId !== undefined) {
    return sourceCandidates.some((build) => build.buildId === selectedSourceBuildId) ? selectedSourceBuildId : undefined
  }
  return sourceCandidates.length === 1 ? sourceCandidates[0]?.buildId : undefined
}

function matchesEffectCondition(
  effect: CombatActionEffect,
  scenario: EvaluationScenario,
  gameData: GameDataRepository
): boolean {
  if (!effect.condition) return true
  if (effect.condition.kind === "hexerei_secret_rite") {
    return hasHexereiSecretRite([scenario.primary, ...scenario.teammates].map((build) => build.characterId))
  }
  if (effect.condition.kind === "moonsign_level") {
    const rank = { ascendant_gleam: 2, nascent_gleam: 1, none: 0 } as const
    const moonsignLevel = resolveTeamState(scenario.primary, scenario.teammates, gameData).moonsign.level
    return rank[moonsignLevel] >= rank[effect.condition.minimum]
  }
  if (effect.condition.kind === "source_nightsoul_blessing") return true
  if (effect.condition.kind === "primary_nightsoul_blessing") {
    return canEnterNightsoulBlessing(scenario.primary) === effect.condition.required
  }
  if (effect.condition.kind === "team_nightsoul_burst") {
    return (
      resolveMaximumNightsoulBurstTriggers(
        [scenario.primary, ...scenario.teammates],
        effect.condition.windowSeconds
      ) >= effect.condition.minimumTriggers
    )
  }
  if (effect.condition.kind === "team_element_count") {
    const condition = effect.condition
    const elements = [scenario.primary, ...scenario.teammates].flatMap((build) => {
      const element = resolveBuildElement(build, gameData)
      return element === null ? [] : [element]
    })
    const count = elements.filter((element) => condition.elements.some((candidate) => candidate === element)).length
    return count >= condition.minimum && (condition.maximum === undefined || count <= condition.maximum)
  }
  if (effect.condition.kind === "team_element_subset") {
    const condition = effect.condition
    const elements = [scenario.primary, ...scenario.teammates].flatMap((build) => {
      const element = resolveBuildElement(build, gameData)
      return element === null || element === "physical" ? [] : [element]
    })
    if (elements.length !== scenario.teammates.length + 1) return false
    if (!elements.every((element) => condition.allowedElements.includes(element))) return false
    return condition.requiredElements?.every((required) => elements.includes(required)) ?? true
  }
  if (effect.condition.kind === "team_unique_element_count") {
    const count = resolveTeamUniqueElementCount([scenario.primary, ...scenario.teammates], gameData)
    return count !== null && count >= effect.condition.minimum
  }
  if (effect.condition.kind === "primary_different_element_teammate_count") {
    const count = resolvePrimaryDifferentElementTeammateCount(scenario.primary, scenario.teammates, gameData)
    if (count === null || count < effect.condition.minimum) return false
    return effect.condition.maximum === undefined || count <= effect.condition.maximum
  }
  if (effect.condition.kind === "primary_same_element_teammate_count") {
    const count = resolvePrimarySameElementTeammateCount(scenario.primary, scenario.teammates, gameData)
    if (count === null || count < effect.condition.minimum) return false
    return effect.condition.maximum === undefined || count <= effect.condition.maximum
  }
  if (effect.condition.minimum !== undefined && scenario.conditions.enemyCount < effect.condition.minimum) return false
  return effect.condition.maximum === undefined || scenario.conditions.enemyCount <= effect.condition.maximum
}

function canResolveFullPartyBurstEnergyCosts(scenario: EvaluationScenario): boolean {
  const party = [scenario.primary, ...scenario.teammates]
  if (party.length !== 4) return false
  return party.every((build) => {
    try {
      return getCharacterBurstEnergyCost(build) !== undefined
    } catch {
      return false
    }
  })
}

function canEvaluateCandidateWeapon(
  scenario: EvaluationScenario,
  candidateWeaponId: string,
  candidateActiveEffectIds: readonly string[],
  gameData: GameDataRepository
): boolean {
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (!action) return true
  const hasUnavailableTeamEnergyEffect = listCombatActionEffects().some((effect) => {
    if (effect.target === "additionalDamageEvent" || effect.value.kind !== "team_burst_energy_cost") return false
    if (effect.source.kind !== "weapon" || effect.source.weaponId !== candidateWeaponId) return false
    if (effect.activation === "active" && !candidateActiveEffectIds.includes(effect.id)) return false
    return isCombatActionEffectApplicable(effect, action) && matchesEffectCondition(effect, scenario, gameData)
  })
  return !hasUnavailableTeamEnergyEffect || canResolveFullPartyBurstEnergyCosts(scenario)
}

function analyzeWeapons(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  baselineExpectedDamage: number,
  refinementOverrides: Readonly<Record<string, number>>
): readonly WeaponComparisonResult[] {
  const primaryCharacter = gameData.getCharacter(scenario.primary.characterId)
  if (!primaryCharacter) throw new Error(`Missing primary character in game data: ${scenario.primary.characterId}`)
  return supportedWeapons
    .filter(
      (weapon) =>
        (weapon.rarity === 4 || weapon.rarity === 5) &&
        weapon.weaponType === primaryCharacter.weaponType &&
        gameData.getWeaponStat(weapon.weaponId, "atk", 90, 6) !== undefined
    )
    .flatMap((weapon) => {
      const refinement = refinementOverrides[weapon.weaponId] ?? getWeaponComparisonRefinement(weapon.rarity)
      const candidateActiveEffects = getCandidateActiveEffects(scenario, weapon.weaponId)
      if (!canEvaluateCandidateWeapon(scenario, weapon.weaponId, candidateActiveEffects.activeEffectIds, gameData)) return []
      const candidateScenario: EvaluationScenario = {
        ...scenario,
        conditions: {
          ...scenario.conditions,
          ...candidateActiveEffects
        },
        primary: {
          ...scenario.primary,
          weapon: { ascension: 6, level: 90, refinement, weaponId: weapon.weaponId }
        }
      }
      const expectedDamage = evaluateScenario(candidateScenario, gameData).actionExpectedDamage
      return [
        {
          expectedDamage,
          gainRatio: baselineExpectedDamage === 0 ? 0 : expectedDamage / baselineExpectedDamage - 1,
          label: weapon.label,
          rarity: weapon.rarity,
          refinement,
          weaponId: weapon.weaponId
        }
      ]
    })
    .sort((left, right) => right.expectedDamage - left.expectedDamage)
}

function analyzeProgressionGains(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  baselineExpectedDamage: number
): readonly ProgressionGainResult[] {
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (!action) return []
  const interventions: { readonly id: string; readonly label: string; readonly scenario: EvaluationScenario }[] = []
  const talentLabels = { burst: "元素爆发", normal: "普通攻击", skill: "元素战技" } as const
  const talentSlots = new Set(
    (action.parameterReferences ?? []).flatMap((reference) =>
      reference.source === "talent" && reference.talentSlot !== "passive" ? [reference.talentSlot] : []
    )
  )
  for (const talentSlot of talentSlots) {
    const currentLevel = scenario.primary.talents[talentSlot]
    if (currentLevel >= 10) continue
    interventions.push({
      id: `talent.${talentSlot}.${currentLevel + 1}`,
      label: `${talentLabels[talentSlot]}提升至 ${currentLevel + 1} 级`,
      scenario: {
        ...scenario,
        primary: {
          ...scenario.primary,
          talents: { ...scenario.primary.talents, [talentSlot]: currentLevel + 1 }
        }
      }
    })
  }
  for (const targetLevel of [90, 95, 100] as const) {
    if (scenario.primary.level >= targetLevel) continue
    interventions.push({
      id: `character-level.${targetLevel}`,
      label: `角色等级提升至 ${targetLevel} 级`,
      scenario: {
        ...scenario,
        primary: { ...scenario.primary, ascension: 6, level: targetLevel }
      }
    })
  }
  const rawResults = interventions.map((intervention) => {
    const expectedDamage = evaluateScenario(intervention.scenario, gameData).actionExpectedDamage
    const deltaDamage = expectedDamage - baselineExpectedDamage
    return {
      deltaDamage,
      gainRatio: baselineExpectedDamage === 0 ? 0 : deltaDamage / baselineExpectedDamage,
      id: intervention.id,
      label: intervention.label
    }
  })
  const bestGain = Math.max(...rawResults.map((result) => result.gainRatio), 0)
  return rawResults.map((result) => ({
    ...result,
    weight: bestGain === 0 ? 0 : Math.max(result.gainRatio, 0) / bestGain
  }))
}

/** Runs fixed-scenario counterfactual analysis for weapons and artifact substats. */
export function analyzeScenario(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  options: AnalyzeScenarioOptions = {}
): ScenarioAnalysis {
  const baselineExpectedDamage = evaluateScenario(scenario, gameData).actionExpectedDamage
  const averageRolls = getAverageRolls(gameData)
  const marginalSubstats = analyzeMarginalSubstats(scenario, gameData, baselineExpectedDamage, averageRolls)
  const effectiveArtifacts = analyzeEffectiveArtifacts(scenario, averageRolls, marginalSubstats)
  return {
    baselineExpectedDamage,
    effectiveArtifacts,
    marginalSubstats,
    progressionGains: analyzeProgressionGains(scenario, gameData, baselineExpectedDamage),
    totalEffectiveRolls: effectiveArtifacts.reduce((total, artifact) => total + artifact.effectiveRolls, 0),
    weapons: analyzeWeapons(scenario, gameData, baselineExpectedDamage, options.weaponComparisonRefinements ?? {})
  }
}
