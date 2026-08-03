import type { CombatActionEffect } from "../../combat/types.js"

export const THE_ALLEY_FLASH_READY_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected ready-state contribution of The Alley Flash to maintained core actions. */
export const theAlleyFlashCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.the-alley-flash.damage-bonus-ready",
    label: "暗巷闪光 · 当前不处于受伤后5秒失效窗口",
    source: { kind: "weapon", weaponId: "TheAlleyFlash" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: THE_ALLEY_FLASH_READY_DAMAGE_BONUS }
  }
]
