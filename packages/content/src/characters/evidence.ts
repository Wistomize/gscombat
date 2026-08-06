import type { ScalingStat } from "@gscombat/calculator"

import type { CombatTalentParameterReference } from "../combat/types.js"

/** Locks one reviewed coefficient to its level-one or level-ten pinned snapshot value. */
export interface ReviewedMultiScalingEvidenceSnapshotCheck {
  readonly expectedCoefficient: number
  readonly talentLevel: 1 | 10
}

/** One manually reviewed stat-specific term in a multi-scaling damage part. */
export interface ReviewedMultiScalingEvidenceTerm {
  readonly coefficientMultiplierParameterId?: string
  readonly coefficientMultiplierScenarioParameterId?: string
  readonly coefficientMultiplierSnapshotChecks?: readonly ReviewedMultiScalingEvidenceSnapshotCheck[]
  readonly coefficientParameterId: string
  readonly explanation: string
  readonly groupId: CombatTalentParameterReference["groupId"]
  readonly minimumSourceAscension?: number
  readonly parameterIndex: number
  readonly snapshotChecks: readonly [
    ReviewedMultiScalingEvidenceSnapshotCheck,
    ...ReviewedMultiScalingEvidenceSnapshotCheck[]
  ]
  readonly stat: ScalingStat
  readonly symbol: string
  readonly talentSlot: CombatTalentParameterReference["talentSlot"]
}

/** Immutable source location that reviewers used to map a damage part's scaling terms. */
export interface ReviewedMultiScalingEvidenceSource {
  readonly sourcePath: string
  readonly upstreamCommit: string
  readonly upstreamRepository: string
}

/** A manually reviewed mapping required before a verified action may declare one or more explicit scaling terms. */
export interface ReviewedMultiScalingEvidenceRecord {
  readonly actionId: string
  readonly damagePartId: string
  readonly source: ReviewedMultiScalingEvidenceSource
  readonly terms: readonly [ReviewedMultiScalingEvidenceTerm, ...ReviewedMultiScalingEvidenceTerm[]]
}

/** Versioned registry of reviewed mappings for verified multi-scaling damage parts. */
export interface ReviewedMultiScalingEvidenceRegistry {
  readonly formatVersion: 1
  readonly records: readonly ReviewedMultiScalingEvidenceRecord[]
}
