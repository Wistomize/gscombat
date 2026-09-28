import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const AZURELIGHT_AFTER_SKILL_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const AZURELIGHT_ZERO_ENERGY_CRIT_DAMAGE = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed selected post-skill and zero-energy contributions of Azurelight. */
export const azurelightCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.azurelight.after-skill.attack-percent",
    label: "苍耀 · 施放元素战技后的攻击力",
    source: { kind: "weapon", weaponId: "Azurelight" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: AZURELIGHT_AFTER_SKILL_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.azurelight.after-skill.zero-energy.extra-attack-percent",
    label: "苍耀 · 元素能量为0时的额外攻击力",
    source: { kind: "weapon", weaponId: "Azurelight" },
    target: "attackPercent",
    targetFilter: { recipientCharacterIds: ["Skirk"] },
    value: { kind: "refinement_table", values: AZURELIGHT_AFTER_SKILL_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.azurelight.after-skill.zero-energy.crit-damage",
    label: "苍耀 · 元素能量为0时的暴击伤害",
    source: { kind: "weapon", weaponId: "Azurelight" },
    target: "critDamage",
    targetFilter: { recipientCharacterIds: ["Skirk"] },
    value: { kind: "refinement_table", values: AZURELIGHT_ZERO_ENERGY_CRIT_DAMAGE }
  }
]
