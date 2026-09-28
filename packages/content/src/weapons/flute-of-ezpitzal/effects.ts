import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const FLUTE_OF_EZPITZAL_AFTER_SKILL_DEFENSE_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-skill defense contribution of Flute of Ezpitzal. */
export const fluteOfEzpitzalCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.flute-of-ezpitzal.after-skill.defense-percent",
    label: "息燧之笛 · 施放元素战技后15秒内",
    source: { kind: "weapon", weaponId: "FluteOfEzpitzal" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: FLUTE_OF_EZPITZAL_AFTER_SKILL_DEFENSE_PERCENT }
  }
]
