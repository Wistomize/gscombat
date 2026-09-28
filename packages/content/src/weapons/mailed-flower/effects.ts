import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

const trigger = { kind: "any_of", alternatives: [
  prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill"], provider: "source", recipient: "source" }, "前台本人战技命中准备", true),
  prepareWeaponEffect({ kind: "reaction_trigger", provider: "source", recipient: "source" }, "前台本人触发反应准备", true)
] } as const

export const MAILED_FLOWER_AFTER_TRIGGER_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const MAILED_FLOWER_AFTER_TRIGGER_ELEMENTAL_MASTERY = [48, 60, 72, 84, 96] as const

/** Typed selected post-skill-hit-or-reaction contribution of Mailed Flower. */
export const mailedFlowerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic", lifecycle: trigger,
    id: "weapon.mailed-flower.after-skill-hit-or-reaction.attack-percent",
    label: "饰铁之花 · 元素战技命中或触发元素反应后8秒内（攻击力）",
    source: { kind: "weapon", weaponId: "MailedFlower" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: MAILED_FLOWER_AFTER_TRIGGER_ATTACK_PERCENT }
  },
  {
    activation: "automatic", lifecycle: trigger,
    id: "weapon.mailed-flower.after-skill-hit-or-reaction.elemental-mastery",
    label: "饰铁之花 · 元素战技命中或触发元素反应后8秒内（元素精通）",
    source: { kind: "weapon", weaponId: "MailedFlower" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MAILED_FLOWER_AFTER_TRIGGER_ELEMENTAL_MASTERY }
  }
]
