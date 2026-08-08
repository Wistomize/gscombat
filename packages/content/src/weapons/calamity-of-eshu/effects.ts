import type { CombatActionEffect } from "../../combat/types.js"

export const CALAMITY_OF_ESHU_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const CALAMITY_OF_ESHU_SHIELDED_NORMAL_CHARGED_CRIT_RATE = [0.08, 0.1, 0.12, 0.14, 0.16] as const

/** Typed selected shielded normal-attack and charged-attack contributions of Calamity of Eshu. */
export const calamityOfEshuCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "calamity-of-eshu-shield-state", variant: "shielded" },
    id: "weapon.calamity-of-eshu.shielded.normal-charged-damage-bonus",
    label: "厄水之祸 · 当前角色处于护盾庇护下（普通攻击与重击伤害）",
    source: { kind: "weapon", weaponId: "CalamityOfEshu" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: CALAMITY_OF_ESHU_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "calamity-of-eshu-shield-state", variant: "shielded" },
    id: "weapon.calamity-of-eshu.shielded.normal-charged-crit-rate",
    label: "厄水之祸 · 当前角色处于护盾庇护下（普通攻击与重击暴击率）",
    source: { kind: "weapon", weaponId: "CalamityOfEshu" },
    target: "critRate",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: CALAMITY_OF_ESHU_SHIELDED_NORMAL_CHARGED_CRIT_RATE }
  }
]
