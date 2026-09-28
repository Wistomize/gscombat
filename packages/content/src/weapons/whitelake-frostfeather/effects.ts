import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const WHITELAKE_FROSTFEATHER_THREE_STACK_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const WHITELAKE_FROSTFEATHER_STELLAR_REACTION_CRIT_DAMAGE = [0.5, 0.65, 0.8, 0.95, 1.1] as const

function stackPreparation(stackCount: number) {
  return prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source", hitKinds: ["skill"],
    opportunityWindow: { seconds: 8, minimum: stackCount, measure: "hits", minimumSeparationSeconds: 0.1 }
  }, "八秒内本人战技命中，每次触发间隔至少0.1秒；不因只命中一次就补满层")
}

/** Typed maximum Lake-Hued Lament contribution of Whitelake Frostfeather. */
export const whitelakeFrostfeatherCombatActionEffects: readonly CombatActionEffect[] = [
  ...[1, 2, 3].map((stackCount): CombatActionEffect => (
  {
    activation: "automatic",
    lifecycle: stackPreparation(stackCount),
    exclusivity: { group: "whitelake-stacks", variant: `${stackCount}-stack`, automaticPriority: stackCount },
    id: `weapon.whitelake-frostfeather.lake-hued-lament.${stackCount}-stack.attack-percent`,
    label: `白湖冬羽 · 湖色的哀告${stackCount}层攻击力`,
    source: { kind: "weapon", weaponId: "WhitelakeFrostfeather" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WHITELAKE_FROSTFEATHER_THREE_STACK_ATTACK_PERCENT.map((value) => Number((value * stackCount / 3).toFixed(12))) }
  })),
  {
    activation: "automatic",
    lifecycle: stackPreparation(3),
    id: "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage",
    label: "白湖冬羽 · 湖色的哀告三层时的星烁反应暴击伤害",
    source: { kind: "weapon", weaponId: "WhitelakeFrostfeather" },
    target: "critDamage",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: WHITELAKE_FROSTFEATHER_STELLAR_REACTION_CRIT_DAMAGE }
  }
]
