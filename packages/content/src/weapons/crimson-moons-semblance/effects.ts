import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

const bondPreparation = prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source", hitKinds: ["charged"] }, "本人重击获得25%生命之契；仆人按已确认自身机制达到高档")

export const CRIMSON_MOONS_SEMBLANCE_BOND_DAMAGE_BONUS = [0.12, 0.16, 0.2, 0.24, 0.28] as const
export const CRIMSON_MOONS_SEMBLANCE_HIGH_BOND_DAMAGE_BONUS = [0.36, 0.48, 0.6, 0.72, 0.84] as const

/** Typed selected Bond of Life contributions of Crimson Moon's Semblance. */
export const crimsonMoonsSemblanceCombatActionEffects: readonly CombatActionEffect[] = [
  {
    actionParameterId: "bond-of-life-percent",
    activation: "automatic", lifecycle: bondPreparation,
    id: "weapon.crimson-moons-semblance.charged-hit.bond-of-life",
    label: "赤月之形 · 重击命中后赋予生命值上限25%的生命之契",
    source: { kind: "weapon", weaponId: "CrimsonMoonsSemblance" },
    target: "actionParameter",
    targetFilter: {
      actionIds: [
        "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.no_reaction",
        "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
        "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt"
      ]
    },
    value: { kind: "fixed", value: 25 }
  },
  {
    activation: "automatic", lifecycle: bondPreparation,
    exclusivity: { group: "crimson-moons-semblance-bond", variant: "below-thirty-percent", automaticPriority: 1 },
    id: "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus",
    label: "赤月之形 · 具有低于生命值上限30%的生命之契时造成的伤害",
    source: { kind: "weapon", weaponId: "CrimsonMoonsSemblance" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: CRIMSON_MOONS_SEMBLANCE_BOND_DAMAGE_BONUS }
  },
  {
    activation: "automatic", lifecycle: bondPreparation,
    exclusivity: { group: "crimson-moons-semblance-bond", variant: "at-least-thirty-percent", automaticPriority: 2 },
    id: "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus",
    label: "赤月之形 · 生命之契不低于生命值上限30%时造成的伤害",
    source: { kind: "weapon", weaponId: "CrimsonMoonsSemblance" },
    target: "damageBonus",
    targetFilter: { recipientCharacterIds: ["Arlecchino"] },
    value: { kind: "refinement_table", values: CRIMSON_MOONS_SEMBLANCE_HIGH_BOND_DAMAGE_BONUS }
  }
]
