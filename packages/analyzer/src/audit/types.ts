import type { CharacterCombatCoverage, ReviewedMultiScalingEvidenceRecord } from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

/** Identifies a structural or snapshot-backed problem in a combat registry declaration. */
export type CombatRegistryIntegrityIssueCode =
  | "action-character-mismatch"
  | "additive-reaction-element-mismatch"
  | "conflicting-reaction-declarations"
  | "duplicate-action-id"
  | "duplicate-action-scenario-parameter-id"
  | "duplicate-character-id"
  | "duplicate-character-talent-level-constellation-bonus"
  | "duplicate-element-override-effect-id"
  | "duplicate-metric-id"
  | "duplicate-damage-event-id"
  | "duplicate-damage-part-id"
  | "invalid-damage-event-id"
  | "invalid-damage-event-scenario-parameter"
  | "invalid-damage-event-snapshot"
  | "invalid-damage-event-snapshot-time"
  | "invalid-damage-scaling-term"
  | "invalid-action-capped-stat-to-attack-conversion"
  | "invalid-action-intrinsic-effect"
  | "invalid-character-talent-level-constellation-bonus"
  | "invalid-character-talent-level-constellation-traveler-element"
  | "invalid-traveler-element-eligibility"
  | "invalid-declared-direct-scaling-shape"
  | "invalid-transformative-reaction-declaration"
  | "transformative-reaction-element-mismatch"
  | "invalid-element-override-effect"
  | "invalid-element-override-action"
  | "invalid-element-override-target"
  | "invalid-elemental-application-icd"
  | "invalid-elemental-application-reaction-bonus"
  | "invalid-action-scenario-parameter"
  | "invalid-action-scenario-parameter-reference"
  | "invalid-healing-metric-extension"
  | "invalid-metric-constellation-bonus"
  | "invalid-metric-action-scenario-parameter"
  | "invalid-metric-expression"
  | "invalid-metric-recipient-requirement"
  | "invalid-metric-recipient-target-routing"
  | "invalid-metric-scaling-stat"
  | "invalid-metric-target"
  | "invalid-scalar-metric-scope"
  | "invalid-damage-event-time"
  | "missing-damage-event-part"
  | "missing-damage-events"
  | "missing-damage-part-coefficient-reference"
  | "missing-declared-direct-damage-parts"
  | "missing-effect-duration-parameter"
  | "missing-metric-source-action"
  | "missing-metric-talent-parameter"
  | "missing-raw-parameter"
  | "missing-reviewed-multi-scaling-evidence"
  | "missing-snapshot-character"
  | "reviewed-multi-scaling-evidence-term-mismatch"
  | "reviewed-multi-scaling-evidence-source-mismatch"
  | "missing-talent-parameter-owner"
  | "missing-talent-parameter"
  | "effect-character-mismatch"
  | "effect-duration-snapshot-mismatch"
  | "effect-duration-reference-slot-mismatch"
  | "metric-action-mismatch"
  | "metric-character-mismatch"
  | "metric-parameter-snapshot-mismatch"
  | "metric-talent-reference-slot-mismatch"
  | "talent-coefficient-snapshot-mismatch"
  | "talent-reference-slot-mismatch"
  | "timeline-action-level-reaction-unsupported"
  | "timeline-unsupported-evaluator"
  | "unmapped-declared-damage-part"

/** Describes one actionable failure found while validating authored combat declarations. */
export interface CombatRegistryIntegrityIssue {
  readonly actionId?: string
  readonly actualCoefficient?: number
  readonly actualValue?: number
  readonly characterId: string
  readonly code: CombatRegistryIntegrityIssueCode
  readonly damageEventId?: string
  readonly damagePartId?: string
  readonly expectedCoefficient?: number
  readonly expectedValue?: number
  readonly effectId?: string
  readonly message: string
  readonly metricId?: string
  readonly parameterId?: string
  readonly talentLevel?: number
}

/** Returns every registry declaration error rather than stopping at the first authored mistake. */
export interface CombatRegistryIntegrityReport {
  readonly issues: readonly CombatRegistryIntegrityIssue[]
  readonly isValid: boolean
}

/** Supplies the pinned data snapshot and an optional alternate registry for validation. */
export interface ValidateCombatRegistryIntegrityInput {
  readonly gameData: GameDataRepository
  readonly registry?: readonly CharacterCombatCoverage[]
  readonly reviewedMultiScalingEvidence?: readonly ReviewedMultiScalingEvidenceRecord[]
}
