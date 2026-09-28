import type { CriticalStatsTransform } from "@gscombat/calculator"

/** Adapts event-local special-reaction inputs to the same optional critical policy as ordinary hits. */
export function transformSpecialCriticalStats<T extends { readonly critRate: number; readonly critDamage: number }>(
  stats: T, eventId: string, ownerId: string, appliedEffectIds: readonly string[], transform?: CriticalStatsTransform
): T {
  if (!transform) return stats
  const { critRate, critDamage } = transform({ eventId, ownerId, appliedEffectIds,
    critRate: stats.critRate, critDamage: stats.critDamage })
  return { ...stats, critRate, critDamage }
}
