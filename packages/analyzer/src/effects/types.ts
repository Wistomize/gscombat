import type { AmplifyingReactionConfig, DirectSpecialReactionKind, Element, ScalingStat } from "@gscombat/calculator"
import type {
  CombatActionAdditionalDamageEvent,
  CombatActionEffectTarget,
  CombatActionEffectTargetFilter,
  CombatActionMetadata,
  CombatActionReactionKind
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

/** One content-owned automatic or explicitly selected snapshot contribution resolved for a target action. */
export interface AppliedCombatActionEffect {
  readonly actionParameterId?: string
  /** Present while resolving a capped final-maximum-HP conversion before it is materialized for the UI trace. */
  readonly finalHpMaximumValue?: number
  readonly id: string
  readonly label: string
  /** Present only for a stat term that is added to the selected hit before shared multipliers. */
  readonly scalingStat?: ScalingStat
  /** Source-stat snapshot retained for an auditable special-reaction base-damage term. */
  readonly scalingStatValue?: number
  readonly sourceId: string
  readonly target: CombatActionEffectTarget | "flatAttack" | "talentLevel"
  readonly targetFilter?: CombatActionEffectTargetFilter
  readonly value: number
}

/** An independently evaluated, equipment-owned hit added to one selected core action. */
export interface ResolvedAdditionalDamageEvent {
  readonly canCrit: CombatActionAdditionalDamageEvent["canCrit"]
  readonly critPolicy?: CombatActionAdditionalDamageEvent["critPolicy"]
  readonly coefficient: number
  readonly element: Element
  readonly expectedTriggerProbability: number
  readonly flatDamage?: number
  readonly id: string
  readonly label: string
  readonly reactionPolicy: CombatActionAdditionalDamageEvent["reactionPolicy"]
  readonly scalingStat: CombatActionAdditionalDamageEvent["scalingStat"]
  readonly sourceId: string
}

/** One stat-scaled contribution added to the selected action's existing hit rather than a new hit. */
export interface ResolvedMatchedActionAdditiveDamageTerm {
  readonly coefficient: number
  readonly id: string
  readonly label: string
  readonly scalingStat: ScalingStat
  readonly sourceId: string
}

/** One final-maximum-HP elemental-damage conversion with its independently applied cap. */
export interface ResolvedFinalHpSourcedDamageBonus {
  readonly maximumValue?: number
  readonly multiplier: number
}

/** Stat-stage totals and auditable source entries materialized for the selected action only. */
export interface ResolvedCombatActionEffects {
  readonly additionalDamageEvents: readonly ResolvedAdditionalDamageEvent[]
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  readonly attackPercent: number
  /** Flat addition to character plus weapon Base ATK, multiplied by every applicable ATK% contribution. */
  readonly baseAttackFlat: number
  readonly baseDamageFlat: number
  readonly flatAttack: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  /** Adds to the selected action's configured Vaporize or Melt multiplier bonus. */
  readonly amplifyingReactionBonus: number
  /** Adds only to the selected ordinary reaction's dedicated formula stage. */
  readonly reactionDamageBonus: number
  /** Adds after a selected transformative reaction's level, multiplier, and reaction-bonus calculation. */
  readonly transformativeReactionFlatDamageAddition: number
  /** Adds only to the selected direct Moon or Stellar reaction's dedicated formula stage. */
  readonly specialReactionDamageBonus: number
  /** Adds directly to the selected special-reaction event's base damage before its dedicated multipliers. */
  readonly specialReactionBaseDamageFlat: number
  /** Adds to the selected special-reaction event's independent base-damage-bonus stage. */
  readonly specialReactionBaseDamageBonus: number
  readonly specialReactionFlatDamageAddition: number
  /** Adds to the selected special-reaction event's final elevation stage. */
  readonly specialReactionElevation: number
  readonly defenseFlat: number
  readonly defensePercent: number
  readonly enemyDefenseIgnore: number
  readonly enemyDefenseReduction: number
  readonly enemyResistanceReduction: number
  readonly energyRecharge: number
  readonly elementalMastery: number
  /** Sum of self-owned final-maximum-HP-to-flat-attack ratios, applied after final HP is known. */
  readonly finalHpToFlatAttack: number
  /** Sum of self-owned final-maximum-HP-to-elemental-mastery ratios, applied after final HP is known. */
  readonly finalHpToElementalMastery: number
  /** Sum of self-owned resolved-elemental-mastery-to-flat-attack ratios, applied after the mastery stat stage. */
  readonly finalElementalMasteryToFlatAttack: number
  /** Self-owned final-maximum-HP damage-bonus conversions, each retaining its independent cap. */
  readonly finalHpToDamageBonuses: readonly ResolvedFinalHpSourcedDamageBonus[]
  /** Self-owned final-maximum-HP conversions applied only to the holder's native element. */
  readonly finalHpToOwnElementDamageBonuses: readonly ResolvedFinalHpSourcedDamageBonus[]
  readonly hpFlat: number
  readonly hpPercent: number
  /** Terms appended to eligible existing action hits before that hit's common multipliers. */
  readonly matchedActionAdditiveDamageTerms: readonly ResolvedMatchedActionAdditiveDamageTerm[]
}

/** Input used to derive active effects whose content declaration depends on other active snapshots. */
export interface ResolveDependentActiveEffectIdsInput {
  readonly activeEffectIds: readonly string[]
  /** Explicit source selections remain available for a dependent effect with multiple compatible party owners. */
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  /** When present, deterministic action-state effects are derived without a user-selected snapshot ID. */
  readonly action?: CombatActionMetadata
  readonly primary: CharacterBuild
  readonly teammates: readonly CharacterBuild[]
}

export const EMPTY_COMBAT_ACTION_EFFECTS: ResolvedCombatActionEffects = {
  additionalDamageEvents: [],
  appliedEffects: [],
  attackPercent: 0,
  baseAttackFlat: 0,
  baseDamageFlat: 0,
  flatAttack: 0,
  critDamage: 0,
  critRate: 0,
  damageBonus: 0,
  amplifyingReactionBonus: 0,
  reactionDamageBonus: 0,
  transformativeReactionFlatDamageAddition: 0,
  specialReactionDamageBonus: 0,
  specialReactionBaseDamageFlat: 0,
  specialReactionBaseDamageBonus: 0,
  specialReactionFlatDamageAddition: 0,
  specialReactionElevation: 0,
  defenseFlat: 0,
  defensePercent: 0,
  enemyDefenseIgnore: 0,
  enemyDefenseReduction: 0,
  enemyResistanceReduction: 0,
  energyRecharge: 0,
  elementalMastery: 0,
  finalHpToFlatAttack: 0,
  finalHpToElementalMastery: 0,
  finalElementalMasteryToFlatAttack: 0,
  finalHpToDamageBonuses: [],
  finalHpToOwnElementDamageBonuses: [],
  hpFlat: 0,
  hpPercent: 0,
  matchedActionAdditiveDamageTerms: []
}

export interface ResolveCombatActionEffectCandidatesInput {
  readonly action: CombatActionMetadata
  /** Event-level Vaporize or Melt kinds possible from the scenario's explicit target-aura windows. */
  readonly candidateAmplifyingReactionKinds?: readonly AmplifyingReactionConfig["kind"][]
  /** Ordinary reaction kinds directly declared by the metric or derived from its explicit target setup. */
  readonly candidateReactionKinds?: readonly CombatActionReactionKind[]
  /** Direct Moon or Stellar kinds belonging to the current event class, when the selected action mixes formula paths. */
  readonly candidateSpecialReactionKinds?: readonly DirectSpecialReactionKind[]
  readonly activeEffectIds: readonly string[]
  /** Explicit source-build choices for active effects with multiple eligible party-owned holders. */
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  /** Final elements of every declared target event after source-owned elemental overrides. */
  readonly effectiveElements?: readonly CombatActionMetadata["element"][]
  /** Energy recharge after character, weapon, artifact stats, external buffs, and intervention deltas. */
  readonly baseEnergyRecharge: number
  /** Pinned game data required only by character effects that read a configured talent parameter. */
  readonly gameData?: GameDataRepository
  /** Party-derived Moonsign state used by current-action equipment variants. */
  readonly moonsignLevel?: "none" | "nascent_gleam" | "ascendant_gleam"
  /** Number of enemies configured for the selected action, when an eligible effect needs it. */
  readonly enemyCount?: number
  /** Primary build's native element when known; needed by effects restricted to that element rather than all damage. */
  readonly primaryElement?: CombatActionMetadata["element"]
  readonly primary: CharacterBuild
  /** Final maximum HP keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalHpByBuildId?: ReadonlyMap<string, number>
  /** Final elemental mastery keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalElementalMasteryByBuildId?: ReadonlyMap<string, number>
  /** Final defense keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalDefenseByBuildId?: ReadonlyMap<string, number>
  /** Final attack keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalAttackByBuildId?: ReadonlyMap<string, number>
  /** Number of configured teammates whose elemental identity differs from the primary build. */
  readonly primaryDifferentElementTeammateCount?: number
  /** Number of configured teammates whose elemental identity matches the primary build. */
  readonly primarySameElementTeammateCount?: number
  /** Number of distinct known elements across the configured primary and teammates. */
  readonly teamUniqueElementCount?: number
  /** Native elements of every configured party member, used by element-count conditions. */
  readonly teamElements?: readonly Exclude<Element, "physical">[]
  readonly teammates: readonly CharacterBuild[]
}

/** Input needed to resolve maintained equipment passives and selected character snapshots for one action. */
export interface ResolveCombatActionEffectsInput extends ResolveCombatActionEffectCandidatesInput {
  /** Number of enemies configured for the selected action. */
  readonly enemyCount: number
}

/** Input for resolving only the stat effects that can modify one owned additional damage event. */
export interface ResolveAdditionalDamageEventEffectsInput extends ResolveCombatActionEffectsInput {
  readonly additionalDamageEvent: ResolvedAdditionalDamageEvent
}

/** Input for effects that are always available from the metric source's own equipped weapon or artifact set. */
export interface ResolveSelfAutomaticEquipmentEffectsInput {
  readonly action: CombatActionMetadata
  /** Source energy recharge before any typed equipment effect is applied. */
  readonly baseEnergyRecharge: number
  /** Pinned game data required by fixed character passives sourced from talent parameters. */
  readonly gameData?: GameDataRepository
  /** Include fixed maximum-reachable character stats when building a standalone support-metric source panel. */
  readonly includeMaximumReachableCharacterStatEffects?: boolean
  /** Optional explicit source-action enemy count; when absent, enemy-count passives remain unapplied. */
  readonly enemyCount?: number
  /** Primary build's native element when a self-owned automatic effect needs it. */
  readonly primaryElement?: CombatActionMetadata["element"]
  readonly primary: CharacterBuild
  /** Other configured party members for static composition-gated self passives. */
  readonly teammates?: readonly CharacterBuild[]
  /** Number of configured teammates whose elemental identity differs from the primary build. */
  readonly primaryDifferentElementTeammateCount?: number
  /** Number of configured teammates whose elemental identity matches the primary build. */
  readonly primarySameElementTeammateCount?: number
  /** Number of distinct known elements across the configured primary and teammates. */
  readonly teamUniqueElementCount?: number
}
