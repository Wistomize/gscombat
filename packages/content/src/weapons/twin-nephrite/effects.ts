import type { CombatActionEffect } from "../../combat/types.js"

export const TWIN_NEPHRITE_POST_DEFEAT_ATTACK_PERCENT = [0.12, 0.14, 0.16, 0.18, 0.2] as const

/** Typed selected post-defeat attack contribution of Twin Nephrite. */
export const twinNephriteCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.twin-nephrite.after-defeat.attack-percent",
    label: "甲级宝珏 · 击败敌人后的15秒内攻击力",
    source: { kind: "weapon", weaponId: "TwinNephrite" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: TWIN_NEPHRITE_POST_DEFEAT_ATTACK_PERCENT }
  }
]
