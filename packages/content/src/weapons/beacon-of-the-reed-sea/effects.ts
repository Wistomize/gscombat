import type { CombatActionEffect } from "../../combat/types.js"

export const BEACON_OF_THE_REED_SEA_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const BEACON_OF_THE_REED_SEA_UNSHIELDED_HP_PERCENT = [0.32, 0.4, 0.48, 0.56, 0.64] as const

/** Typed selected post-hit, post-damage, and unshielded contributions of Beacon of the Reed Sea. */
export const beaconOfTheReedSeaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.beacon-of-the-reed-sea.after-skill-hit.attack-percent",
    label: "苇海信标 · 元素战技命中后8秒内（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "BeaconOfTheReedSea" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BEACON_OF_THE_REED_SEA_ATTACK_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.beacon-of-the-reed-sea.after-taking-damage.attack-percent",
    label: "苇海信标 · 受到伤害后8秒内（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "BeaconOfTheReedSea" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BEACON_OF_THE_REED_SEA_ATTACK_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.beacon-of-the-reed-sea.unshielded.hp-percent",
    label: "苇海信标 · 当前未处于护盾庇护下",
    source: { kind: "weapon", weaponId: "BeaconOfTheReedSea" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: BEACON_OF_THE_REED_SEA_UNSHIELDED_HP_PERCENT }
  }
]
