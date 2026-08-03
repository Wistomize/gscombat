import type { CombatActionEffect } from "../../combat/types.js"

export const TALKING_STICK_PYRO_ATTACHMENT_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const TALKING_STICK_OTHER_ATTACHMENT_ELEMENTAL_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected elemental-attachment contributions of Talking Stick. */
export const talkingStickCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.talking-stick.pyro-attachment.attack-percent",
    label: "聊聊棒 · 承受火元素附着后的攻击力",
    source: { kind: "weapon", weaponId: "TalkingStick" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: TALKING_STICK_PYRO_ATTACHMENT_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus",
    label: "聊聊棒 · 承受水、冰、雷或草元素附着后的所有元素伤害",
    source: { kind: "weapon", weaponId: "TalkingStick" },
    target: "damageBonus",
    targetFilter: { elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] },
    value: { kind: "refinement_table", values: TALKING_STICK_OTHER_ATTACHMENT_ELEMENTAL_DAMAGE_BONUS }
  }
]
