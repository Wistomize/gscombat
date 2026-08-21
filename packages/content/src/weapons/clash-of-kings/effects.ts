import type { CombatActionEffect } from "../../combat/types.js"

export const CLASH_OF_KINGS_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const CLASH_OF_KINGS_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const

/** Typed post-skill contributions of Clash of Kings. */
export const clashOfKingsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.clash-of-kings.after-skill.attack-percent",
    label: "群王局戏 · 施放元素战技后的攻击力（棋中法度持续期间）",
    source: { kind: "weapon", weaponId: "ClashOfKings" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: CLASH_OF_KINGS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.clash-of-kings.after-skill.elemental-mastery",
    label: "群王局戏 · 施放元素战技后的元素精通（棋中法度持续期间）",
    source: { kind: "weapon", weaponId: "ClashOfKings" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLASH_OF_KINGS_ELEMENTAL_MASTERY }
  }
]
