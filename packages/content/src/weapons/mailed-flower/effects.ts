import type { CombatActionEffect } from "../../combat/types.js"

export const MAILED_FLOWER_AFTER_TRIGGER_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const MAILED_FLOWER_AFTER_TRIGGER_ELEMENTAL_MASTERY = [48, 60, 72, 84, 96] as const

/** Typed selected post-skill-hit-or-reaction contribution of Mailed Flower. */
export const mailedFlowerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.mailed-flower.after-skill-hit-or-reaction.attack-percent",
    label: "饰铁之花 · 元素战技命中或触发元素反应后8秒内（攻击力）",
    source: { kind: "weapon", weaponId: "MailedFlower" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: MAILED_FLOWER_AFTER_TRIGGER_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.mailed-flower.after-skill-hit-or-reaction.elemental-mastery",
    label: "饰铁之花 · 元素战技命中或触发元素反应后8秒内（元素精通）",
    source: { kind: "weapon", weaponId: "MailedFlower" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MAILED_FLOWER_AFTER_TRIGGER_ELEMENTAL_MASTERY }
  }
]
