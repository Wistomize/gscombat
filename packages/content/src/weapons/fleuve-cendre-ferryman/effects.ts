import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const FLEUVE_CENDRE_FERRYMAN_SKILL_CRIT_RATE = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const FLEUVE_CENDRE_FERRYMAN_AFTER_SKILL_ENERGY_RECHARGE = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed automatic and selected post-skill contributions of Fleuve Cendre Ferryman. */
export const fleuveCendreFerrymanCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.fleuve-cendre-ferryman.skill-crit-rate",
    label: "灰河渡手 · 元素战技暴击率提升",
    source: { kind: "weapon", weaponId: "FleuveCendreFerryman" },
    target: "critRate",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: FLEUVE_CENDRE_FERRYMAN_SKILL_CRIT_RATE }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人开战技后有效期"),
    id: "weapon.fleuve-cendre-ferryman.after-skill.energy-recharge",
    label: "灰河渡手 · 施放元素战技后5秒内",
    source: { kind: "weapon", weaponId: "FleuveCendreFerryman" },
    target: "energyRecharge",
    value: { kind: "refinement_table", values: FLEUVE_CENDRE_FERRYMAN_AFTER_SKILL_ENERGY_RECHARGE }
  }
]
