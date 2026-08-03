import type { CombatActionEffect } from "../../combat/types.js"

export const XIPHOS_MOONLIGHT_ENERGY_RECHARGE_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT = [
  0.00036,
  0.00045,
  0.00054,
  0.00063,
  0.00072
] as const
export const XIPHOS_MOONLIGHT_OTHER_PARTY_ENERGY_RECHARGE_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT =
  XIPHOS_MOONLIGHT_ENERGY_RECHARGE_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT.map((value) => value * 0.3)

/** Typed selected current-action snapshots for Xiphos' Moonlight's Jinni's Whisper. */
export const xiphosMoonlightCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.xiphos-moonlight.after-10s.self.source-em-to-energy-recharge",
    label: "西福斯的月光 · 每10秒触发后的自身元素充能效率",
    source: { holder: "primary", kind: "weapon", weaponId: "XiphosMoonlight" },
    target: "sourceFinalElementalMasteryToEnergyRecharge",
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: XIPHOS_MOONLIGHT_ENERGY_RECHARGE_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  },
  {
    activation: "active",
    id: "weapon.xiphos-moonlight.after-10s.other-party.source-em-to-energy-recharge",
    label: "西福斯的月光 · 每10秒触发后的其他队友元素充能效率",
    source: {
      holder: "party_member",
      kind: "weapon",
      resolveAllMatchingPartySources: true,
      weaponId: "XiphosMoonlight"
    },
    target: "sourceFinalElementalMasteryToEnergyRecharge",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: XIPHOS_MOONLIGHT_OTHER_PARTY_ENERGY_RECHARGE_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  }
]
