import { describe, expect, it } from "vitest"

import { listCombatActions } from "./combat-registry.js"

const expectedExplicitAttackKinds = {
  "amber.normal.sharpshooter.fully_charged.cryo_aura_melt": "charged",
  "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize": "charged",
  "amber.normal.sharpshooter.fully_charged.no_reaction": "charged",
  "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final": "charged",
  "chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit": "normal",
  "diluc.constellation.6.flaming_sword_nemesis.post_searing_onslaught.normal_attack.first_hit": "normal",
  "dori.constellation.6.sprinkling_weight.electro_normal.first_hit": "normal",
  "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack": "charged",
  "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit": "normal",
  "furina.constellation.6.center_of_attention.ousia.normal.first_hit": "normal",
  "furina.constellation.6.center_of_attention.pneuma.normal.first_hit": "normal",
  "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom": "charged",
  "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider": "plunge",
  "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt": "charged",
  "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize": "charged",
  "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.no_reaction": "charged",
  "ifa.normal.auto.first_hit": "normal",
  "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet": "normal",
  "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack": "charged",
  "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge": "plunge",
  "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit": "normal",
  "kaeya.normal.auto.first_hit": "normal",
  "kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack": "charged",
  "klee.normal.charged_attack.single_hit": "charged",
  "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised": "charged",
  "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt": "charged",
  "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize": "charged",
  "lyney.normal.card_force_translocation.second_charge.prop_arrow.no_reaction": "charged",
  "mona.normal.charged_attack.c6_illusory_torrent_movement": "charged",
  "neuvillette.constellation.6.wrathful_recompense.three_droplets.six_waterfalls": "charged",
  "neuvillette.normal.charged_attack.equitable_judgment.single_tick": "charged",
  "ningguang.normal.charged_attack.with_star_jades": "charged",
  "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.ordinary": "charged",
  "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_superconduct": "charged",
  "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_swirl": "charged",
  "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct": "charged",
  "sethos.normal.royal_reed_archery.shadowpiercing_shot": "charged",
  "skirk.constellation.1.far_to_fall.void_rift.crystal_blade": "charged",
  "skirk.constellation.6.to_the_source.damage_taken_retaliation.three_hits": "charged",
  "skirk.skill.seven_phase_flash.normal.fifth_hit": "normal",
  "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit": "normal",
  "tighnari.constellation.6.karma_adjudged.extra_clusterbloom_arrow.spread": "charged",
  "tighnari.normal.wreath_arrow.single_hit.spread": "charged",
  "traveler.cryo.normal.icebound_charged_attack.stellar_superconduct": "charged",
  "varesa.normal.fiery_passion.high_plunge.follow_up_strike": "plunge",
  "varka.skill.azure_devour.anemo_damage": "charged",
  "varka.skill.azure_devour.corresponding_cryo_damage": "charged",
  "varka.skill.azure_devour.corresponding_electro_damage": "charged",
  "varka.skill.azure_devour.corresponding_hydro_damage": "charged",
  "varka.skill.azure_devour.corresponding_pyro_damage": "charged",
  "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle": "charged",
  "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable": "charged",
  "xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave": "plunge",
  "xiao.burst.bane_of_all_evil.high_plunge": "plunge",
  "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit": "normal",
  "xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit": "charged",
  "yanfei.constellation.6.charged_attack.four_scarlet_seals.cryo_aura_melt": "charged",
  "yanfei.constellation.6.charged_attack.four_scarlet_seals.hydro_aura_vaporize": "charged",
  "yanfei.constellation.6.charged_attack.four_scarlet_seals.no_reaction": "charged",
  "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt": "charged",
  "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize": "charged",
  "yanfei.normal.charged_attack.three_scarlet_seals.no_reaction": "charged",
  "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs": "charged",
  "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction": "normal"
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
