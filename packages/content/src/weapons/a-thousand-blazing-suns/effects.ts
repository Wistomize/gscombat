import type { CombatActionEffect } from "../../combat/types.js"

export const A_THOUSAND_BLAZING_SUNS_CRIT_DAMAGE = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const A_THOUSAND_BLAZING_SUNS_ATTACK_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_CRIT_DAMAGE = [0.15, 0.1875, 0.225, 0.2625, 0.3] as const
export const A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_ATTACK_PERCENT = [0.21, 0.2625, 0.315, 0.3675, 0.42] as const

/** Typed selected Blazing Light contributions of A Thousand Blazing Suns. */
export const aThousandBlazingSunsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.a-thousand-blazing-suns.after-skill-or-burst.crit-damage",
    label: "焚曜千阳 · 施放元素战技或元素爆发后的暴击伤害",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "critDamage",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_CRIT_DAMAGE }
  },
  {
    activation: "active",
    id: "weapon.a-thousand-blazing-suns.after-skill-or-burst.attack-percent",
    label: "焚曜千阳 · 施放元素战技或元素爆发后的攻击力",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "weapon.a-thousand-blazing-suns.nightsoul.extra-crit-damage",
    label: "焚曜千阳 · 夜魂加持下焚光的额外暴击伤害",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "critDamage",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_CRIT_DAMAGE }
  },
  {
    activation: "active",
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "weapon.a-thousand-blazing-suns.nightsoul.extra-attack-percent",
    label: "焚曜千阳 · 夜魂加持下焚光的额外攻击力",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_ATTACK_PERCENT }
  }
]
