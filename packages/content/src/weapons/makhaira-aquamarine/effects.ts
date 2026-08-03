import type { CombatActionEffect } from "../../combat/types.js"

export const MAKHAIRA_AQUAMARINE_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const MAKHAIRA_AQUAMARINE_OTHER_PARTY_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT =
  MAKHAIRA_AQUAMARINE_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT.map((value) => value * 0.3)

/** Typed selected current-action snapshots for Makhaira Aquamarine's Desert Pavilion. */
export const makhairaAquamarineCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.makhaira-aquamarine.after-10s.self.source-em-to-flat-attack",
    label: "玛海菈的水色 · 每10秒触发后的自身攻击力",
    source: { holder: "primary", kind: "weapon", weaponId: "MakhairaAquamarine" },
    target: "sourceFinalElementalMasteryToFlatAttack",
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: MAKHAIRA_AQUAMARINE_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  },
  {
    activation: "active",
    id: "weapon.makhaira-aquamarine.after-10s.other-party.source-em-to-flat-attack",
    label: "玛海菈的水色 · 每10秒触发后的其他队友攻击力",
    source: {
      holder: "party_member",
      kind: "weapon",
      resolveAllMatchingPartySources: true,
      weaponId: "MakhairaAquamarine"
    },
    target: "sourceFinalElementalMasteryToFlatAttack",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: MAKHAIRA_AQUAMARINE_OTHER_PARTY_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  }
]
