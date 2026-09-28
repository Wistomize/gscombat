import type { CriticalStatsSample, CriticalStatsTransform } from "@gscombat/calculator"
import { getCombatActionEffectDefinition } from "@gscombat/content"

export interface ArtifactCritConversion {
  readonly eventId: string
  readonly ownerId: string
  readonly critRateConverted: number
  readonly critDamageAdded: number
}

export type CriticalSamples = ReadonlyMap<string, CriticalStatsSample>

/** Stable identity retains the owner, including for all-member reaction contributions. */
export function criticalSampleKey(sample: Pick<CriticalStatsSample, "eventId" | "ownerId">): string {
  return JSON.stringify([sample.ownerId, sample.eventId])
}

/** Builds a candidate-local theoretical policy; ordinary evaluations never install it. */
export function artifactCritConversion(
  ownerId: string, setId: string, baseline: CriticalSamples, conversions: ArtifactCritConversion[]
): CriticalStatsTransform {
  return sample => {
    if (sample.ownerId !== ownerId || !sample.appliedEffectIds.some(id => {
      const effect = getCombatActionEffectDefinition(id)
      return effect?.source.kind === "artifact_set" && effect.source.setId === setId &&
        effect.source.minimumPieces === 4 && "target" in effect && effect.target === "critRate" &&
        "value" in effect && effect.value.kind === "fixed" && effect.value.value > 0
    })) return sample
    const before = baseline.get(criticalSampleKey(sample)) ?? baseline.get(criticalSampleKey({
      ...sample, eventId: sample.eventId.replace(/\.remaining-hits$/, "")
    }))
    if (!before) throw new Error(`缺少同事件暴击基准：${sample.eventId}`)
    const delta = Math.max(0, Math.max(0, sample.critRate - 1) - Math.max(0, before.critRate - 1))
    if (delta < 1e-12) return sample
    conversions.push({ eventId: sample.eventId, ownerId, critRateConverted: delta, critDamageAdded: delta * 2 })
    return { critRate: sample.critRate - delta, critDamage: sample.critDamage + delta * 2 }
  }
}
