import type { CombatActionEffect } from "../../combat/types.js"

export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const
export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ELEMENTAL_MASTERY = [240, 300, 360, 420, 480] as const
export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_STELLAR_DAMAGE_BONUS = [0.56, 0.7, 0.84, 0.98, 1.12] as const

const amplifyingReactionKinds = ["melt_forward", "melt_reverse", "vaporize_forward", "vaporize_reverse"] as const
const ordinaryReactionKinds = [
  "aggravate",
  "bloom",
  "burning",
  "burgeon",
  "electro_charged",
  "hyperbloom",
  "overload",
  "shatter",
  "spread",
  "superconduct",
  "swirl"
] as const

/** Typed maximum current-song plus counterpoint variants of Forged by the Golden Melody. */
export const forgedByTheGoldenMelodyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: "1-attack" },
    id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.attack-percent",
    label: "金律铸影 · 攻击力乐章与同类复调叠加",
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: "2-elemental-mastery" },
    id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.amplifying.elemental-mastery",
    label: "金律铸影 · 元素精通乐章与同类复调叠加（蒸发/融化）",
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: "elementalMastery",
    targetFilter: { amplifyingReactionKinds },
    value: { kind: "refinement_table", values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: "2-elemental-mastery" },
    id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.ordinary.elemental-mastery",
    label: "金律铸影 · 元素精通乐章与同类复调叠加（普通元素反应）",
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: "elementalMastery",
    targetFilter: { reactionKinds: ordinaryReactionKinds },
    value: { kind: "refinement_table", values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: "3-stellar-reaction" },
    id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.stellar-reaction-damage-bonus",
    label: "金律铸影 · 星烁反应伤害乐章与同类复调叠加",
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_STELLAR_DAMAGE_BONUS }
  }
]
