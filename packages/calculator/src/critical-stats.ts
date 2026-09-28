/** Final, event-local critical inputs for an explicitly supplied counterfactual policy. */
export interface CriticalStatsSample {
  readonly eventId: string
  readonly ownerId: string
  readonly appliedEffectIds: readonly string[]
  readonly critRate: number
  readonly critDamage: number
}

/** Optional calculation input, not a global setting or a game mechanic. */
export type CriticalStatsTransform = (sample: CriticalStatsSample) => Pick<CriticalStatsSample, "critRate" | "critDamage">
