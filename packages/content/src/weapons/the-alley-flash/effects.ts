import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const THE_ALLEY_FLASH_READY_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected ready-state contribution of The Alley Flash to maintained core actions. */
const authoredEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.the-alley-flash.damage-bonus-ready",
    label: "暗巷闪光 · 当前不处于受伤后5秒失效窗口",
    source: { kind: "weapon", weaponId: "TheAlleyFlash" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: THE_ALLEY_FLASH_READY_DAMAGE_BONUS }
  }
]

export const theAlleyFlashCombatActionEffects: readonly CombatActionEffect[] = authoredEffects.flatMap((effect) =>
  effect.activation === "active" ? withWeaponToggle(effect, "the-alley-flash-ready", "最近 5 秒受到伤害", false).map((variant) => {
    // Keep legacy ready/disabled IDs tied to their original numeric meaning; only the exposed question is inverted.
    const injured = variant.id.endsWith(".disabled")
    const choiceVariant = injured ? "on" : "off"
    return { ...variant, exclusivity: { ...variant.exclusivity!, variant: choiceVariant },
      weaponChoice: { ...variant.weaponChoice!, variant: choiceVariant, defaultVariant: "off",
        variantLabel: injured ? "是（增伤失效）" : "否（增伤生效）" } }
  }) : [effect]
)
