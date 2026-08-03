import type { CombatActionEffect } from "../../combat/types.js"

export const VIVID_NOTIONS_ATTACK_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const VIVID_NOTIONS_DAWN_PLUNGE_CRIT_DAMAGE = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const VIVID_NOTIONS_DUSK_PLUNGE_CRIT_DAMAGE = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed self attack and independently selected Dawn and Dusk plunge contributions of Vivid Notions. */
export const vividNotionsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.vivid-notions.attack-percent",
    label: "溢彩心念 · 攻击力",
    source: { kind: "weapon", weaponId: "VividNotions" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: VIVID_NOTIONS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.vivid-notions.dawn.plunge-crit-damage",
    label: "溢彩心念 · 晨曦状态下落攻击暴击伤害",
    source: { kind: "weapon", weaponId: "VividNotions" },
    target: "critDamage",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "refinement_table", values: VIVID_NOTIONS_DAWN_PLUNGE_CRIT_DAMAGE }
  },
  {
    activation: "active",
    id: "weapon.vivid-notions.dusk.plunge-crit-damage",
    label: "溢彩心念 · 暮色状态下落攻击暴击伤害",
    source: { kind: "weapon", weaponId: "VividNotions" },
    target: "critDamage",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "refinement_table", values: VIVID_NOTIONS_DUSK_PLUNGE_CRIT_DAMAGE }
  }
]
