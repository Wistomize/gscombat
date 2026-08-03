import type { CombatActionEffect } from "../../combat/types.js"

export const STARCALLERS_WATCH_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const
export const STARCALLERS_WATCH_SHIELDED_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed unconditional and selected shielded contributions of Starcaller's Watch. */
export const starcallersWatchCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.starcallers-watch.elemental-mastery",
    label: "祭星者之望 · 星芒的显迹",
    source: { kind: "weapon", weaponId: "StarcallersWatch" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: STARCALLERS_WATCH_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.starcallers-watch.shielded.damage-bonus",
    label: "祭星者之望 · 当前角色处于护盾庇护下",
    source: { kind: "weapon", weaponId: "StarcallersWatch" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: STARCALLERS_WATCH_SHIELDED_DAMAGE_BONUS }
  }
]
