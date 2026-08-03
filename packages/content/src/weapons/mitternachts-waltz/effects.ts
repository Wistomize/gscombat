import type { CombatActionEffect } from "../../combat/types.js"

export const MITTERNACHTS_WALTZ_CROSS_TALENT_DAMAGE_BONUS = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected cross-talent contribution of Mitternachts Waltz. */
export const mitternachtsWaltzCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.mitternachts-waltz.after-normal-hit.skill-damage-bonus",
    label: "幽夜华尔兹 · 普通攻击命中后5秒内（元素战技伤害）",
    source: { kind: "weapon", weaponId: "MitternachtsWaltz" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: MITTERNACHTS_WALTZ_CROSS_TALENT_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.mitternachts-waltz.after-skill-hit.normal-damage-bonus",
    label: "幽夜华尔兹 · 元素战技命中后5秒内（普通攻击伤害）",
    source: { kind: "weapon", weaponId: "MitternachtsWaltz" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: MITTERNACHTS_WALTZ_CROSS_TALENT_DAMAGE_BONUS }
  }
]
