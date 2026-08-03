import type { CombatActionEffect } from "../../combat/types.js"

export const FREEDOM_SWORN_DAMAGE_BONUS = [0.1, 0.125, 0.15, 0.175, 0.2] as const
export const FREEDOM_SWORN_FULL_SIGIL_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const FREEDOM_SWORN_FULL_SIGIL_NORMAL_CHARGED_PLUNGE_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed self and selected full-sigil team contributions of Freedom-Sworn. */
export const freedomSwornCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.freedom-sworn.damage-bonus",
    label: "苍古自由之誓 · 造成的伤害",
    source: { kind: "weapon", weaponId: "FreedomSworn" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: FREEDOM_SWORN_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "millennial-movement.party-attack-percent", variant: "freedom-sworn" },
    id: "weapon.freedom-sworn.full-sigil.party-attack-percent",
    label: "苍古自由之誓 · 满层奋起之符后12秒内（队伍攻击力）",
    source: { holder: "party_member", kind: "weapon", weaponId: "FreedomSworn" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FREEDOM_SWORN_FULL_SIGIL_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus",
    label: "苍古自由之誓 · 满层奋起之符后12秒内（普通攻击、重击、下落攻击伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "FreedomSworn" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: { kind: "refinement_table", values: FREEDOM_SWORN_FULL_SIGIL_NORMAL_CHARGED_PLUNGE_DAMAGE_BONUS }
  }
]
