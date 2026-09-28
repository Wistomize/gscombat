import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected normal-hit and Skill-or-Burst-hit contributions of Solar Pearl. */
export const solarPearlCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["normal"], provider: "source", recipient: "source" }, "前台普通攻击命中准备元素战技与爆发增伤", true),
    id: "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus",
    label: "匣里日月 · 普通攻击命中后（元素战技与元素爆发伤害）",
    source: { kind: "weapon", weaponId: "SolarPearl" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill", "burst"], provider: "source", recipient: "source" }, "前台战技或爆发命中准备普攻增伤", true),
    id: "weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus",
    label: "匣里日月 · 元素战技或元素爆发命中后（普通攻击伤害）",
    source: { kind: "weapon", weaponId: "SolarPearl" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
