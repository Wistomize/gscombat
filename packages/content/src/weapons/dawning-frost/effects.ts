import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const DAWNING_FROST_AFTER_CHARGED_HIT_ELEMENTAL_MASTERY = [72, 90, 108, 126, 144] as const
export const DAWNING_FROST_AFTER_SKILL_HIT_ELEMENTAL_MASTERY = [48, 60, 72, 84, 96] as const

/** Typed independent charged-hit and skill-hit elemental-mastery windows of Dawning Frost. */
export const dawningFrostCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["charged"], provider: "source", recipient: "source" }, "本人前台重击准备，退场不保留", true),
    id: "weapon.dawning-frost.after-charged-hit.elemental-mastery",
    label: "霜辰 · 重击命中后10秒内",
    source: { kind: "weapon", weaponId: "DawningFrost" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: DAWNING_FROST_AFTER_CHARGED_HIT_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill"], provider: "source", recipient: "source" }, "本人战技命中准备，退场保留"),
    id: "weapon.dawning-frost.after-skill-hit.elemental-mastery",
    label: "霜辰 · 元素战技命中后10秒内",
    source: { kind: "weapon", weaponId: "DawningFrost" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: DAWNING_FROST_AFTER_SKILL_HIT_ELEMENTAL_MASTERY }
  }
]
