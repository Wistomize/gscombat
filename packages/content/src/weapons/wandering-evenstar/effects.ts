import type { CombatActionEffect } from "../../combat/types.js"

export const WANDERING_EVENSTAR_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const WANDERING_EVENSTAR_OTHER_PARTY_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT =
  WANDERING_EVENSTAR_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT.map((value) => value * 0.3)

/** Typed selected current-action snapshots for Wandering Evenstar's Wildling Nightstar. */
export const wanderingEvenstarCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.wandering-evenstar.after-10s.self.source-em-to-flat-attack",
    label: "流浪的晚星 · 每10秒触发后的自身攻击力",
    source: { holder: "primary", kind: "weapon", weaponId: "WanderingEvenstar" },
    target: "sourceFinalElementalMasteryToFlatAttack",
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: WANDERING_EVENSTAR_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  },
  {
    activation: "active",
    id: "weapon.wandering-evenstar.after-10s.other-party.source-em-to-flat-attack",
    label: "流浪的晚星 · 每10秒触发后的其他队友攻击力",
    source: {
      holder: "party_member",
      kind: "weapon",
      resolveAllMatchingPartySources: true,
      weaponId: "WanderingEvenstar"
    },
    target: "sourceFinalElementalMasteryToFlatAttack",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: WANDERING_EVENSTAR_OTHER_PARTY_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  }
]
