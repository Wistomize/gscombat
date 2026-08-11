import {
  bennettNationalBuiltinBuild,
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild
} from "@gscombat/content"
import { describe, expect, it } from "vitest"

import { resolveCombatActionEffects } from "../../../src/effects/action-effects.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("current-action constellation effects", () => {
  it("keeps Xiangling C1 on a later Pyronado hit while excluding triggering hits", () => {
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const guobaAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const c1EffectId = "xiangling.guoba.c1.pyro_resistance_shred"
    const c6EffectId = "xiangling.pyronado.c6.pyro_damage_bonus"
    const c0Build = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xiangling.current-action-c0",
      constellation: 0
    }
    const c6Build = { ...c0Build, buildId: "test.xiangling.current-action-c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: guobaAction,
        activeEffectIds: [c6EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c0Build,
        teammates: []
      })
    ).toThrow(`Active effect ${c6EffectId} requires Xiangling constellation 6`)

    const baseline = resolveCombatActionEffects({
      action,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const effects = resolveCombatActionEffects({
      action,
      activeEffectIds: [c1EffectId, c6EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const guobaBaseline = resolveCombatActionEffects({
      action: guobaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const guobaEffects = resolveCombatActionEffects({
      action: guobaAction,
      activeEffectIds: [c6EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const guobaTriggerEffects = resolveCombatActionEffects({
      action: guobaAction,
      activeEffectIds: [c1EffectId, c6EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })

    expect(effects.enemyResistanceReduction).toBeCloseTo(0.15)
    expect(effects.damageBonus).toBeCloseTo(baseline.damageBonus)
    expect(guobaEffects.damageBonus - guobaBaseline.damageBonus).toBeCloseTo(0.15)
    expect(guobaTriggerEffects.enemyResistanceReduction).toBe(0)
    expect(effects.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: c1EffectId,
          sourceId: c6Build.buildId,
          target: "enemyResistanceReduction",
          value: 0.15
        })
      ])
    )
    expect(effects.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: c6EffectId })]))
    expect(guobaTriggerEffects.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: c1EffectId })])
    )
  })

  it("applies Xingqiu C4 only to Fatal Rainscreen while Raincutter is active", () => {
    const effectId = "xingqiu.raincutter.c4.fatal_rainscreen.damage_bonus"
    const normalSkill = requireAction("xingqiu.skill.fatal_rainscreen")
    const vaporizeSkill = requireAction("xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize")
    const rainSwordVolley = requireAction("xingqiu.burst.raincutter.rain_sword.single_volley")
    const c3Build = { ...xingqiuNationalBuiltinBuild, buildId: "test.xingqiu.c3", constellation: 3 }
    const c4Build = { ...c3Build, buildId: "test.xingqiu.c4", constellation: 4 }
    const c6Build = { ...c3Build, buildId: "test.xingqiu.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: normalSkill,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c3Build,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Xingqiu constellation 4`)

    const baseline = resolveCombatActionEffects({
      action: normalSkill,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const normalSkillEffects = resolveCombatActionEffects({
      action: normalSkill,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const vaporizeSkillEffects = resolveCombatActionEffects({
      action: vaporizeSkill,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const rainSwordBaseline = resolveCombatActionEffects({
      action: rainSwordVolley,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const rainSwordEffects = resolveCombatActionEffects({
      action: rainSwordVolley,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const c6Baseline = resolveCombatActionEffects({
      action: normalSkill,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const c6Effects = resolveCombatActionEffects({
      action: normalSkill,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })

    expect(normalSkillEffects.damageBonus - baseline.damageBonus).toBeCloseTo(0.5)
    expect(vaporizeSkillEffects.damageBonus).toBeCloseTo(normalSkillEffects.damageBonus)
    expect(rainSwordEffects.damageBonus).toBeCloseTo(rainSwordBaseline.damageBonus)
    expect(c6Effects.damageBonus - c6Baseline.damageBonus).toBeCloseTo(0.5)
  })

  it("applies Bennett C2 only to Bennett's own current action after its below-70% snapshot is selected", () => {
    const effectId = "bennett.constellation.2.impasse_conqueror.energy_recharge"
    const bennettSkill = requireAction("bennett.skill.passion_overload.press")
    const xianglingBurst = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const c1Build = { ...bennettNationalBuiltinBuild, buildId: "test.bennett.c1", constellation: 1 }
    const c2Build = { ...c1Build, buildId: "test.bennett.c2", constellation: 2 }
    const c6Build = { ...c1Build, buildId: "test.bennett.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: bennettSkill,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c1Build,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Bennett constellation 2`)

    const baseline = resolveCombatActionEffects({
      action: bennettSkill,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c2Build,
      teammates: []
    })
    const c2Effects = resolveCombatActionEffects({
      action: bennettSkill,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c2Build,
      teammates: []
    })
    const teammateBaseline = resolveCombatActionEffects({
      action: xianglingBurst,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [c2Build]
    })
    const teammateTarget = resolveCombatActionEffects({
      action: xianglingBurst,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [c2Build]
    })
    const c6Effects = resolveCombatActionEffects({
      action: bennettSkill,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })

    expect(c2Effects.energyRecharge - baseline.energyRecharge).toBeCloseTo(0.3)
    expect(c2Effects.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, label: expect.stringContaining("低于70%"), value: 0.3 })
      ])
    )
    expect(teammateTarget.energyRecharge).toBeCloseTo(teammateBaseline.energyRecharge)
    expect(teammateTarget.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c6Effects.energyRecharge).toBeCloseTo(c2Effects.energyRecharge)
  })

  it("applies Raiden C4 to another party member but never to Raiden herself", () => {
    const effectId = "raiden.constellation.4.pledge_of_propriety.attack_percent"
    const xianglingBurst = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const raidenBurst = requireAction("raiden.burst.initial_slash")
    const c3Build = { ...raidenNationalBuiltinBuild, buildId: "test.raiden.c3", constellation: 3 }
    const c4Build = { ...c3Build, buildId: "test.raiden.c4", constellation: 4 }
    const c6Build = { ...c3Build, buildId: "test.raiden.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: xianglingBurst,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: xianglingNationalBuiltinBuild,
        teammates: [c3Build]
      })
    ).toThrow(`Active effect ${effectId} requires RaidenShogun constellation 4`)

    const teammateBaseline = resolveCombatActionEffects({
      action: xianglingBurst,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [c4Build]
    })
    const teammateEffects = resolveCombatActionEffects({
      action: xianglingBurst,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [c4Build]
    })
    const selfEffects = resolveCombatActionEffects({
      action: raidenBurst,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const c6Effects = resolveCombatActionEffects({
      action: xianglingBurst,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [c6Build]
    })

    expect(teammateEffects.attackPercent - teammateBaseline.attackPercent).toBeCloseTo(0.3)
    expect(selfEffects.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c6Effects.attackPercent - teammateBaseline.attackPercent).toBeCloseTo(0.3)
  })

  it("excludes Navia C4 from the triggering initial burst hit but keeps it on later cannonfire", () => {
    const effectId = "navia.burst.c4.geo_resistance_shred"
    const initialAoe = requireAction("navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe")
    const supportCannonfire = requireAction("navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire")
    const c3Build = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.navia.c3",
      characterId: "Navia",
      constellation: 3
    }
    const c4Build = { ...c3Build, buildId: "test.navia.c4", constellation: 4 }

    expect(() =>
      resolveCombatActionEffects({
        action: supportCannonfire,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c3Build,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Navia constellation 4`)

    const initialEffects = resolveCombatActionEffects({
      action: initialAoe,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })
    const cannonfireEffects = resolveCombatActionEffects({
      action: supportCannonfire,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Build,
      teammates: []
    })

    expect(initialEffects.enemyResistanceReduction).toBe(0)
    expect(initialEffects.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(cannonfireEffects.enemyResistanceReduction).toBeCloseTo(0.2)
    expect(cannonfireEffects.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: c4Build.buildId })])
    )
  })

  it("applies Kuki Shinobu C6's selected low-HP mastery only to her own single Hyperbloom", () => {
    const action = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const effectId = "kuki_shinobu.constellation.6.to_ward_weakness.low_hp.elemental_mastery"
    const c0Build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.kuki-shinobu.c0",
      characterId: "KukiShinobu",
      constellation: 0,
      label: "久岐忍 C0 当前动作快照测试",
      talents: { burst: 6, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const c6Build = { ...c0Build, buildId: "test.kuki-shinobu.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c0Build,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires KukiShinobu constellation 6`)

    const baseline = resolveCombatActionEffects({
      action,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const c6Effects = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Build,
      teammates: []
    })
    const teammateBaseline = resolveCombatActionEffects({
      action,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c0Build,
      teammates: [c6Build]
    })
    const teammateC6Effects = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: c6Build.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c0Build,
      teammates: [c6Build]
    })

    expect(c6Effects.elementalMastery - baseline.elementalMastery).toBeCloseTo(150)
    expect(c6Effects.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: c6Build.buildId, target: "elementalMastery", value: 150 })
      ])
    )
    expect(teammateC6Effects.elementalMastery).toBeCloseTo(teammateBaseline.elementalMastery)
    expect(teammateC6Effects.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })

  it("applies Venti C4 only to Venti's own Anemo action after the pickup snapshot is selected", () => {
    const effectId = "venti.constellation.4.hurricane_of_freedom.anemo_damage_bonus"
    const ventiAction = requireAction("venti.skill.skyward_sonnet.press")
    const xiaoAction = requireAction("xiao.burst.bane_of_all_evil.high_plunge")
    const c3Venti = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.venti.c3",
      characterId: "Venti",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const c4Venti = { ...c3Venti, buildId: "test.venti.c4", constellation: 4 }
    const c6Venti = { ...c3Venti, buildId: "test.venti.c6", constellation: 6 }
    const xiao = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xiao.venti-c4-recipient",
      characterId: "Xiao",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }

    expect(() =>
      resolveCombatActionEffects({
        action: ventiAction,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: c3Venti,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Venti constellation 4`)

    const baseline = resolveCombatActionEffects({
      action: ventiAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Venti,
      teammates: []
    })
    const c4Effects = resolveCombatActionEffects({
      action: ventiAction,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c4Venti,
      teammates: []
    })
    const c6Effects = resolveCombatActionEffects({
      action: ventiAction,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: c6Venti,
      teammates: []
    })
    const teammateEffects = resolveCombatActionEffects({
      action: xiaoAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: c4Venti.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xiao,
      teammates: [c4Venti]
    })

    expect(c4Effects.damageBonus - baseline.damageBonus).toBeCloseTo(0.25)
    expect(c4Effects.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: c4Venti.buildId, value: 0.25 })])
    )
    expect(c6Effects.damageBonus - baseline.damageBonus).toBeCloseTo(0.25)
    expect(teammateEffects.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })

  it("applies Albedo C4 to a teammate's selected in-field Plunging Attack only", () => {
    const effectId = "albedo.constellation.4.descent_of_divinity.plunge_damage_bonus"
    const plungeAction = requireAction("gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider")
    const nonPlungeAction = requireAction("gaming.burst.suannis_gilded_dance.man_chai_smash")
    const c3Albedo = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.albedo.c3",
      characterId: "Albedo",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }
    const c4Albedo = { ...c3Albedo, buildId: "test.albedo.c4", constellation: 4 }
    const c6Albedo = { ...c3Albedo, buildId: "test.albedo.c6", constellation: 6 }
    const gaming = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.gaming.albedo-c4-recipient",
      characterId: "Gaming",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }

    expect(() =>
      resolveCombatActionEffects({
        action: plungeAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: c3Albedo.buildId },
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: gaming,
        teammates: [c3Albedo]
      })
    ).toThrow(`Active effect ${effectId} requires Albedo constellation 4`)

    const baseline = resolveCombatActionEffects({
      action: plungeAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gaming,
      teammates: [c4Albedo]
    })
    const c4Effects = resolveCombatActionEffects({
      action: plungeAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: c4Albedo.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gaming,
      teammates: [c4Albedo]
    })
    const c6Effects = resolveCombatActionEffects({
      action: plungeAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: c6Albedo.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gaming,
      teammates: [c6Albedo]
    })
    const nonPlungeEffects = resolveCombatActionEffects({
      action: nonPlungeAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: c4Albedo.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gaming,
      teammates: [c4Albedo]
    })

    expect(c4Effects.damageBonus - baseline.damageBonus).toBeCloseTo(0.3)
    expect(c4Effects.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: c4Albedo.buildId, value: 0.3 })])
    )
    expect(c6Effects.damageBonus - baseline.damageBonus).toBeCloseTo(0.3)
    expect(nonPlungeEffects.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })

  it("rejects mutually exclusive Venti C6 absorption snapshots before action filtering", () => {
    const pyroEffectId = "venti.windriders.c6.pyro_resistance_shred"
    const hydroEffectId = "venti.windriders.c6.hydro_resistance_shred"
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const c6Venti = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.venti.c6",
      characterId: "Venti",
      constellation: 6
    }

    expect(() =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [pyroEffectId, hydroEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: xianglingNationalBuiltinBuild,
        teammates: [c6Venti]
      })
    ).toThrow("venti-windriders-c6-absorbed-element")

    const freedomSwornSource = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.freedom-sworn-source",
      weapon: { ...xianglingNationalBuiltinBuild.weapon, refinement: 1, weaponId: "FreedomSworn" }
    }
    const freedomSwornEffects = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [
        "weapon.freedom-sworn.full-sigil.party-attack-percent",
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
      ],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [freedomSwornSource]
    })

    expect(freedomSwornEffects.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.freedom-sworn.full-sigil.party-attack-percent" }),
        expect.objectContaining({ id: "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus" })
      ])
    )
  })

  it("resolves Yanfei C2, Razor C2, and Kaeya C1 only for their explicit target-state and action snapshots", () => {
    const yanfeiEffectId = "yanfei.constellation.2.final_interpretation.low_hp_target.charged_attack.crit_rate"
    const razorEffectId = "razor.constellation.2.suppression.low_hp_target.crit_rate"
    const kaeyaEffectId = "kaeya.constellation.1.excellent_blood.affected_by_cryo.normal_charged.crit_rate"
    const yanfeiCharged = requireAction("yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize")
    const yanfeiSkill = requireAction("yanfei.skill.signed_edict")
    const razorFourthNormal = requireAction("razor.burst.lightning_fang.normal.fourth_hit")
    const kaeyaNormal = requireAction("kaeya.normal.auto.first_hit")
    const kaeyaSkill = requireAction("kaeya.skill.frostgnaw")
    const yanfeiC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.yanfei.c1",
      characterId: "Yanfei",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const yanfeiC2 = { ...yanfeiC1, buildId: "test.yanfei.c2", constellation: 2 }
    const yanfeiC6 = { ...yanfeiC1, buildId: "test.yanfei.c6", constellation: 6 }
    const razorC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.razor.c1-for-c2",
      characterId: "Razor",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const razorC2 = { ...razorC1, buildId: "test.razor.c2", constellation: 2 }
    const razorC6 = { ...razorC1, buildId: "test.razor.c6-for-c2", constellation: 6 }
    const kaeyaC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kaeya.c0",
      characterId: "Kaeya",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const kaeyaC1 = { ...kaeyaC0, buildId: "test.kaeya.c1", constellation: 1 }
    const kaeyaC6 = { ...kaeyaC0, buildId: "test.kaeya.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: yanfeiCharged,
        activeEffectIds: [yanfeiEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: yanfeiC1,
        teammates: []
      })
    ).toThrow(`Active effect ${yanfeiEffectId} requires Yanfei constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: razorFourthNormal,
        activeEffectIds: [razorEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: razorC1,
        teammates: []
      })
    ).toThrow(`Active effect ${razorEffectId} requires Razor constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: kaeyaNormal,
        activeEffectIds: [kaeyaEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: kaeyaC0,
        teammates: []
      })
    ).toThrow(`Active effect ${kaeyaEffectId} requires Kaeya constellation 1`)

    const yanfeiBaseline = resolveCombatActionEffects({
      action: yanfeiCharged,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yanfeiC2,
      teammates: []
    })
    const yanfeiSnapshot = resolveCombatActionEffects({
      action: yanfeiCharged,
      activeEffectIds: [yanfeiEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yanfeiC2,
      teammates: []
    })
    const yanfeiNonCharged = resolveCombatActionEffects({
      action: yanfeiSkill,
      activeEffectIds: [yanfeiEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yanfeiC2,
      teammates: []
    })
    const yanfeiC6Snapshot = resolveCombatActionEffects({
      action: yanfeiCharged,
      activeEffectIds: [yanfeiEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yanfeiC6,
      teammates: []
    })
    const razorBaseline = resolveCombatActionEffects({
      action: razorFourthNormal,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: razorC2,
      teammates: []
    })
    const razorSnapshot = resolveCombatActionEffects({
      action: razorFourthNormal,
      activeEffectIds: [razorEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: razorC2,
      teammates: []
    })
    const razorTeammate = resolveCombatActionEffects({
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      activeEffectIds: [razorEffectId],
      activeEffectSourceBuildIds: { [razorEffectId]: razorC2.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [razorC2]
    })
    const razorC6Snapshot = resolveCombatActionEffects({
      action: razorFourthNormal,
      activeEffectIds: [razorEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: razorC6,
      teammates: []
    })
    const kaeyaBaseline = resolveCombatActionEffects({
      action: kaeyaNormal,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kaeyaC1,
      teammates: []
    })
    const kaeyaSnapshot = resolveCombatActionEffects({
      action: kaeyaNormal,
      activeEffectIds: [kaeyaEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kaeyaC1,
      teammates: []
    })
    const kaeyaSkillSnapshot = resolveCombatActionEffects({
      action: kaeyaSkill,
      activeEffectIds: [kaeyaEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kaeyaC1,
      teammates: []
    })
    const kaeyaC6Snapshot = resolveCombatActionEffects({
      action: kaeyaNormal,
      activeEffectIds: [kaeyaEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kaeyaC6,
      teammates: []
    })

    expect(yanfeiSnapshot.critRate - yanfeiBaseline.critRate).toBeCloseTo(0.2)
    expect(yanfeiNonCharged.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: yanfeiEffectId })]))
    expect(yanfeiC6Snapshot.critRate - yanfeiBaseline.critRate).toBeCloseTo(0.2)
    expect(razorSnapshot.critRate - razorBaseline.critRate).toBeCloseTo(0.1)
    expect(razorTeammate.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: razorEffectId })]))
    expect(razorC6Snapshot.critRate - razorBaseline.critRate).toBeCloseTo(0.1)
    expect(kaeyaSnapshot.critRate - kaeyaBaseline.critRate).toBeCloseTo(0.15)
    expect(kaeyaSkillSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: kaeyaEffectId })]))
    expect(kaeyaC6Snapshot.critRate - kaeyaBaseline.critRate).toBeCloseTo(0.15)
  })

  it("resolves Amber C2 as a self-owned Baron Bunny explosion damage bonus, never as the triggering aimed shot", () => {
    const effectId = "amber.constellation.2.bunny_triggered.manual_baron_bunny_detonation.damage_bonus"
    const explosion = requireAction("amber.skill.explosive_puppet.baron_bunny.explosion")
    const aimedShot = requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize")
    const amberC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.amber.c1",
      characterId: "Amber",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const amberC2 = { ...amberC1, buildId: "test.amber.c2", constellation: 2 }
    const amberC6 = { ...amberC1, buildId: "test.amber.c6", constellation: 6 }
    const teammateAmber = { ...amberC1, buildId: "test.amber.c0-teammate", constellation: 0 }

    expect(() =>
      resolveCombatActionEffects({
        action: explosion,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: amberC1,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Amber constellation 2`)

    const baseline = resolveCombatActionEffects({
      action: explosion,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amberC2,
      teammates: []
    })
    const c2Snapshot = resolveCombatActionEffects({
      action: explosion,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amberC2,
      teammates: []
    })
    const aimedShotSnapshot = resolveCombatActionEffects({
      action: aimedShot,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amberC2,
      teammates: []
    })
    const teammateSnapshot = resolveCombatActionEffects({
      action: explosion,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: amberC2.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: teammateAmber,
      teammates: [amberC2]
    })
    const c6Snapshot = resolveCombatActionEffects({
      action: explosion,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amberC6,
      teammates: []
    })

    expect(c2Snapshot.damageBonus - baseline.damageBonus).toBeCloseTo(2)
    expect(c2Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: amberC2.buildId, value: 2 })])
    )
    expect(aimedShotSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(teammateSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c6Snapshot.damageBonus - baseline.damageBonus).toBeCloseTo(2)
  })

  it("resolves Baizhu C4's nearby-party mastery snapshot from either C4 or C6", () => {
    const effectId = "baizhu.constellation.4.ancient_art_of_perception.holistic_revivification.party_elemental_mastery"
    const action = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const kuki = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kuki.baizhu-c4-recipient",
      characterId: "KukiShinobu",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const baizhuC3 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.baizhu.c3",
      characterId: "Baizhu",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const baizhuC4 = { ...baizhuC3, buildId: "test.baizhu.c4", constellation: 4 }
    const baizhuC6 = { ...baizhuC3, buildId: "test.baizhu.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: baizhuC3.buildId },
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: kuki,
        teammates: [baizhuC3]
      })
    ).toThrow(`Active effect ${effectId} requires Baizhu constellation 4`)

    const baseline = resolveCombatActionEffects({
      action,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [baizhuC4]
    })
    const c4Snapshot = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: baizhuC4.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [baizhuC4]
    })
    const c6Snapshot = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: baizhuC6.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [baizhuC6]
    })

    expect(c4Snapshot.elementalMastery - baseline.elementalMastery).toBeCloseTo(80)
    expect(c4Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: baizhuC4.buildId, value: 80 })])
    )
    expect(c6Snapshot.elementalMastery - baseline.elementalMastery).toBeCloseTo(80)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: baizhuC6.buildId, value: 80 })])
    )
  })

  it("resolves self-owned attack and damage snapshots without leaking them to unrelated actions or teammates", () => {
    const dilucFirstHit = requireAction("diluc.skill.searing_onslaught.first_hit")
    const dilucThirdHit = requireAction("diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize")
    const gamingPlunge = requireAction("gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider")
    const dilucC1EffectId = "diluc.constellation.1.conviction.enemy_above_half_health.damage_bonus"
    const dilucC2EffectId = "diluc.constellation.2.scorching_ember.full_stacks.attack_percent"
    const dilucC4EffectId = "diluc.constellation.4.flowing_flame.searing_onslaught.next_hit.damage_bonus"
    const gamingC2EffectId = "gaming.constellation.2.plum_blossom_step.overheal.attack_percent"
    const dilucC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.diluc.c0",
      characterId: "Diluc",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const dilucC3 = { ...dilucC0, buildId: "test.diluc.c3", constellation: 3 }
    const dilucC4 = { ...dilucC0, buildId: "test.diluc.c4", constellation: 4 }
    const dilucC6 = { ...dilucC0, buildId: "test.diluc.c6", constellation: 6 }
    const gamingC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.gaming.c1",
      characterId: "Gaming",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const gamingC2 = { ...gamingC1, buildId: "test.gaming.c2", constellation: 2 }
    const gamingC6 = { ...gamingC1, buildId: "test.gaming.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: dilucThirdHit,
        activeEffectIds: [dilucC4EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: dilucC3,
        teammates: []
      })
    ).toThrow(`Active effect ${dilucC4EffectId} requires Diluc constellation 4`)

    const dilucBaseline = resolveCombatActionEffects({
      action: dilucThirdHit,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dilucC4,
      teammates: []
    })
    const dilucSnapshot = resolveCombatActionEffects({
      action: dilucThirdHit,
      activeEffectIds: [dilucC1EffectId, dilucC2EffectId, dilucC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dilucC4,
      teammates: []
    })
    const dilucFirstHitSnapshot = resolveCombatActionEffects({
      action: dilucFirstHit,
      activeEffectIds: [dilucC1EffectId, dilucC2EffectId, dilucC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dilucC4,
      teammates: []
    })
    const dilucC6Snapshot = resolveCombatActionEffects({
      action: dilucThirdHit,
      activeEffectIds: [dilucC1EffectId, dilucC2EffectId, dilucC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dilucC6,
      teammates: []
    })
    const dilucTeammateSnapshot = resolveCombatActionEffects({
      action: gamingPlunge,
      activeEffectIds: [dilucC1EffectId, dilucC2EffectId, dilucC4EffectId],
      activeEffectSourceBuildIds: {
        [dilucC1EffectId]: dilucC6.buildId,
        [dilucC2EffectId]: dilucC6.buildId,
        [dilucC4EffectId]: dilucC6.buildId
      },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gamingC1,
      teammates: [dilucC6]
    })
    const gamingBaseline = resolveCombatActionEffects({
      action: gamingPlunge,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gamingC2,
      teammates: []
    })
    const gamingSnapshot = resolveCombatActionEffects({
      action: gamingPlunge,
      activeEffectIds: [gamingC2EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gamingC2,
      teammates: []
    })
    const gamingC6Snapshot = resolveCombatActionEffects({
      action: gamingPlunge,
      activeEffectIds: [gamingC2EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gamingC6,
      teammates: []
    })

    expect(dilucSnapshot.attackPercent - dilucBaseline.attackPercent).toBeCloseTo(0.3)
    expect(dilucSnapshot.damageBonus - dilucBaseline.damageBonus).toBeCloseTo(0.55)
    expect(dilucFirstHitSnapshot.damageBonus - dilucBaseline.damageBonus).toBeCloseTo(0.15)
    expect(dilucC6Snapshot.attackPercent - dilucBaseline.attackPercent).toBeCloseTo(0.3)
    expect(dilucC6Snapshot.damageBonus - dilucBaseline.damageBonus).toBeCloseTo(0.55)
    expect(dilucTeammateSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: expect.stringContaining("diluc.constellation") })])
    )
    expect(gamingSnapshot.attackPercent - gamingBaseline.attackPercent).toBeCloseTo(0.2)
    expect(gamingC6Snapshot.attackPercent - gamingBaseline.attackPercent).toBeCloseTo(0.2)
  })

  it("resolves full-stack Lyney C2 and post-trigger Hu Tao C6 crit snapshots from C6 builds", () => {
    const lyneyAction = requireAction("lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize")
    const huTaoAction = requireAction("hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize")
    const lyneyEffectId = "lyney.constellation.2.conclusive_ovation.full_stacks.crit_damage"
    const huTaoEffectId = "hu_tao.constellation.6.butterflys_rest.post_trigger.crit_rate"
    const lyneyC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.lyney.c1",
      characterId: "Lyney",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const lyneyC2 = { ...lyneyC1, buildId: "test.lyney.c2", constellation: 2 }
    const lyneyC6 = { ...lyneyC1, buildId: "test.lyney.c6", constellation: 6 }
    const huTaoC5 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.hu-tao.c5",
      characterId: "HuTao",
      constellation: 5,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const huTaoC6 = { ...huTaoC5, buildId: "test.hu-tao.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: lyneyAction,
        activeEffectIds: [lyneyEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: lyneyC1,
        teammates: []
      })
    ).toThrow(`Active effect ${lyneyEffectId} requires Lyney constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: huTaoAction,
        activeEffectIds: [huTaoEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: huTaoC5,
        teammates: []
      })
    ).toThrow(`Active effect ${huTaoEffectId} requires HuTao constellation 6`)

    const lyneyBaseline = resolveCombatActionEffects({
      action: lyneyAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: lyneyC2,
      teammates: []
    })
    const lyneySnapshot = resolveCombatActionEffects({
      action: lyneyAction,
      activeEffectIds: [lyneyEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: lyneyC6,
      teammates: []
    })
    const huTaoBaseline = resolveCombatActionEffects({
      action: huTaoAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: huTaoC6,
      teammates: []
    })
    const huTaoSnapshot = resolveCombatActionEffects({
      action: huTaoAction,
      activeEffectIds: [huTaoEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: huTaoC6,
      teammates: []
    })

    expect(lyneySnapshot.critDamage - lyneyBaseline.critDamage).toBeCloseTo(0.6)
    expect(huTaoSnapshot.critRate - huTaoBaseline.critRate).toBeCloseTo(1)
  })

  it("resolves conditional Ayato, Neuvillette, Tighnari, and Freminet effects at their exact actions", () => {
    const ayatoAction = requireAction("kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit")
    const neuvilletteAction = requireAction("neuvillette.normal.charged_attack.equitable_judgment.single_tick")
    const tighnariAction = requireAction("tighnari.normal.wreath_arrow.single_hit.spread")
    const freminetAction = requireAction("freminet.skill.pressurized_floe.level_4.physical_damage")
    const ayatoEffectId = "kamisato_ayato.constellation.1.kyoika_fushi.low_hp_target.shunsuiken.damage_bonus"
    const neuvilletteEffectId = "neuvillette.constellation.2.judicial_exhortation.full_past_draconic_glories.crit_damage"
    const tighnariEffectId = "tighnari.constellation.2.known_by_the_stem.dendro_field.damage_bonus"
    const ayatoC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.ayato.c0",
      characterId: "KamisatoAyato",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const ayatoC1 = { ...ayatoC0, buildId: "test.ayato.c1", constellation: 1 }
    const neuvilletteC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.neuvillette.c1",
      characterId: "Neuvillette",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const neuvilletteC2 = { ...neuvilletteC1, buildId: "test.neuvillette.c2", constellation: 2 }
    const neuvilletteC6 = { ...neuvilletteC1, buildId: "test.neuvillette.c6", constellation: 6 }
    const tighnariC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.tighnari.c1",
      characterId: "Tighnari",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const tighnariC2 = { ...tighnariC1, buildId: "test.tighnari.c2", constellation: 2 }
    const freminetC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.freminet.c0",
      characterId: "Freminet",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const freminetC1 = { ...freminetC0, buildId: "test.freminet.c1", constellation: 1 }

    expect(() =>
      resolveCombatActionEffects({
        action: ayatoAction,
        activeEffectIds: [ayatoEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: ayatoC0,
        teammates: []
      })
    ).toThrow(`Active effect ${ayatoEffectId} requires KamisatoAyato constellation 1`)
    expect(() =>
      resolveCombatActionEffects({
        action: neuvilletteAction,
        activeEffectIds: [neuvilletteEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: neuvilletteC1,
        teammates: []
      })
    ).toThrow(`Active effect ${neuvilletteEffectId} requires Neuvillette constellation 2`)

    const ayatoBaseline = resolveCombatActionEffects({
      action: ayatoAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: ayatoC1,
      teammates: []
    })
    const ayatoSnapshot = resolveCombatActionEffects({
      action: ayatoAction,
      activeEffectIds: [ayatoEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: ayatoC1,
      teammates: []
    })
    const neuvilletteBaseline = resolveCombatActionEffects({
      action: neuvilletteAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: neuvilletteC2,
      teammates: []
    })
    const neuvilletteSnapshot = resolveCombatActionEffects({
      action: neuvilletteAction,
      activeEffectIds: [neuvilletteEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: neuvilletteC2,
      teammates: []
    })
    const neuvilletteC6Snapshot = resolveCombatActionEffects({
      action: neuvilletteAction,
      activeEffectIds: [neuvilletteEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: neuvilletteC6,
      teammates: []
    })
    const tighnariBaseline = resolveCombatActionEffects({
      action: tighnariAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: tighnariC2,
      teammates: []
    })
    const tighnariSnapshot = resolveCombatActionEffects({
      action: tighnariAction,
      activeEffectIds: [tighnariEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: tighnariC2,
      teammates: []
    })
    const freminetC0Effects = resolveCombatActionEffects({
      action: freminetAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: freminetC0,
      teammates: []
    })
    const freminetC1Effects = resolveCombatActionEffects({
      action: freminetAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: freminetC1,
      teammates: []
    })

    expect(ayatoSnapshot.damageBonus - ayatoBaseline.damageBonus).toBeCloseTo(0.4)
    expect(neuvilletteSnapshot.critDamage - neuvilletteBaseline.critDamage).toBeCloseTo(0.42)
    expect(neuvilletteC6Snapshot.critDamage - neuvilletteBaseline.critDamage).toBeCloseTo(0.42)
    expect(tighnariSnapshot.damageBonus - tighnariBaseline.damageBonus).toBeCloseTo(0.2)
    expect(freminetC1Effects.critRate - freminetC0Effects.critRate).toBeCloseTo(0.15)
  })

  it("resolves Kazuha, Yelan, and Iansan team snapshots only for their intended recipients", () => {
    const kukiAction = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const yelanAction = requireAction("yelan.skill.lingering_lifeline.explosion")
    const xianglingAction = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const iansanAction = requireAction("iansan.skill.thunderbolt_rush.initial_hit")
    const kazuhaEffectId = "kaedehara_kazuha.constellation.2.yamaarashi_tailwind.field.elemental_mastery"
    const yelanEffectId = "yelan.constellation.4.bait_and_switch.full_stacks.hp_percent"
    const iansanEffectId = "iansan.constellation.2.no_laziness_in_fitness.standard_action.off_field.attack_percent"
    const kuki = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kuki.team-snapshot-recipient",
      characterId: "KukiShinobu",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const kazuhaC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kazuha.c1",
      characterId: "KaedeharaKazuha",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const kazuhaC2 = { ...kazuhaC1, buildId: "test.kazuha.c2", constellation: 2 }
    const yelanC3 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.yelan.c3",
      characterId: "Yelan",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const yelanC4 = { ...yelanC3, buildId: "test.yelan.c4", constellation: 4 }
    const iansanC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.iansan.c1",
      characterId: "Iansan",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusPolearm" }
    }
    const iansanC2 = { ...iansanC1, buildId: "test.iansan.c2", constellation: 2 }

    expect(() =>
      resolveCombatActionEffects({
        action: kukiAction,
        activeEffectIds: [kazuhaEffectId],
        activeEffectSourceBuildIds: { [kazuhaEffectId]: kazuhaC1.buildId },
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: kuki,
        teammates: [kazuhaC1]
      })
    ).toThrow(`Active effect ${kazuhaEffectId} requires KaedeharaKazuha constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: yelanAction,
        activeEffectIds: [yelanEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: yelanC3,
        teammates: []
      })
    ).toThrow(`Active effect ${yelanEffectId} requires Yelan constellation 4`)
    expect(() =>
      resolveCombatActionEffects({
        action: xianglingAction,
        activeEffectIds: [iansanEffectId],
        activeEffectSourceBuildIds: { [iansanEffectId]: iansanC1.buildId },
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: xianglingNationalBuiltinBuild,
        teammates: [iansanC1]
      })
    ).toThrow(`Active effect ${iansanEffectId} requires Iansan constellation 2`)

    const kazuhaBaseline = resolveCombatActionEffects({
      action: kukiAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [kazuhaC2]
    })
    const kazuhaSnapshot = resolveCombatActionEffects({
      action: kukiAction,
      activeEffectIds: [kazuhaEffectId],
      activeEffectSourceBuildIds: { [kazuhaEffectId]: kazuhaC2.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [kazuhaC2]
    })
    const yelanBaseline = resolveCombatActionEffects({
      action: yelanAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yelanC4,
      teammates: []
    })
    const yelanSnapshot = resolveCombatActionEffects({
      action: yelanAction,
      activeEffectIds: [yelanEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yelanC4,
      teammates: []
    })
    const iansanBaseline = resolveCombatActionEffects({
      action: xianglingAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [iansanC2]
    })
    const iansanSnapshot = resolveCombatActionEffects({
      action: xianglingAction,
      activeEffectIds: [iansanEffectId],
      activeEffectSourceBuildIds: { [iansanEffectId]: iansanC2.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [iansanC2]
    })
    const iansanSelf = resolveCombatActionEffects({
      action: iansanAction,
      activeEffectIds: [iansanEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: iansanC2,
      teammates: []
    })

    expect(kazuhaSnapshot.elementalMastery - kazuhaBaseline.elementalMastery).toBeCloseTo(200)
    expect(yelanSnapshot.hpPercent - yelanBaseline.hpPercent).toBeCloseTo(0.4)
    expect(iansanSnapshot.attackPercent - iansanBaseline.attackPercent).toBeCloseTo(0.3)
    expect(iansanSelf.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: iansanEffectId })]))
  })

  it("resolves Mualani C1 as a same-hit max-HP term rather than a second damage event", () => {
    const action = requireAction("mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum")
    const effectId = "mualani.constellation.1.relaxed_meztli.first_surfshark_bite.hp_additive_damage"
    const mualaniC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mualani.c0",
      characterId: "Mualani",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const mualaniC1 = { ...mualaniC0, buildId: "test.mualani.c1", constellation: 1 }
    const mualaniC6 = { ...mualaniC0, buildId: "test.mualani.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [effectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: mualaniC0,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Mualani constellation 1`)

    const snapshot = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: mualaniC1,
      teammates: []
    })
    const c6Snapshot = resolveCombatActionEffects({
      action,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: mualaniC6,
      teammates: []
    })

    expect(snapshot.additionalDamageEvents).toEqual([])
    expect(snapshot.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.66, id: effectId, scalingStat: "hp", sourceId: mualaniC1.buildId })
    ])
    expect(c6Snapshot.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.66, id: effectId, scalingStat: "hp", sourceId: mualaniC6.buildId })
    ])
  })

  it("resolves high-confidence Pyro constellation snapshots without leaking their automatic or selected effects", () => {
    const dehyaAction = requireAction("dehya.burst.flame_manes_fist")
    const mavuikaAction = requireAction("mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize")
    const yoimiyaAction = requireAction("yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize")
    const kleeAction = requireAction("klee.normal.charged_attack.single_hit")
    const unrelatedAction = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const dehyaC6CritDamageEffectId =
      "dehya.constellation.6.the-burning-claws.full_stacks.flame_manes_fist.crit_damage"
    const mavuikaC1EffectId = "mavuika.constellation.1.the-nights-lord.earned_fighting_spirit.attack_percent"
    const yoimiyaC1EffectId = "yoimiya.constellation.1.agate_ryukin.aurous_blaze_enemy_defeated.attack_percent"
    const kleeC1EffectId = "klee.constellation.1.chained_reactions.spark_triggered.attack_percent"
    const dehyaC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.dehya.c0",
      characterId: "Dehya",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const dehyaC1 = { ...dehyaC0, buildId: "test.dehya.c1", constellation: 1 }
    const dehyaC6 = { ...dehyaC0, buildId: "test.dehya.c6", constellation: 6 }
    const mavuikaC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mavuika.c0",
      characterId: "Mavuika",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const mavuikaC6 = { ...mavuikaC0, buildId: "test.mavuika.c6", constellation: 6 }
    const yoimiyaC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.yoimiya.c0",
      characterId: "Yoimiya",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const yoimiyaC6 = { ...yoimiyaC0, buildId: "test.yoimiya.c6", constellation: 6 }
    const kleeC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.klee.c0",
      characterId: "Klee",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const kleeC6 = { ...kleeC0, buildId: "test.klee.c6", constellation: 6 }

    expect(() =>
      resolveCombatActionEffects({
        action: dehyaAction,
        activeEffectIds: [dehyaC6CritDamageEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: dehyaC1,
        teammates: []
      })
    ).toThrow(`Active effect ${dehyaC6CritDamageEffectId} requires Dehya constellation 6`)
    expect(() =>
      resolveCombatActionEffects({
        action: mavuikaAction,
        activeEffectIds: [mavuikaC1EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: mavuikaC0,
        teammates: []
      })
    ).toThrow(`Active effect ${mavuikaC1EffectId} requires Mavuika constellation 1`)

    const dehyaBaseline = resolveCombatActionEffects({
      action: dehyaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dehyaC0,
      teammates: []
    })
    const dehyaC1Effects = resolveCombatActionEffects({
      action: dehyaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dehyaC1,
      teammates: []
    })
    const dehyaC6Effects = resolveCombatActionEffects({
      action: dehyaAction,
      activeEffectIds: [dehyaC6CritDamageEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: dehyaC6,
      teammates: []
    })
    const dehyaTeammateEffects = resolveCombatActionEffects({
      action: unrelatedAction,
      activeEffectIds: [dehyaC6CritDamageEffectId],
      activeEffectSourceBuildIds: { [dehyaC6CritDamageEffectId]: dehyaC6.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [dehyaC6]
    })
    const mavuikaBaseline = resolveCombatActionEffects({
      action: mavuikaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: mavuikaC6,
      teammates: []
    })
    const mavuikaSnapshot = resolveCombatActionEffects({
      action: mavuikaAction,
      activeEffectIds: [mavuikaC1EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: mavuikaC6,
      teammates: []
    })
    const yoimiyaBaseline = resolveCombatActionEffects({
      action: yoimiyaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yoimiyaC6,
      teammates: []
    })
    const yoimiyaSnapshot = resolveCombatActionEffects({
      action: yoimiyaAction,
      activeEffectIds: [yoimiyaC1EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: yoimiyaC6,
      teammates: []
    })
    const kleeBaseline = resolveCombatActionEffects({
      action: kleeAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kleeC6,
      teammates: []
    })
    const kleeSnapshot = resolveCombatActionEffects({
      action: kleeAction,
      activeEffectIds: [kleeC1EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kleeC6,
      teammates: []
    })

    expect(dehyaC1Effects.hpPercent - dehyaBaseline.hpPercent).toBeCloseTo(0.2)
    expect(dehyaC1Effects.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.06, scalingStat: "hp", sourceId: dehyaC1.buildId })
    ])
    expect(dehyaC6Effects.critRate - dehyaBaseline.critRate).toBeCloseTo(0.1)
    expect(dehyaC6Effects.critDamage - dehyaBaseline.critDamage).toBeCloseTo(0.6)
    expect(dehyaC6Effects.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.06, scalingStat: "hp", sourceId: dehyaC6.buildId })
    ])
    expect(dehyaTeammateEffects.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: expect.stringContaining("dehya.constellation") })])
    )
    expect(mavuikaSnapshot.attackPercent - mavuikaBaseline.attackPercent).toBeCloseTo(0.4)
    expect(yoimiyaSnapshot.attackPercent - yoimiyaBaseline.attackPercent).toBeCloseTo(0.2)
    expect(kleeSnapshot.attackPercent - kleeBaseline.attackPercent).toBeCloseTo(0.6)
  })

  it("resolves audited Hydro and Anemo constellation stat snapshots with exact owner and element scopes", () => {
    const ainoAction = requireAction("aino.burst.precision_hydronic_cooler.water_ball")
    const heizouAction = requireAction("shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction")
    const columbinaAction = requireAction("columbina.skill.eternal_tides.gravity_interference.lunar_charged")
    const varkaAction = requireAction("varka.skill.windbound_execution.press")
    const kukiAction = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const xingqiuAction = requireAction("xingqiu.skill.fatal_rainscreen")
    const xiaoAction = requireAction("xiao.burst.bane_of_all_evil.high_plunge")
    const ainoSelfEffectId = "aino.constellation.1.balance_of_ash_and_field.self.elemental_mastery"
    const ainoTeammateEffectId = "aino.constellation.1.balance_of_ash_and_field.nearby_on_field_teammate.elemental_mastery"
    const columbinaC2EffectId = "columbina.constellation.2.illumine_the_night.gravity_interference.radiant_moon.hp_percent"
    const columbinaC6EffectId = "columbina.constellation.6.follow_the_moon.lunar_reaction_hydro.crit_damage"
    const varkaC4EffectId = "varka.constellation.4.song_of_freedom.swirl_triggered.anemo_damage_bonus"
    const ainoC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.aino.c0",
      characterId: "Aino",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const ainoC6 = { ...ainoC0, buildId: "test.aino.c6", constellation: 6 }
    const heizouC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.heizou.c0",
      characterId: "ShikanoinHeizou",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const heizouC6 = { ...heizouC0, buildId: "test.heizou.c6", constellation: 6 }
    const columbinaC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.columbina.c1",
      characterId: "Columbina",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const columbinaC6 = { ...columbinaC1, buildId: "test.columbina.c6", constellation: 6 }
    const varkaC3 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.varka.c3",
      characterId: "Varka",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const varkaC4 = { ...varkaC3, buildId: "test.varka.c4", constellation: 4 }
    const kuki = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kuki.aino-c1-recipient",
      characterId: "KukiShinobu",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const xingqiu = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xingqiu.columbina-c6-recipient",
      characterId: "Xingqiu",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const xiao = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xiao.varka-c4-recipient",
      characterId: "Xiao",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }

    expect(() =>
      resolveCombatActionEffects({
        action: ainoAction,
        activeEffectIds: [ainoSelfEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: ainoC0,
        teammates: []
      })
    ).toThrow(`Active effect ${ainoSelfEffectId} requires Aino constellation 1`)
    expect(() =>
      resolveCombatActionEffects({
        action: columbinaAction,
        activeEffectIds: [columbinaC2EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: columbinaC1,
        teammates: []
      })
    ).toThrow(`Active effect ${columbinaC2EffectId} requires Columbina constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: varkaAction,
        activeEffectIds: [varkaC4EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: varkaC3,
        teammates: []
      })
    ).toThrow(`Active effect ${varkaC4EffectId} requires Varka constellation 4`)

    const ainoBaseline = resolveCombatActionEffects({
      action: ainoAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: ainoC6,
      teammates: []
    })
    const ainoSelfSnapshot = resolveCombatActionEffects({
      action: ainoAction,
      activeEffectIds: [ainoSelfEffectId, ainoTeammateEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: ainoC6,
      teammates: []
    })
    const ainoTeammateBaseline = resolveCombatActionEffects({
      action: kukiAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [ainoC6]
    })
    const ainoTeammateSnapshot = resolveCombatActionEffects({
      action: kukiAction,
      activeEffectIds: [ainoSelfEffectId, ainoTeammateEffectId],
      activeEffectSourceBuildIds: {
        [ainoSelfEffectId]: ainoC6.buildId,
        [ainoTeammateEffectId]: ainoC6.buildId
      },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kuki,
      teammates: [ainoC6]
    })
    const heizouC0Effects = resolveCombatActionEffects({
      action: heizouAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: heizouC0,
      teammates: []
    })
    const heizouC6Effects = resolveCombatActionEffects({
      action: heizouAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: heizouC6,
      teammates: []
    })
    const columbinaBaseline = resolveCombatActionEffects({
      action: columbinaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: columbinaC6,
      teammates: []
    })
    const columbinaC2Snapshot = resolveCombatActionEffects({
      action: columbinaAction,
      activeEffectIds: [columbinaC2EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: columbinaC6,
      teammates: []
    })
    const columbinaTeammateBaseline = resolveCombatActionEffects({
      action: xingqiuAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xingqiu,
      teammates: [columbinaC6]
    })
    const columbinaTeammateSnapshot = resolveCombatActionEffects({
      action: xingqiuAction,
      activeEffectIds: [columbinaC6EffectId],
      activeEffectSourceBuildIds: { [columbinaC6EffectId]: columbinaC6.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xingqiu,
      teammates: [columbinaC6]
    })
    const varkaBaseline = resolveCombatActionEffects({
      action: varkaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: varkaC4,
      teammates: []
    })
    const varkaSnapshot = resolveCombatActionEffects({
      action: varkaAction,
      activeEffectIds: [varkaC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: varkaC4,
      teammates: []
    })
    const varkaTeammateBaseline = resolveCombatActionEffects({
      action: xiaoAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xiao,
      teammates: [varkaC4]
    })
    const varkaTeammateSnapshot = resolveCombatActionEffects({
      action: xiaoAction,
      activeEffectIds: [varkaC4EffectId],
      activeEffectSourceBuildIds: { [varkaC4EffectId]: varkaC4.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xiao,
      teammates: [varkaC4]
    })

    expect(ainoSelfSnapshot.elementalMastery - ainoBaseline.elementalMastery).toBeCloseTo(80)
    expect(ainoTeammateSnapshot.elementalMastery - ainoTeammateBaseline.elementalMastery).toBeCloseTo(80)
    expect(heizouC6Effects.critRate - heizouC0Effects.critRate).toBeCloseTo(0.16)
    expect(heizouC6Effects.critDamage - heizouC0Effects.critDamage).toBeCloseTo(0.32)
    expect(columbinaC2Snapshot.hpPercent - columbinaBaseline.hpPercent).toBeCloseTo(0.4)
    expect(columbinaTeammateSnapshot.critDamage - columbinaTeammateBaseline.critDamage).toBeCloseTo(0.8)
    expect(varkaSnapshot.damageBonus - varkaBaseline.damageBonus).toBeCloseTo(0.2)
    expect(varkaTeammateSnapshot.damageBonus - varkaTeammateBaseline.damageBonus).toBeCloseTo(0.2)
  })

  it("resolves audited Electro, Cryo, Dendro, and Geo constellation snapshots without inventing sequences", () => {
    const sethosAction = requireAction("sethos.normal.royal_reed_archery.shadowpiercing_shot")
    const eulaExplosion = requireAction("eula.burst.glacial_illumination.lightfall_sword.explosion")
    const eulaSkill = requireAction("eula.skill.icetide_vortex.press")
    const kinichCannon = requireAction("kinich.skill.scalespiker_cannon.single_hit")
    const kinichBurst = requireAction("kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick")
    const xianglingAction = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const gorouAction = requireAction("gorou.skill.inuzaka_all_round_defense")
    const naviaAction = requireAction("navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire")
    const sethosOneStackEffectId = "sethos.constellation.2.secret_rite_papyrus.one_stack.electro_damage_bonus"
    const sethosTwoStacksEffectId = "sethos.constellation.2.secret_rite_papyrus.two_stacks.electro_damage_bonus"
    const eulaC4EffectId = "eula.constellation.4.obstinacy_of_ones_inferiors.low_hp_target.lightfall_sword.damage_bonus"
    const nahidaC2EffectId = "nahida.constellation.2.seed_of_stored_knowledge.quicken_related_target.defense_reduction"
    const gorouOneGeoEffectId = "gorou.constellation.6.valorous_hound.one_geo.crit_damage"
    const gorouTwoGeoEffectId = "gorou.constellation.6.valorous_hound.two_geo.crit_damage"
    const gorouThreeGeoEffectId = "gorou.constellation.6.valorous_hound.three_or_more_geo.crit_damage"
    const sethosC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.sethos.c1",
      characterId: "Sethos",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const sethosC2 = { ...sethosC1, buildId: "test.sethos.c2", constellation: 2 }
    const sethosC6 = { ...sethosC1, buildId: "test.sethos.c6", constellation: 6 }
    const eulaC3 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.eula.c3",
      characterId: "Eula",
      constellation: 3,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const eulaC4 = { ...eulaC3, buildId: "test.eula.c4", constellation: 4 }
    const eulaC6 = { ...eulaC3, buildId: "test.eula.c6", constellation: 6 }
    const kinichC0 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.kinich.c0",
      characterId: "Kinich",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const kinichC1 = { ...kinichC0, buildId: "test.kinich.c1", constellation: 1 }
    const nahidaC1 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.nahida.c1",
      characterId: "Nahida",
      constellation: 1,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const nahidaC2 = { ...nahidaC1, buildId: "test.nahida.c2", constellation: 2 }
    const gorouC5 = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.gorou.c5",
      characterId: "Gorou",
      constellation: 5,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const gorouC6 = { ...gorouC5, buildId: "test.gorou.c6", constellation: 6 }
    const navia = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.navia.gorou-c6-recipient",
      characterId: "Navia",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const albedo = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.albedo.gorou-c6-composition",
      characterId: "Albedo",
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }

    expect(() =>
      resolveCombatActionEffects({
        action: sethosAction,
        activeEffectIds: [sethosOneStackEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: sethosC1,
        teammates: []
      })
    ).toThrow(`Active effect ${sethosOneStackEffectId} requires Sethos constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: eulaExplosion,
        activeEffectIds: [eulaC4EffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: eulaC3,
        teammates: []
      })
    ).toThrow(`Active effect ${eulaC4EffectId} requires Eula constellation 4`)
    expect(() =>
      resolveCombatActionEffects({
        action: xianglingAction,
        activeEffectIds: [nahidaC2EffectId],
        activeEffectSourceBuildIds: { [nahidaC2EffectId]: nahidaC1.buildId },
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: xianglingNationalBuiltinBuild,
        teammates: [nahidaC1]
      })
    ).toThrow(`Active effect ${nahidaC2EffectId} requires Nahida constellation 2`)
    expect(() =>
      resolveCombatActionEffects({
        action: sethosAction,
        activeEffectIds: [sethosOneStackEffectId, sethosTwoStacksEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: sethosC2,
        teammates: []
      })
    ).toThrow("sethos-c2-electro-damage-bonus-stacks")

    const sethosBaseline = resolveCombatActionEffects({
      action: sethosAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: sethosC2,
      teammates: []
    })
    const sethosOneStack = resolveCombatActionEffects({
      action: sethosAction,
      activeEffectIds: [sethosOneStackEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: sethosC2,
      teammates: []
    })
    const sethosTwoStacks = resolveCombatActionEffects({
      action: sethosAction,
      activeEffectIds: [sethosTwoStacksEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: sethosC6,
      teammates: []
    })
    const eulaBaseline = resolveCombatActionEffects({
      action: eulaExplosion,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: eulaC4,
      teammates: []
    })
    const eulaSnapshot = resolveCombatActionEffects({
      action: eulaExplosion,
      activeEffectIds: [eulaC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: eulaC6,
      teammates: []
    })
    const eulaSkillSnapshot = resolveCombatActionEffects({
      action: eulaSkill,
      activeEffectIds: [eulaC4EffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: eulaC4,
      teammates: []
    })
    const kinichC0Effects = resolveCombatActionEffects({
      action: kinichCannon,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kinichC0,
      teammates: []
    })
    const kinichC1Effects = resolveCombatActionEffects({
      action: kinichCannon,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kinichC1,
      teammates: []
    })
    const kinichBurstEffects = resolveCombatActionEffects({
      action: kinichBurst,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: kinichC1,
      teammates: []
    })
    const nahidaBaseline = resolveCombatActionEffects({
      action: xianglingAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [nahidaC2]
    })
    const nahidaSnapshot = resolveCombatActionEffects({
      action: xianglingAction,
      activeEffectIds: [nahidaC2EffectId],
      activeEffectSourceBuildIds: { [nahidaC2EffectId]: nahidaC2.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: xianglingNationalBuiltinBuild,
      teammates: [nahidaC2]
    })
    const gorouOneGeoBaseline = resolveCombatActionEffects({
      action: gorouAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gorouC6,
      primarySameElementTeammateCount: 0,
      teammates: []
    })
    const gorouOneGeoSnapshot = resolveCombatActionEffects({
      action: gorouAction,
      activeEffectIds: [gorouOneGeoEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: gorouC6,
      primarySameElementTeammateCount: 0,
      teammates: []
    })
    const gorouTwoGeoBaseline = resolveCombatActionEffects({
      action: naviaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: navia,
      primarySameElementTeammateCount: 1,
      teammates: [gorouC6]
    })
    const gorouTwoGeoSnapshot = resolveCombatActionEffects({
      action: naviaAction,
      activeEffectIds: [gorouTwoGeoEffectId],
      activeEffectSourceBuildIds: { [gorouTwoGeoEffectId]: gorouC6.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: navia,
      primarySameElementTeammateCount: 1,
      teammates: [gorouC6]
    })
    const gorouThreeGeoBaseline = resolveCombatActionEffects({
      action: naviaAction,
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: navia,
      primarySameElementTeammateCount: 2,
      teammates: [gorouC6, albedo]
    })
    const gorouThreeGeoSnapshot = resolveCombatActionEffects({
      action: naviaAction,
      activeEffectIds: [gorouThreeGeoEffectId],
      activeEffectSourceBuildIds: { [gorouThreeGeoEffectId]: gorouC6.buildId },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: navia,
      primarySameElementTeammateCount: 2,
      teammates: [gorouC6, albedo]
    })

    expect(sethosBaseline.critRate).toBeCloseTo(0.15)
    expect(sethosOneStack.damageBonus - sethosBaseline.damageBonus).toBeCloseTo(0.15)
    expect(sethosTwoStacks.damageBonus - sethosBaseline.damageBonus).toBeCloseTo(0.3)
    expect(eulaSnapshot.damageBonus - eulaBaseline.damageBonus).toBeCloseTo(0.25)
    expect(eulaSkillSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: eulaC4EffectId })]))
    expect(kinichC1Effects.critDamage - kinichC0Effects.critDamage).toBeCloseTo(1)
    expect(kinichBurstEffects.critDamage).toBeCloseTo(kinichC0Effects.critDamage)
    expect(nahidaSnapshot.enemyDefenseReduction - nahidaBaseline.enemyDefenseReduction).toBeCloseTo(0.3)
    expect(gorouOneGeoSnapshot.critDamage - gorouOneGeoBaseline.critDamage).toBeCloseTo(0.1)
    expect(gorouTwoGeoSnapshot.critDamage - gorouTwoGeoBaseline.critDamage).toBeCloseTo(0.2)
    expect(gorouThreeGeoSnapshot.critDamage - gorouThreeGeoBaseline.critDamage).toBeCloseTo(0.4)
  })
})
