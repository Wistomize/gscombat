import type {
  ReviewedMultiScalingEvidenceRecord,
  ReviewedMultiScalingEvidenceRegistry
} from "./characters/evidence.js"
import { reviewedMultiScalingEvidenceRecords } from "./registry/reviewed-multi-scaling-evidence.generated.js"

export type {
  ReviewedMultiScalingEvidenceRecord,
  ReviewedMultiScalingEvidenceRegistry,
  ReviewedMultiScalingEvidenceSnapshotCheck,
  ReviewedMultiScalingEvidenceSource,
  ReviewedMultiScalingEvidenceTerm
} from "./characters/evidence.js"

/** Versioned aggregate of character-owned reviewed mappings required by ADR 0010. */
export const reviewedMultiScalingEvidenceRegistry = {
  formatVersion: 1,
  records: reviewedMultiScalingEvidenceRecords
} as const satisfies ReviewedMultiScalingEvidenceRegistry

/** Finds the reviewed evidence for one declared multi-scaling damage part. */
export function getReviewedMultiScalingEvidence(
  actionId: string,
  damagePartId: string
): ReviewedMultiScalingEvidenceRecord | undefined {
  return reviewedMultiScalingEvidenceRecords.find(
    (record) => record.actionId === actionId && record.damagePartId === damagePartId
  )
}
