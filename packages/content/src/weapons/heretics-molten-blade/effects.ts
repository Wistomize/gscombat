import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect, withWeaponChoice } from "../../combat/weapon-preparation.js"

export const HERETICS_MOLTEN_BLADE_MAXIMUM_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed maximum on-field movement contribution of Heretic's Molten Blade. */
export const hereticsMoltenBladeCombatActionEffects: readonly CombatActionEffect[] = withWeaponChoice([
  {
    activation: "active",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台开战技；退场立即移除", true),
    exclusivity: { group: "heretics-molten-blade-movement", variant: "maximum" },
    id: "weapon.heretics-molten-blade.after-skill.maximum-movement.attack-percent",
    label: "熔猎异端之刃 · 施放元素战技后上一秒移动距离达到最高档（装备者保持在场）",
    source: { kind: "weapon", weaponId: "HereticsMoltenBlade" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: HERETICS_MOLTEN_BLADE_MAXIMUM_ATTACK_PERCENT }
  },
  {
    activation: "active",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台开战技；退场立即移除", true),
    exclusivity: { group: "heretics-molten-blade-movement", variant: "minimum" },
    id: "weapon.heretics-molten-blade.after-skill.minimum-movement.attack-percent",
    label: "关闭 · 最低移动档",
    source: { kind: "weapon", weaponId: "HereticsMoltenBlade" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: [0.18, 0.225, 0.27, 0.315, 0.36] }
  }
], "heretics-molten-blade-movement", "按充分移动计算", "minimum")
