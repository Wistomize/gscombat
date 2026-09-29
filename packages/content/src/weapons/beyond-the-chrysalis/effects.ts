import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponSkillOrBurst } from "../../combat/weapon-preparation.js"

/** Timed effects can coexist after consecutive casts; leaving the field clears both and resets the sequence. */
// Reviewed default: prepare both damage-relevant winds; no player-facing sequence selector.
export const beyondTheChrysalisCombatActionEffects: readonly CombatActionEffect[] = [
    {
      activation: "automatic", id: "weapon.beyond-the-chrysalis.both.crit-damage",
      label: "蝶变 · 忠忱之风暴击伤害（退场清除）",
      source: { kind: "weapon", weaponId: "BeyondTheChrysalis" },
      lifecycle: prepareWeaponSkillOrBurst(true),
      target: "critDamage", value: { kind: "refinement_table", values: [0.56, 0.72, 0.88, 1.04, 1.2] }
    },
    {
      activation: "automatic", id: "weapon.beyond-the-chrysalis.both.stellar-swirl",
      label: "蝶变 · 叛弃之风星扩散伤害（退场清除）",
      source: { kind: "weapon", weaponId: "BeyondTheChrysalis" },
      lifecycle: prepareWeaponSkillOrBurst(true),
      target: "specialReactionDamageBonus", targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "refinement_table", values: [0.36, 0.45, 0.54, 0.63, 0.72] }
    }
]
