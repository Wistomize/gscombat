import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const A_THOUSAND_BLAZING_SUNS_CRIT_DAMAGE = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const A_THOUSAND_BLAZING_SUNS_ATTACK_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_CRIT_DAMAGE = [0.15, 0.1875, 0.225, 0.2625, 0.3] as const
export const A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_ATTACK_PERCENT = [0.21, 0.2625, 0.315, 0.3675, 0.42] as const

/** Typed selected Blazing Light contributions of A Thousand Blazing Suns. */
export const aThousandBlazingSunsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可提前施放战技获得焚光"),
    id: "weapon.a-thousand-blazing-suns.after-skill-or-burst.crit-damage",
    label: "焚曜千阳 · 施放元素战技或元素爆发后的暴击伤害",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "critDamage",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_CRIT_DAMAGE }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可提前施放战技获得焚光"),
    id: "weapon.a-thousand-blazing-suns.after-skill-or-burst.attack-percent",
    label: "焚曜千阳 · 施放元素战技或元素爆发后的攻击力",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可提前施放战技获得焚光"), { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "capability", sourceFieldPresence: "any", capability: { kind: "nightsoul_state", provider: "source", recipient: "source" } }, explanation: "本人当前仍能保持夜魂加持；不能用入场能力代替当前状态" }] },
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "weapon.a-thousand-blazing-suns.nightsoul.extra-crit-damage",
    label: "焚曜千阳 · 夜魂加持下焚光的额外暴击伤害",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "critDamage",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_CRIT_DAMAGE }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可提前施放战技获得焚光"), { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "capability", sourceFieldPresence: "any", capability: { kind: "nightsoul_state", provider: "source", recipient: "source" } }, explanation: "本人当前仍能保持夜魂加持；不能用入场能力代替当前状态" }] },
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "weapon.a-thousand-blazing-suns.nightsoul.extra-attack-percent",
    label: "焚曜千阳 · 夜魂加持下焚光的额外攻击力",
    source: { kind: "weapon", weaponId: "AThousandBlazingSuns" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: A_THOUSAND_BLAZING_SUNS_NIGHTSOUL_ATTACK_PERCENT }
  }
]
