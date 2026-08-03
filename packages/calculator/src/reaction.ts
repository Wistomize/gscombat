/** Reactions whose damage multiplies the triggering hit before ordinary damage bonuses and crit. */
export type AmplifyingReaction =
  | "melt_forward"
  | "melt_reverse"
  | "vaporize_forward"
  | "vaporize_reverse"

/** Fixed action-level assumptions for an amplifying reaction. */
export interface AmplifyingReactionConfig {
  readonly bonus: number
  readonly kind: AmplifyingReaction
}

/** Reactions whose flat reaction damage is added to a triggering direct hit before ordinary damage bonuses and crit. */
export type AdditiveReaction = "aggravate" | "spread"

/** Fixed action-level assumptions for an Aggravate or Spread reaction. */
export interface AdditiveReactionConfig {
  readonly bonus: number
  readonly kind: AdditiveReaction
}

const baseMultiplierByAmplifyingReaction: Readonly<Record<AmplifyingReaction, number>> = {
  melt_forward: 2,
  melt_reverse: 1.5,
  vaporize_forward: 2,
  vaporize_reverse: 1.5
}

const baseMultiplierByAdditiveReaction: Readonly<Record<AdditiveReaction, number>> = {
  aggravate: 1.15,
  spread: 1.25
}

const reactionBaseDamageByLevel: readonly number[] = [
  17.165606, 18.535048, 19.904854, 21.274902, 22.6454, 24.649612, 26.640044, 28.868587, 31.36768, 34.143345,
  37.201, 40.66, 44.446667, 48.56352, 53.74848, 59.081898, 64.420044, 69.72446, 75.12314, 80.58478,
  86.11203, 91.70374, 97.24463, 102.812645, 108.40956, 113.20169, 118.102905, 122.97932, 129.72733, 136.29291,
  142.67085, 149.02902, 155.41699, 161.8255, 169.10631, 176.51808, 184.07274, 191.70952, 199.55692, 207.38205,
  215.3989, 224.16566, 233.50217, 243.35057, 256.06308, 268.5435, 281.52606, 295.01364, 309.0672, 323.6016,
  336.75754, 350.5303, 364.4827, 378.61917, 398.6004, 416.39825, 434.387, 452.95105, 472.60623, 492.8849,
  513.56854, 539.1032, 565.51056, 592.53876, 624.4434, 651.47015, 679.4968, 707.79407, 736.67145, 765.64026,
  794.7734, 824.67737, 851.1578, 877.74207, 914.2291, 946.74677, 979.4114, 1011.223, 1044.7917, 1077.4437,
  1109.9976, 1142.9766, 1176.3695, 1210.1844, 1253.8357, 1288.9528, 1325.4841, 1363.4569, 1405.0974, 1446.8535
]

/** Returns the intrinsic Melt or Vaporize multiplier before elemental mastery and reaction bonuses. */
export function getAmplifyingReactionBaseMultiplier(reaction: AmplifyingReaction): number {
  return baseMultiplierByAmplifyingReaction[reaction]
}

/** Resolves the complete Melt or Vaporize multiplier for one triggering hit. */
export function calculateAmplifyingReactionMultiplier(
  elementalMastery: number,
  reaction: AmplifyingReactionConfig
): number {
  const masteryBonus = (2.78 * elementalMastery) / (elementalMastery + 1400)
  return getAmplifyingReactionBaseMultiplier(reaction.kind) * (1 + masteryBonus + reaction.bonus)
}

/** Returns the level-scaled reaction base damage shared by additive and transformative reactions. */
export function getReactionBaseDamage(level: number): number {
  const index = clamp(Math.trunc(level), 1, reactionBaseDamageByLevel.length) - 1
  return reactionBaseDamageByLevel[index] ?? 0
}

/** Returns the intrinsic Aggravate or Spread multiplier before elemental mastery and reaction bonuses. */
export function getAdditiveReactionBaseMultiplier(reaction: AdditiveReaction): number {
  return baseMultiplierByAdditiveReaction[reaction]
}

/** Resolves the flat Aggravate or Spread damage added to one triggering direct-damage hit. */
export function calculateAdditiveReactionDamage(
  level: number,
  elementalMastery: number,
  reaction: AdditiveReactionConfig
): number {
  const masteryBonus = (5 * elementalMastery) / (elementalMastery + 1200)
  return getReactionBaseDamage(level) * getAdditiveReactionBaseMultiplier(reaction.kind) * (1 + masteryBonus + reaction.bonus)
}

/** Narrows a rotation reaction name to the amplifying-reaction family. */
export function isAmplifyingReaction(reaction: string): reaction is AmplifyingReaction {
  return reaction in baseMultiplierByAmplifyingReaction
}

/** Narrows a reaction name to the additive-reaction family. */
export function isAdditiveReaction(reaction: string): reaction is AdditiveReaction {
  return reaction in baseMultiplierByAdditiveReaction
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
