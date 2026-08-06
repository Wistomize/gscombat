import type {
  ExpectedDamageResult,
  RotationEffectWindow,
  RotationElementalApplication,
  RotationElementOverrideTarget,
  RotationElementOverrideWindow,
  RotationResult,
  ScalingStat,
  SpecialReactionDamageResult,
  SustainedAuraWindow
} from "@gscombat/calculator"
import type { CombatActionMetadata, CombatDirectSpecialReactionConfig, MoonsignLevel } from "@gscombat/content"
import type { ArtifactStat, CharacterBuild, EnemyConfig, ExternalBuff } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import type { AppliedCombatActionEffect } from "../effects/types.js"

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
export interface DeclaredDamageTimelineEvent {
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
export interface DeclaredDamageTimeline {
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
