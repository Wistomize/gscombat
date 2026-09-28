import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const THE_BELL_SHIELDED_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected shielded-state damage contribution of The Bell. */
export const theBellCombatActionEffects: readonly CombatActionEffect[] = withWeaponToggle(
  {
    activation: "active",
    selectionMode: "optional",
    requiresSourceOnField: true,
    id: "weapon.the-bell.shielded.damage-bonus",
    label: "钟剑 · 处于护盾庇护下的全伤害",
    source: { kind: "weapon", weaponId: "TheBell" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: THE_BELL_SHIELDED_DAMAGE_BONUS }
  }
, "the-bell-shield", "已受击触发钟剑护盾", false).map((effect) => ({ ...effect,
  weaponChoice: { ...effect.weaponChoice!, defaultVariantByCharacter: { Dehya: "on" },
    automaticVariant: { variant: "on", capability: { kind: "shield", provider: "party", recipient: "source" } } }
}))
