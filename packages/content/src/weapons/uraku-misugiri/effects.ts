import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const URAKU_MISUGIRI_NORMAL_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const URAKU_MISUGIRI_SKILL_DAMAGE_BONUS = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const URAKU_MISUGIRI_DEFENSE_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed self and selected post-Geo-hit contributions of Uraku Misugiri. */
export const urakuMisugiriCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.uraku-misugiri.normal-damage-bonus",
    label: "有乐御簾切 · 普通攻击伤害",
    source: { kind: "weapon", weaponId: "UrakuMisugiri" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: URAKU_MISUGIRI_NORMAL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "weapon.uraku-misugiri.skill-damage-bonus",
    label: "有乐御簾切 · 元素战技伤害",
    source: { kind: "weapon", weaponId: "UrakuMisugiri" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: URAKU_MISUGIRI_SKILL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "weapon.uraku-misugiri.defense-percent",
    label: "有乐御簾切 · 防御力",
    source: { kind: "weapon", weaponId: "UrakuMisugiri" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: URAKU_MISUGIRI_DEFENSE_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", elements: ["geo"], provider: "party", recipient: "source" }, "队伍具有真实岩伤命中能力"),
    id: "weapon.uraku-misugiri.after-geo-hit.extra-normal-damage-bonus",
    label: "有乐御簾切 · 队伍造成岩元素伤害后的额外普通攻击伤害",
    source: { kind: "weapon", weaponId: "UrakuMisugiri" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: URAKU_MISUGIRI_NORMAL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", elements: ["geo"], provider: "party", recipient: "source" }, "队伍具有真实岩伤命中能力"),
    id: "weapon.uraku-misugiri.after-geo-hit.extra-skill-damage-bonus",
    label: "有乐御簾切 · 队伍造成岩元素伤害后的额外元素战技伤害",
    source: { kind: "weapon", weaponId: "UrakuMisugiri" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: URAKU_MISUGIRI_SKILL_DAMAGE_BONUS }
  }
]
