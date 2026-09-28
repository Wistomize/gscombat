import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect, prepareWeaponHealing } from "../../combat/weapon-preparation.js"

export const FINALE_OF_THE_DEEP_AFTER_SKILL_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const FINALE_OF_THE_DEEP_BOND_OF_LIFE_MAX_HP_RATIO = 0.25
export const FINALE_OF_THE_DEEP_CLEARED_BOND_ATTACK_RATIO = [0.024, 0.03, 0.036, 0.042, 0.048] as const
export const FINALE_OF_THE_DEEP_BOND_CLEARED_AT_CAP_FLAT_ATTACK = [150, 188, 225, 263, 300] as const
const FINALE_OF_THE_DEEP_FULL_CLEAR_FINAL_HP_MULTIPLIER = FINALE_OF_THE_DEEP_CLEARED_BOND_ATTACK_RATIO.map(
  (ratio) => ratio * FINALE_OF_THE_DEEP_BOND_OF_LIFE_MAX_HP_RATIO
)

/** Typed maximum-reachable post-skill attack contribution of Finale of the Deep. */
export const finaleOfTheDeepCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "默认提前施放元素战技"),
    id: "weapon.finale-of-the-deep.after-skill.attack-percent",
    label: "海渊终曲 · 施放元素战技后的攻击力",
    source: { kind: "weapon", weaponId: "FinaleOfTheDeep" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FINALE_OF_THE_DEEP_AFTER_SKILL_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [prepareWeaponHealing(),
      prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "先施放战技获得生命之契，再按充分治疗清除") ] },
    id: "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack",
    label: "海渊终曲 · 25%生命之契完整清除后的攻击力（15秒内）",
    source: { kind: "weapon", weaponId: "FinaleOfTheDeep" },
    target: "finalHpToFlatAttack",
    value: {
      kind: "final_hp",
      maximumValue: { kind: "refinement_table", values: FINALE_OF_THE_DEEP_BOND_CLEARED_AT_CAP_FLAT_ATTACK },
      multiplier: { kind: "refinement_table", values: FINALE_OF_THE_DEEP_FULL_CLEAR_FINAL_HP_MULTIPLIER }
    }
  }
]
