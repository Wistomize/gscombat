import type { CombatActionEffect } from "../../combat/types.js"

export const THRILLING_TALES_OF_DRAGON_SLAYERS_PARTY_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed selected teammate Thrilling Tales switch-window attack contribution. */
export const thrillingTalesOfDragonSlayersCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
    label: "讨龙英杰谭 · 切换至当前角色后的10秒内攻击力（冷却已就绪）",
    source: { holder: "party_member", kind: "weapon", weaponId: "ThrillingTalesOfDragonSlayers" },
    target: "attackPercent",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: THRILLING_TALES_OF_DRAGON_SLAYERS_PARTY_ATTACK_PERCENT }
  }
]
