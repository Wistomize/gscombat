import { describe, expect, it } from "vitest"

import { listCombatActions } from "./combat-registry.js"

const expectedExplicitAttackKinds = {
  "amber.normal.sharpshooter.fully_charged.cryo_aura_melt": "charged",
  "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize": "charged",
  "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final": "charged",
  "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom": "charged",
  "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider": "plunge",
  "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt": "charged",
  "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize": "charged",
  "kaeya.normal.auto.first_hit": "normal",
  "klee.normal.charged_attack.single_hit": "charged",
  "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt": "charged",
  "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize": "charged",
  "neuvillette.normal.charged_attack.equitable_judgment.single_tick": "charged",
  "ningguang.normal.charged_attack.with_star_jades": "charged",
  "sethos.normal.royal_reed_archery.shadowpiercing_shot": "charged",
  "skirk.skill.seven_phase_flash.normal.fifth_hit": "normal",
  "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit": "normal",
  "tighnari.normal.wreath_arrow.single_hit.spread": "charged",
  "varesa.normal.fiery_passion.high_plunge.follow_up_strike": "plunge",
  "xiao.burst.bane_of_all_evil.high_plunge": "plunge",
  "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt": "charged",
  "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize": "charged"
} as const

describe("combat action attack-kind metadata", () => {
  it("marks every declared charged-attack core action so equipment filters do not silently skip it", () => {
    const chargedActions = listCombatActions().filter((action) => action.id.includes(".charged_attack."))

    expect(chargedActions.length).toBeGreaterThan(0)
    for (const action of chargedActions) {
      expect(action.attackKind).toBe("charged")
    }
  })

  it("keeps the complete reviewed explicit weapon-hit attack-kind inventory", () => {
    const actualExplicitAttackKinds = Object.fromEntries(
      listCombatActions()
        .filter((action) => action.attackKind !== undefined)
        .map((action) => [action.id, action.attackKind])
    )

    expect(actualExplicitAttackKinds).toEqual(expectedExplicitAttackKinds)
  })
})
