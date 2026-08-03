import type { CombatActionEffect } from "../../combat/types.js"

export const RAINBOW_SERPENTS_RAIN_BOW_AFTER_OFF_FIELD_HIT_ATTACK_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed selected post-off-field-hit attack contribution of Rainbow Serpent's Rain Bow. */
export const rainbowSerpentsRainBowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent",
    label: "虹蛇的雨弦 · 后台攻击命中后的攻击力",
    source: { kind: "weapon", weaponId: "RainbowSerpentsRainBow" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: RAINBOW_SERPENTS_RAIN_BOW_AFTER_OFF_FIELD_HIT_ATTACK_PERCENT }
  }
]
