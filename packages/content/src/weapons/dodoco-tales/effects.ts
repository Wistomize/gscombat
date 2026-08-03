import type { CombatActionEffect } from "../../combat/types.js"

export const DODOCO_TALES_CHARGED_DAMAGE_BONUS_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const DODOCO_TALES_ATTACK_PERCENT_BY_REFINEMENT = [0.08, 0.1, 0.12, 0.14, 0.16] as const

/** Typed selected normal-hit and charged-hit contributions of Dodoco Tales. */
export const dodocoTalesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.dodoco-tales.after-normal-hit.charged-damage-bonus",
    label: "嘟嘟可故事集 · 普通攻击命中后（重击伤害）",
    source: { kind: "weapon", weaponId: "DodocoTales" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: DODOCO_TALES_CHARGED_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "active",
    id: "weapon.dodoco-tales.after-charged-hit.attack-percent",
    label: "嘟嘟可故事集 · 重击命中后（攻击力）",
    source: { kind: "weapon", weaponId: "DodocoTales" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: DODOCO_TALES_ATTACK_PERCENT_BY_REFINEMENT }
  }
]
