import { getCombatActionDefinition, type CombatActionMetadata, xianglingNationalBuiltinBuild } from "@gscombat/content"
import { describe, expect, it } from "vitest"

import { resolveCombatActionEffects } from "./action-effects.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function withArtifactSet(setId: string) {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId })),
    buildId: `test.equipment.${setId}`,
    weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "TestNoWeapon" }
  }
}

function withWeapon(weaponId: string, refinement = 1) {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId: `test.equipment.${weaponId}`,
    weapon: { ascension: 6, level: 90, refinement, weaponId }
  }
}

function withHexereiSecretRite(teammates: readonly typeof xianglingNationalBuiltinBuild[]) {
  return [
    ...teammates,
    { ...withWeapon("TestNoWeapon"), buildId: "test.hexerei.mona", characterId: "Mona" },
    { ...withWeapon("TestNoWeapon"), buildId: "test.hexerei.venti", characterId: "Venti" }
  ]
}

function resolveEffects(actionId: string, setId: string, activeEffectIds: readonly string[] = []) {
  return resolveCombatActionEffects({
    action: requireAction(actionId),
    activeEffectIds,
    baseEnergyRecharge: 1,
    enemyCount: 1,
    moonsignLevel: "ascendant_gleam",
    primary: withArtifactSet(setId),
    teammates: []
  })
}

function resolveWeaponEffects(
  actionId: string,
  weaponId: string,
  activeEffectIds: readonly string[] = [],
  teammates: readonly typeof xianglingNationalBuiltinBuild[] = []
) {
  const resolvedTeammates = activeEffectIds.some((effectId) => effectId.includes(".magic-secret."))
    ? withHexereiSecretRite(teammates)
    : teammates
  return resolveCombatActionEffects({
    action: requireAction(actionId),
    activeEffectIds,
    baseEnergyRecharge: 1,
    enemyCount: 1,
    moonsignLevel: "ascendant_gleam",
    primary: withWeapon(weaponId),
    teammates: resolvedTeammates
  })
}

describe("current-action equipment effects", () => {
  it("resolves fully reviewed passive artifact clauses without inventing a rotation state", () => {
    const gambler = resolveEffects("xiangling.skill.guoba.single_flame_breath", "Gambler")
    const exile = resolveEffects("xiangling.skill.guoba.single_flame_breath", "TheExile")
    const scholar = resolveEffects("xiangling.skill.guoba.single_flame_breath", "Scholar")
    const sojourner = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "ResolutionOfSojourner")

    expect(gambler.damageBonus).toBeCloseTo(0.2)
    expect(exile.energyRecharge).toBeCloseTo(0.2)
    expect(scholar.energyRecharge).toBeCloseTo(0.2)
    expect(sojourner.attackPercent).toBeCloseTo(0.18)
    expect(sojourner.critRate).toBeCloseTo(0.3)
    expect(sojourner.appliedEffects.map((effect) => effect.id)).toEqual(
      expect.arrayContaining([
        "artifact.resolution-of-sojourner.2pc.attack-percent",
        "artifact.resolution-of-sojourner.4pc.charged-crit-rate"
      ])
    )
  })

  it("resolves reviewed fixed health and defense set bonuses at the flat-stat stage", () => {
    const adventurer = resolveEffects("xiangling.skill.guoba.single_flame_breath", "Adventurer")
    const luckyDog = resolveEffects("xiangling.skill.guoba.single_flame_breath", "LuckyDog")

    expect(adventurer.hpFlat).toBeCloseTo(1000)
    expect(adventurer.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "artifact.adventurer.2pc.flat-hp", value: 1000 })])
    )
    expect(luckyDog.defenseFlat).toBeCloseTo(100)
    expect(luckyDog.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "artifact.lucky-dog.2pc.flat-defense", value: 100 })])
    )
  })

  it("resolves automatic and explicitly selected artifact states at their declared damage stages", () => {
    const berserker = resolveEffects("xiangling.skill.guoba.single_flame_breath", "Berserker", [
      "artifact.berserker.4pc.low-hp-crit-rate"
    ])
    const bloodstained = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "BloodstainedChivalry", [
      "artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus"
    ])
    const braveHeart = resolveEffects("xiangling.skill.guoba.single_flame_breath", "BraveHeart", [
      "artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus"
    ])
    const deepwood = resolveEffects("collei.skill.floral_sidewinder.outbound.spread", "DeepwoodMemories", [
      "artifact.deepwood-memories.4pc.dendro-resistance-shred"
    ])
    const goldenTroupe = resolveEffects("xiangling.skill.guoba.single_flame_breath", "GoldenTroupe")
    const heartOfDepth = resolveEffects("xingqiu.skill.fatal_rainscreen", "HeartOfDepth")
    const heartOfDepthCharged = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "HeartOfDepth", [
      "artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus"
    ])

    expect(berserker.critRate).toBeCloseTo(0.36)
    expect(bloodstained.damageBonus).toBeCloseTo(0.5)
    expect(braveHeart.attackPercent).toBeCloseTo(0.18)
    expect(braveHeart.damageBonus).toBeCloseTo(0.3)
    expect(deepwood.damageBonus).toBeCloseTo(0.15)
    expect(deepwood.enemyResistanceReduction).toBeCloseTo(0.3)
    expect(goldenTroupe.damageBonus).toBeCloseTo(0.45)
    expect(heartOfDepth.damageBonus).toBeCloseTo(0.15)
    expect(heartOfDepthCharged.damageBonus).toBeCloseTo(0.3)
  })

  it("resolves Crimson Witch's four-piece bonus only for a declared Vaporize or Melt action", () => {
    const vaporize = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "CrimsonWitchOfFlames")
    const nonReaction = resolveEffects("xiangling.skill.guoba.single_flame_breath", "CrimsonWitchOfFlames")

    expect(vaporize.damageBonus).toBeCloseTo(0.15)
    expect(vaporize.amplifyingReactionBonus).toBeCloseTo(0.15)
    expect(vaporize.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
          target: "amplifyingReactionBonus",
          value: 0.15
        })
      ])
    )
    expect(nonReaction.amplifyingReactionBonus).toBe(0)
    expect(nonReaction.appliedEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus" })
      ])
    )
  })

  it("resolves Disenchantment in Deep Shadow's ordinary Superconduct bonus only for its reaction kind", () => {
    const superconductAction: CombatActionMetadata = {
      characterId: "Kaeya",
      damageKind: "transformative",
      element: "cryo",
      evaluator: "declared_transformative",
      id: "system.single-superconduct",
      kind: "damage",
      status: "verified",
      talentSlot: "skill",
      transformativeReaction: { kind: "superconduct" }
    }
    const sourceBuild = {
      ...withArtifactSet("DisenchantmentInDeepShadow"),
      buildId: "test.equipment.DisenchantmentInDeepShadow.Kaeya",
      characterId: "Kaeya",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const resolveForAction = (action: CombatActionMetadata) =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: sourceBuild,
        teammates: []
      })
    const superconduct = resolveForAction(superconductAction)
    const overload = resolveForAction({
      ...superconductAction,
      element: "pyro",
      id: "system.single-overload",
      transformativeReaction: { kind: "overload" }
    })

    expect(superconduct.reactionDamageBonus).toBeCloseTo(0.8)
    expect(superconduct.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus",
          target: "reactionDamageBonus",
          value: 0.8
        })
      ])
    )
    expect(overload.reactionDamageBonus).toBe(0)
  })

  it("resolves Instructor's automatic and selected party elemental-mastery states", () => {
    const automatic = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "Instructor")
    const active = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "Instructor", [
      "artifact.instructor.4pc.after-reaction.party-elemental-mastery"
    ])
    const teammateActive = resolveCombatActionEffects({
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      activeEffectIds: ["artifact.instructor.4pc.after-reaction.party-elemental-mastery"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      moonsignLevel: "ascendant_gleam",
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [withArtifactSet("Instructor")]
    })

    expect(automatic.elementalMastery).toBeCloseTo(80)
    expect(active.elementalMastery).toBeCloseTo(200)
    expect(teammateActive.elementalMastery).toBeCloseTo(120)
    expect(teammateActive.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.equipment.Instructor" })])
    )
    expect(active.appliedEffects.map((effect) => effect.id)).toEqual(
      expect.arrayContaining([
        "artifact.instructor.2pc.elemental-mastery",
        "artifact.instructor.4pc.after-reaction.party-elemental-mastery"
      ])
    )
  })

  it("resolves Silken Moon's Serenade's selected party moonsign mastery from its equipped holder", () => {
    const initialEffectId = "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery"
    const fullEffectId = "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"
    const initial = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "SilkenMoonsSerenade", [initialEffectId])
    const teammateFull = resolveCombatActionEffects({
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      activeEffectIds: [fullEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      moonsignLevel: "ascendant_gleam",
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [withArtifactSet("SilkenMoonsSerenade")]
    })

    expect(initial.elementalMastery).toBeCloseTo(60)
    expect(teammateFull.elementalMastery).toBeCloseTo(120)
    expect(teammateFull.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: fullEffectId, sourceId: "test.equipment.SilkenMoonsSerenade" })])
    )
    expect(() =>
      resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "SilkenMoonsSerenade", [initialEffectId, fullEffectId])
    ).toThrow("silken-moons-serenade-moonsign")
  })

  it("resolves every reviewed elemental-mastery two-piece effect while retaining unsupported four-piece clauses", () => {
    const reviewedSets = [
      "AubadeOfMorningstarAndMoon",
      "FlowerOfParadiseLost",
      "GildedDreams",
      "NightOfTheSkysUnveiling",
      "WanderersTroupe"
    ] as const

    for (const setId of reviewedSets) {
      expect(resolveEffects("xiangling.burst.pyronado.reverse_vaporize", setId).elementalMastery).toBeCloseTo(80)
    }
  })

  it("resolves directly representable normal, charged, elemental, and party artifact windows", () => {
    const martialArtist = resolveEffects("xiangling.normal.auto.first_hit", "MartialArtist", [
      "artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus"
    ])
    const shimenawa = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "ShimenawasReminiscence", [
      "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus"
    ])
    const desertTwoPiece = resolveEffects("xiao.burst.bane_of_all_evil.high_plunge", "DesertPavilionChronicle")
    const desertFourPiece = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "DesertPavilionChronicle", [
      "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus"
    ])
    const lavawalker = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "Lavawalker", [
      "artifact.lavawalker.4pc.pyro-aura.damage-bonus"
    ])
    const thundersoother = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "Thundersoother", [
      "artifact.thundersoother.4pc.electro-aura.damage-bonus"
    ])
    const tenacity = resolveEffects("xiangling.skill.guoba.single_flame_breath", "TenacityOfTheMillelith", [
      "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent"
    ])
    const retracingBolide = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "RetracingBolide", [
      "artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus"
    ])
    const defendersWill = resolveEffects("xiangling.skill.guoba.single_flame_breath", "DefendersWill")

    expect(martialArtist.damageBonus).toBeCloseTo(0.4)
    expect(shimenawa.attackPercent).toBeCloseTo(0.18)
    expect(shimenawa.damageBonus).toBeCloseTo(0.5)
    expect(desertTwoPiece.damageBonus).toBeCloseTo(0.15)
    expect(desertFourPiece.damageBonus).toBeCloseTo(0.4)
    expect(lavawalker.damageBonus).toBeCloseTo(0.35)
    expect(thundersoother.damageBonus).toBeCloseTo(0.35)
    expect(tenacity.hpPercent).toBeCloseTo(0.2)
    expect(tenacity.attackPercent).toBeCloseTo(0.2)
    expect(retracingBolide.damageBonus).toBeCloseTo(0.4)
    expect(defendersWill.defensePercent).toBeCloseTo(0.3)
  })

  it("resolves frozen target snapshots and a teammate's swirled-element resistance shred", () => {
    const blizzardStrayer = resolveEffects("ganyu.normal.frostflake_arrow.level_two.hit_and_bloom", "BlizzardStrayer", [
      "artifact.blizzard-strayer.4pc.cryo-aura.crit-rate",
      "artifact.blizzard-strayer.4pc.frozen.crit-rate"
    ])
    const viridescentTwoPiece = resolveEffects("xiao.burst.bane_of_all_evil.high_plunge", "ViridescentVenerer")
    const viridescentTeammate = resolveCombatActionEffects({
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      activeEffectIds: ["artifact.viridescent-venerer.4pc.after-pyro-swirl.pyro-resistance-shred"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [withArtifactSet("ViridescentVenerer")]
    })

    expect(blizzardStrayer.damageBonus).toBeCloseTo(0.15)
    expect(blizzardStrayer.critRate).toBeCloseTo(0.4)
    expect(viridescentTwoPiece.damageBonus).toBeCloseTo(0.15)
    expect(viridescentTeammate.enemyResistanceReduction).toBeCloseTo(0.4)
    expect(viridescentTeammate.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.equipment.ViridescentVenerer" })])
    )
  })

  it("resolves one Archaic Petra crystallize snapshot from its equipped party source", () => {
    const pyroEffectId = "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus"
    const hydroEffectId = "artifact.archaic-petra.4pc.crystallize.hydro-damage-bonus"
    const primarySource = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "ArchaicPetra", [pyroEffectId])
    const teammateSource = resolveCombatActionEffects({
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      activeEffectIds: [pyroEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [withArtifactSet("ArchaicPetra")]
    })
    const wrongElement = resolveEffects("xiangling.burst.pyronado.reverse_vaporize", "ArchaicPetra", [hydroEffectId])

    expect(primarySource.damageBonus).toBeCloseTo(0.35)
    expect(teammateSource.damageBonus).toBeCloseTo(0.35)
    expect(teammateSource.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: pyroEffectId, sourceId: "test.equipment.ArchaicPetra" })])
    )
    expect(wrongElement.damageBonus).toBe(0)
    expect(() =>
      resolveCombatActionEffects({
        action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
        activeEffectIds: [pyroEffectId, hydroEffectId],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: withArtifactSet("TestNoArtifactSet"),
        teammates: [withArtifactSet("ArchaicPetra")]
      })
    ).toThrow("archaic-petra-crystallize-element")
  })

  it("resolves one Scroll of the Hero of Cinder City reaction-element state from a party holder", () => {
    const standardEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus"
    const nightsoulEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
    const hydroEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.standard.damage-bonus"
    const teammate = { ...withArtifactSet("ScrollOfTheHeroOfCinderCity"), buildId: "test.cinder-city" }
    const nightsoulTeammate = {
      ...teammate,
      buildId: "test.cinder-city.xilonen",
      characterId: "Xilonen"
    }
    const baseInput = {
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [teammate]
    }
    const standard = resolveCombatActionEffects({ ...baseInput, activeEffectIds: [standardEffectId] })
    const nightsoul = resolveCombatActionEffects({
      ...baseInput,
      activeEffectIds: [nightsoulEffectId],
      teammates: [nightsoulTeammate]
    })
    const wrongElement = resolveCombatActionEffects({ ...baseInput, activeEffectIds: [hydroEffectId] })

    expect(standard.damageBonus).toBeCloseTo(0.12)
    expect(standard.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: standardEffectId, sourceId: teammate.buildId })])
    )
    expect(nightsoul.damageBonus).toBeCloseTo(0.4)
    expect(nightsoul.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: nightsoulEffectId, sourceId: nightsoulTeammate.buildId })])
    )
    expect(wrongElement.damageBonus).toBe(0)
    expect(() =>
      resolveCombatActionEffects({
        ...baseInput,
        activeEffectIds: [standardEffectId, nightsoulEffectId],
        teammates: [teammate, nightsoulTeammate]
      })
    ).toThrow("scroll-of-the-hero-of-cinder-city-reaction-element-pyro")
  })

  it("resolves one Celestial Gift team-buff state from its selected party holder", () => {
    const celestialGuidanceEffectId = "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus"
    const mortalHymnEffectId = "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
    const hydroEffectId = "artifact.celestial-gift.4pc.celestial-guidance.hydro.damage-bonus"
    const teammate = {
      ...withArtifactSet("CelestialGift"),
      buildId: "test.celestial-gift",
      characterId: "Mona"
    }
    const hexereiTeammate = { ...withWeapon("TestNoWeapon"), buildId: "test.celestial-gift.venti", characterId: "Venti" }
    const baseInput = {
      action: requireAction("xiangling.burst.pyronado.reverse_vaporize"),
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withArtifactSet("TestNoArtifactSet"),
      teammates: [teammate, hexereiTeammate]
    }
    const celestialGuidance = resolveCombatActionEffects({ ...baseInput, activeEffectIds: [celestialGuidanceEffectId] })
    const mortalHymn = resolveCombatActionEffects({ ...baseInput, activeEffectIds: [mortalHymnEffectId] })
    const wrongElement = resolveCombatActionEffects({ ...baseInput, activeEffectIds: [hydroEffectId] })

    expect(celestialGuidance.damageBonus).toBeCloseTo(0.2)
    expect(celestialGuidance.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: celestialGuidanceEffectId, sourceId: teammate.buildId })])
    )
    expect(mortalHymn.damageBonus).toBeCloseTo(0.4)
    expect(wrongElement.damageBonus).toBe(0)
    expect(() =>
      resolveCombatActionEffects({
        ...baseInput,
        activeEffectIds: [celestialGuidanceEffectId, mortalHymnEffectId]
      })
    ).toThrow("celestial-gift-4pc-pyro-damage-bonus")
  })

  it("resolves every newly reviewed conventional two-piece stat stage without pretending its four-piece is complete", () => {
    const archaicPetra = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "ArchaicPetra")
    const echoesOfAnOffering = resolveEffects("xiangling.skill.guoba.single_flame_breath", "EchoesOfAnOffering")
    const gladiatorsFinale = resolveEffects("xiangling.skill.guoba.single_flame_breath", "GladiatorsFinale")
    const thunderingFury = resolveEffects("raiden.burst.initial_slash", "ThunderingFury")

    expect(archaicPetra.damageBonus).toBeCloseTo(0.15)
    expect(echoesOfAnOffering.attackPercent).toBeCloseTo(0.18)
    expect(gladiatorsFinale.attackPercent).toBeCloseTo(0.18)
    expect(thunderingFury.damageBonus).toBeCloseTo(0.15)
  })

  it("resolves Gladiator's Finale and Wanderer's Troupe four-piece bonuses from the equipped weapon type", () => {
    const gladiatorsFinale = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: {
        ...withArtifactSet("GladiatorsFinale"),
        weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "TheCatch" }
      },
      teammates: []
    })
    const gladiatorsFinaleCatalyst = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: {
        ...withArtifactSet("GladiatorsFinale"),
        weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "FavoniusCodex" }
      },
      teammates: []
    })
    const wanderersTroupe = resolveCombatActionEffects({
      action: requireAction("ningguang.normal.charged_attack.with_star_jades"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: {
        ...withArtifactSet("WanderersTroupe"),
        buildId: "test.equipment.WanderersTroupe.Ningguang",
        characterId: "Ningguang",
        weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "FavoniusCodex" }
      },
      teammates: []
    })
    const wanderersTroupeSkill = resolveCombatActionEffects({
      action: requireAction("ningguang.skill.jade_screen.skill_damage"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: {
        ...withArtifactSet("WanderersTroupe"),
        buildId: "test.equipment.WanderersTroupe.Ningguang.skill",
        characterId: "Ningguang",
        weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "FavoniusCodex" }
      },
      teammates: []
    })

    expect(gladiatorsFinale.attackPercent).toBeCloseTo(0.18)
    expect(gladiatorsFinale.damageBonus).toBeCloseTo(0.35)
    expect(gladiatorsFinaleCatalyst.damageBonus).toBeCloseTo(0)
    expect(wanderersTroupe.elementalMastery).toBeCloseTo(80)
    expect(wanderersTroupe.damageBonus).toBeCloseTo(0.35)
    expect(wanderersTroupeSkill.damageBonus).toBeCloseTo(0)
  })

  it("resolves fully reviewed current-state artifact sets without inferring a rotation", () => {
    const risingWinds = resolveEffects("xiangling.skill.guoba.single_flame_breath", "ADayCarvedFromRisingWinds", [
      "artifact.a-day-carved-from-rising-winds.4pc.after-hit.attack-percent",
      "artifact.a-day-carved-from-rising-winds.4pc.completed-magical-trial.crit-rate"
    ])
    const deepGalleriesCharged = resolveEffects(
      "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      "FinaleOfTheDeepGalleries",
      ["artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus"]
    )
    const deepGalleriesNormal = resolveEffects(
      "skirk.skill.seven_phase_flash.normal.fifth_hit",
      "FinaleOfTheDeepGalleries",
      ["artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus"]
    )
    const nighttimeWhispers = resolveEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "NighttimeWhispersInTheEchoingWoods",
      [
        "artifact.nighttime-whispers-in-the-echoing-woods.4pc.after-skill.geo-damage-bonus",
        "artifact.nighttime-whispers-in-the-echoing-woods.4pc.crystallize-shield.extra-geo-damage-bonus"
      ]
    )
    const obsidianCodex = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: [
        "artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus",
        "artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate"
      ],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: { ...withArtifactSet("ObsidianCodex"), characterId: "Kachina" },
      teammates: []
    })

    expect(risingWinds.attackPercent).toBeCloseTo(0.43)
    expect(risingWinds.critRate).toBeCloseTo(0.2)
    expect(deepGalleriesCharged.damageBonus).toBeCloseTo(0.15)
    expect(deepGalleriesCharged.appliedEffects.map((effect) => effect.id)).not.toContain(
      "artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus"
    )
    expect(deepGalleriesNormal.damageBonus).toBeCloseTo(0.75)
    expect(deepGalleriesNormal.appliedEffects.map((effect) => effect.id)).toContain(
      "artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus"
    )
    expect(nighttimeWhispers.attackPercent).toBeCloseTo(0.18)
    expect(nighttimeWhispers.damageBonus).toBeCloseTo(0.5)
    expect(obsidianCodex.damageBonus).toBeCloseTo(0.15)
    expect(obsidianCodex.critRate).toBeCloseTo(0.4)
  })

  it("resolves artifact base clauses separately from their selected stack snapshots", () => {
    const disenchantment = resolveEffects("xiangling.skill.guoba.single_flame_breath", "DisenchantmentInDeepShadow", [
      "artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate"
    ])
    const husk = resolveEffects("xiangling.skill.guoba.single_flame_breath", "HuskOfOpulentDreams")
    const marechaussee = resolveEffects("xiangling.normal.auto.first_hit", "MarechausseeHunter")
    const paleFlame = resolveEffects("xiangling.normal.auto.first_hit", "PaleFlame")
    const vermillion = resolveEffects("xiangling.skill.guoba.single_flame_breath", "VermillionHereafter", [
      "artifact.vermillion-hereafter.4pc.after-burst.attack-percent"
    ])
    const vourukashasGlow = resolveEffects("xiangling.skill.guoba.single_flame_breath", "VourukashasGlow")

    expect(disenchantment.attackPercent).toBeCloseTo(0.18)
    expect(disenchantment.critRate).toBeCloseTo(0.16)
    expect(husk.defensePercent).toBeCloseTo(0.3)
    expect(marechaussee.damageBonus).toBeCloseTo(0.15)
    expect(paleFlame.damageBonus).toBeCloseTo(0.25)
    expect(vermillion.attackPercent).toBeCloseTo(0.26)
    expect(vourukashasGlow.hpPercent).toBeCloseTo(0.2)
    expect(vourukashasGlow.damageBonus).toBeCloseTo(0.1)
  })

  it("resolves Husk and Pale Flame's selected current stacks without inferring their trigger timers", () => {
    const huskOneStack = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "HuskOfOpulentDreams", [
      "artifact.husk-of-opulent-dreams.4pc.curiosity.1-stack.defense-percent",
      "artifact.husk-of-opulent-dreams.4pc.curiosity.1-stack.geo-damage-bonus"
    ])
    const huskFourStacks = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "HuskOfOpulentDreams", [
      "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.defense-percent",
      "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.geo-damage-bonus"
    ])
    const paleFlameOneStack = resolveEffects("xiangling.normal.auto.first_hit", "PaleFlame", [
      "artifact.pale-flame.4pc.skill-hit.1-stack.attack-percent"
    ])
    const paleFlameTwoStacks = resolveEffects("xiangling.normal.auto.first_hit", "PaleFlame", [
      "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent",
      "artifact.pale-flame.4pc.skill-hit.2-stack.extra-physical-damage-bonus"
    ])
    const paleFlameTwoStacksNonPhysical = resolveEffects("xiangling.skill.guoba.single_flame_breath", "PaleFlame", [
      "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent",
      "artifact.pale-flame.4pc.skill-hit.2-stack.extra-physical-damage-bonus"
    ])

    expect(huskOneStack.defensePercent).toBeCloseTo(0.36)
    expect(huskOneStack.damageBonus).toBeCloseTo(0.06)
    expect(huskFourStacks.defensePercent).toBeCloseTo(0.54)
    expect(huskFourStacks.damageBonus).toBeCloseTo(0.24)
    expect(paleFlameOneStack.attackPercent).toBeCloseTo(0.09)
    expect(paleFlameOneStack.damageBonus).toBeCloseTo(0.25)
    expect(paleFlameTwoStacks.attackPercent).toBeCloseTo(0.18)
    expect(paleFlameTwoStacks.damageBonus).toBeCloseTo(0.5)
    expect(paleFlameTwoStacksNonPhysical.attackPercent).toBeCloseTo(0.18)
    expect(paleFlameTwoStacksNonPhysical.damageBonus).toBeCloseTo(0)
    expect(() =>
      resolveEffects("xiangling.normal.auto.first_hit", "PaleFlame", [
        "artifact.pale-flame.4pc.skill-hit.1-stack.attack-percent",
        "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent"
      ])
    ).toThrow("pale-flame-skill-hit")
  })

  it("resolves Nymph's Dream's selected Mirrored Nymph stack snapshot", () => {
    const oneStack = resolveEffects("xingqiu.skill.fatal_rainscreen", "NymphsDream", [
      "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.attack-percent",
      "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.hydro-damage-bonus"
    ])
    const threeStacks = resolveEffects("xingqiu.skill.fatal_rainscreen", "NymphsDream", [
      "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.attack-percent",
      "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.hydro-damage-bonus"
    ])
    const threeStacksNonHydro = resolveEffects("xiangling.skill.guoba.single_flame_breath", "NymphsDream", [
      "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.attack-percent",
      "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.hydro-damage-bonus"
    ])

    expect(oneStack.attackPercent).toBeCloseTo(0.07)
    expect(oneStack.damageBonus).toBeCloseTo(0.19)
    expect(threeStacks.attackPercent).toBeCloseTo(0.25)
    expect(threeStacks.damageBonus).toBeCloseTo(0.3)
    expect(threeStacksNonHydro.attackPercent).toBeCloseTo(0.25)
    expect(threeStacksNonHydro.damageBonus).toBeCloseTo(0)
    expect(() =>
      resolveEffects("xingqiu.skill.fatal_rainscreen", "NymphsDream", [
        "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.attack-percent",
        "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.attack-percent"
      ])
    ).toThrow("nymphs-dream-mirrored-nymph")
  })

  it("resolves Crimson Witch's selected Elemental Skill stack snapshot without inferring its duration", () => {
    const oneStack = resolveEffects("xiangling.skill.guoba.single_flame_breath", "CrimsonWitchOfFlames", [
      "artifact.crimson-witch-of-flames.4pc.skill-cast.1-stack.extra-pyro-damage-bonus"
    ])
    const threeStacks = resolveEffects("xiangling.skill.guoba.single_flame_breath", "CrimsonWitchOfFlames", [
      "artifact.crimson-witch-of-flames.4pc.skill-cast.3-stack.extra-pyro-damage-bonus"
    ])
    const threeStacksNonPyro = resolveEffects("ningguang.normal.charged_attack.with_star_jades", "CrimsonWitchOfFlames", [
      "artifact.crimson-witch-of-flames.4pc.skill-cast.3-stack.extra-pyro-damage-bonus"
    ])

    expect(oneStack.damageBonus).toBeCloseTo(0.225)
    expect(threeStacks.damageBonus).toBeCloseTo(0.375)
    expect(threeStacksNonPyro.damageBonus).toBeCloseTo(0)
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "CrimsonWitchOfFlames", [
        "artifact.crimson-witch-of-flames.4pc.skill-cast.1-stack.extra-pyro-damage-bonus",
        "artifact.crimson-witch-of-flames.4pc.skill-cast.3-stack.extra-pyro-damage-bonus"
      ])
    ).toThrow("crimson-witch-of-flames-skill-cast")
  })

  it("resolves remaining conventional reviewed two-piece artifact stages", () => {
    const celestialGift = resolveEffects("xiangling.skill.guoba.single_flame_breath", "CelestialGift")
    const crimsonWitch = resolveEffects("xiangling.skill.guoba.single_flame_breath", "CrimsonWitchOfFlames")
    const harmonicWhimsy = resolveEffects("xiangling.skill.guoba.single_flame_breath", "FragmentOfHarmonicWhimsy")
    const longNightsOath = resolveEffects("xiao.burst.bane_of_all_evil.high_plunge", "LongNightsOath")
    const nymphsDream = resolveEffects("xingqiu.skill.fatal_rainscreen", "NymphsDream")
    const silkenMoonsSerenade = resolveEffects("xiangling.skill.guoba.single_flame_breath", "SilkenMoonsSerenade")
    const unfinishedReverie = resolveEffects("xiangling.skill.guoba.single_flame_breath", "UnfinishedReverie")

    expect(celestialGift.energyRecharge).toBeCloseTo(0.2)
    expect(crimsonWitch.damageBonus).toBeCloseTo(0.15)
    expect(harmonicWhimsy.attackPercent).toBeCloseTo(0.18)
    expect(longNightsOath.damageBonus).toBeCloseTo(0.25)
    expect(nymphsDream.damageBonus).toBeCloseTo(0.15)
    expect(silkenMoonsSerenade.energyRecharge).toBeCloseTo(0.2)
    expect(unfinishedReverie.attackPercent).toBeCloseTo(0.18)
  })

  it("resolves selectable artifact stack snapshots without inferring their trigger histories", () => {
    const marechausseeThreeStacks = resolveEffects("xiangling.normal.auto.first_hit", "MarechausseeHunter", [
      "artifact.marechaussee-hunter.4pc.hp-change.3-stack.crit-rate"
    ])
    const harmonicWhimsyThreeStacks = resolveEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "FragmentOfHarmonicWhimsy",
      ["artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.3-stack.damage-bonus"]
    )
    const longNightsOathFiveStacks = resolveEffects("xiao.burst.bane_of_all_evil.high_plunge", "LongNightsOath", [
      "artifact.long-nights-oath.4pc.radiance-everlasting.5-stack.plunge-damage-bonus"
    ])
    const longNightsOathWrongAction = resolveEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "LongNightsOath",
      ["artifact.long-nights-oath.4pc.radiance-everlasting.5-stack.plunge-damage-bonus"]
    )

    expect(marechausseeThreeStacks.damageBonus).toBeCloseTo(0.15)
    expect(marechausseeThreeStacks.critRate).toBeCloseTo(0.36)
    expect(harmonicWhimsyThreeStacks.attackPercent).toBeCloseTo(0.18)
    expect(harmonicWhimsyThreeStacks.damageBonus).toBeCloseTo(0.54)
    expect(longNightsOathFiveStacks.damageBonus).toBeCloseTo(1)
    expect(longNightsOathWrongAction.damageBonus).toBe(0)
    expect(() =>
      resolveEffects("xiangling.normal.auto.first_hit", "MarechausseeHunter", [
        "artifact.marechaussee-hunter.4pc.hp-change.1-stack.crit-rate",
        "artifact.marechaussee-hunter.4pc.hp-change.3-stack.crit-rate"
      ])
    ).toThrow("marechaussee-hunter-hp-change")
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "FragmentOfHarmonicWhimsy", [
        "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.1-stack.damage-bonus",
        "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.3-stack.damage-bonus"
      ])
    ).toThrow("fragment-of-harmonic-whimsy-bond-of-life-change")
    expect(() =>
      resolveEffects("xiao.burst.bane_of_all_evil.high_plunge", "LongNightsOath", [
        "artifact.long-nights-oath.4pc.radiance-everlasting.1-stack.plunge-damage-bonus",
        "artifact.long-nights-oath.4pc.radiance-everlasting.5-stack.plunge-damage-bonus"
      ])
    ).toThrow("long-nights-oath-radiance-everlasting")
  })

  it("resolves mutually exclusive current-action snapshots for Vermillion, Vourukasha, and Unfinished Reverie", () => {
    const vermillionFourStacks = resolveEffects("xiangling.skill.guoba.single_flame_breath", "VermillionHereafter", [
      "artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"
    ])
    const vourukashasGlowSkill = resolveEffects("xiangling.skill.guoba.single_flame_breath", "VourukashasGlow", [
      "artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"
    ])
    const vourukashasGlowNormal = resolveEffects("xiangling.normal.auto.first_hit", "VourukashasGlow", [
      "artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"
    ])
    const unfinishedReverieFull = resolveEffects("xiangling.skill.guoba.single_flame_breath", "UnfinishedReverie", [
      "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus"
    ])
    const unfinishedReverieFirstSecondAfterGrace = resolveEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "UnfinishedReverie",
      ["artifact.unfinished-reverie.4pc.post-burning.grace-expired.1-second.damage-bonus"]
    )

    expect(vermillionFourStacks.attackPercent).toBeCloseTo(0.66)
    expect(vourukashasGlowSkill.hpPercent).toBeCloseTo(0.2)
    expect(vourukashasGlowSkill.damageBonus).toBeCloseTo(0.5)
    expect(vourukashasGlowNormal.hpPercent).toBeCloseTo(0.2)
    expect(vourukashasGlowNormal.damageBonus).toBe(0)
    expect(unfinishedReverieFull.attackPercent).toBeCloseTo(0.18)
    expect(unfinishedReverieFull.damageBonus).toBeCloseTo(0.5)
    expect(unfinishedReverieFirstSecondAfterGrace.damageBonus).toBeCloseTo(0.4)
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "VermillionHereafter", [
        "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
        "artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"
      ])
    ).toThrow("vermillion-hereafter-after-burst-hp-loss")
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "VourukashasGlow", [
        "artifact.vourukashas-glow.4pc.taking-damage.1-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"
      ])
    ).toThrow("vourukashas-glow-taking-damage")
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "UnfinishedReverie", [
        "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus",
        "artifact.unfinished-reverie.4pc.post-burning.grace-expired.1-second.damage-bonus"
      ])
    ).toThrow("unfinished-reverie-damage-bonus-state")
  })

  it("resolves the selected Night of the Sky's Unveiling moonsign snapshot and rejects both at once", () => {
    const initialEffectId = "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate"
    const fullEffectId = "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"
    const initial = resolveEffects("xiangling.skill.guoba.single_flame_breath", "NightOfTheSkysUnveiling", [initialEffectId])
    const full = resolveEffects("xiangling.skill.guoba.single_flame_breath", "NightOfTheSkysUnveiling", [fullEffectId])

    expect(initial.critRate).toBeCloseTo(0.15)
    expect(full.critRate).toBeCloseTo(0.3)
    expect(full.appliedEffects).toEqual(expect.arrayContaining([expect.objectContaining({ id: fullEffectId, value: 0.3 })]))
    expect(() =>
      resolveEffects("xiangling.skill.guoba.single_flame_breath", "NightOfTheSkysUnveiling", [initialEffectId, fullEffectId])
    ).toThrow("night-of-the-skys-unveiling-moonsign")
  })

  it("resolves reviewed weapon passives and one explicit current-hit proc without a rotation simulator", () => {
    const festering = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FesteringDesire")
    const blackSword = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "TheBlackSword")
    const katsuragikiri = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "KatsuragikiriNagamasa")
    const whiteTassel = resolveWeaponEffects("xiangling.normal.auto.first_hit", "WhiteTassel")
    const skywardPride = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SkywardPride", [
      "weapon.skyward-pride.vacuum-blade"
    ])
    const seaLord = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "LuxuriousSeaLord", [
      "weapon.luxurious-sea-lord.tuna-impact"
    ])
    const kitain = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "KitainCrossSpear")

    expect(festering.damageBonus).toBeCloseTo(0.16)
    expect(festering.critRate).toBeCloseTo(0.06)
    expect(blackSword.damageBonus).toBeCloseTo(0.2)
    expect(katsuragikiri.damageBonus).toBeCloseTo(0.06)
    expect(whiteTassel.damageBonus).toBeCloseTo(0.24)
    expect(skywardPride.damageBonus).toBeCloseTo(0.08)
    expect(skywardPride.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.8, element: "physical" })])
    )
    expect(seaLord.damageBonus).toBeCloseTo(0.12)
    expect(seaLord.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 1, element: "physical" })])
    )
    expect(kitain.damageBonus).toBeCloseTo(0.06)
  })

  it("resolves a self-owned same-hit additive term without creating an independent damage event", () => {
    const redhorn = resolveWeaponEffects("xiangling.normal.auto.first_hit", "RedhornStonethresher")

    expect(redhorn.additionalDamageEvents).toEqual([])
    expect(redhorn.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({
        coefficient: 0.4,
        id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
        scalingStat: "defense"
      })
    ])
    expect(redhorn.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
          target: "matchedActionAdditiveDamageTerm",
          value: 0.4
        })
      ])
    )
  })

  it("resolves Cinnabar Spindle only for Albedo's selected cooldown-ready Transient Blossom", () => {
    const effectId = "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"
    const resolveCinnabar = (actionId: string, refinement: number, activeEffectIds: readonly string[]) =>
      resolveCombatActionEffects({
        action: requireAction(actionId),
        activeEffectIds,
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: {
          ...withWeapon("CinnabarSpindle", refinement),
          characterId: "Albedo",
          talents: { burst: 10, normal: 10, skill: 10 }
        },
        teammates: []
      })
    const inactive = resolveCinnabar("albedo.skill.transient_blossom", 1, [])
    const r1 = resolveCinnabar("albedo.skill.transient_blossom", 1, [effectId])
    const r5 = resolveCinnabar("albedo.skill.transient_blossom", 5, [effectId])
    const wrongAction = resolveCinnabar("albedo.skill.abiogenesis_solar_isotoma.initial_hit", 1, [effectId])

    expect(inactive.matchedActionAdditiveDamageTerms).toEqual([])
    expect(r1.additionalDamageEvents).toEqual([])
    expect(r1.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.4, id: effectId, scalingStat: "defense" })
    ])
    expect(r5.matchedActionAdditiveDamageTerms).toEqual([
      expect.objectContaining({ coefficient: 0.8, id: effectId, scalingStat: "defense" })
    ])
    expect(wrongAction.matchedActionAdditiveDamageTerms).toEqual([])
  })

  it("resolves refinement tables for unconditional and selected weapon snapshots", () => {
    const stringless = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheStringless")
    const rustNormal = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Rust")
    const rustCharged = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "Rust")
    const mouunsMoon = resolveWeaponEffects(
      "xiangling.burst.pyronado.reverse_vaporize",
      "MouunsMoon",
      [],
      [
        { ...xianglingNationalBuiltinBuild, buildId: "test.mouun.teammate-1" },
        { ...xianglingNationalBuiltinBuild, buildId: "test.mouun.teammate-2" },
        { ...xianglingNationalBuiltinBuild, buildId: "test.mouun.teammate-3" }
      ]
    )
    const raven = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "RavenBow", [
      "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus"
    ])
    const magicGuide = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MagicGuide", [
      "weapon.magic-guide.hydro-or-electro-aura.damage-bonus"
    ])
    const emeraldOrb = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "EmeraldOrb", [
      "weapon.emerald-orb.after-hydro-reaction.attack-percent"
    ])
    const solarPearl = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SolarPearl", [
      "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus"
    ])
    const dodoco = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "DodocoTales", [
      "weapon.dodoco-tales.after-normal-hit.charged-damage-bonus"
    ])
    const oathswornEye = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "OathswornEye", [
      "weapon.oathsworn-eye.after-skill.energy-recharge"
    ])

    expect(stringless.damageBonus).toBeCloseTo(0.24)
    expect(rustNormal.damageBonus).toBeCloseTo(0.4)
    expect(rustCharged.damageBonus).toBeCloseTo(-0.1)
    expect(mouunsMoon.damageBonus).toBeCloseTo(0.384)
    expect(raven.damageBonus).toBeCloseTo(0.12)
    expect(magicGuide.damageBonus).toBeCloseTo(0.12)
    expect(emeraldOrb.attackPercent).toBeCloseTo(0.2)
    expect(solarPearl.damageBonus).toBeCloseTo(0.2)
    expect(dodoco.damageBonus).toBeCloseTo(0.16)
    expect(oathswornEye.energyRecharge).toBeCloseTo(0.24)
  })

  it("resolves reviewed elemental-mastery weapon windows without inferring their trigger sequence", () => {
    const starcallersWatch = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "StarcallersWatch", [
      "weapon.starcallers-watch.shielded.damage-bonus"
    ])
    const elegy = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "ElegyForTheEnd")
    const etherlight = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "EtherlightSpindlelute", [
      "weapon.etherlight-spindlelute.after-skill.elemental-mastery"
    ])
    const dawningFrost = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "DawningFrost", [
      "weapon.dawning-frost.after-charged-hit.elemental-mastery",
      "weapon.dawning-frost.after-skill-hit.elemental-mastery"
    ])
    const sunnyMorning = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "SunnyMorningSleepIn", [
      "weapon.sunny-morning-sleep-in.after-swirl.elemental-mastery",
      "weapon.sunny-morning-sleep-in.after-skill-hit.elemental-mastery",
      "weapon.sunny-morning-sleep-in.after-burst-hit.elemental-mastery"
    ])
    const kingsSquire = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "KingsSquire", [
      "weapon.kings-squire.after-skill-or-burst.elemental-mastery"
    ])
    const flameForgedInsight = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "FlameForgedInsight", [
      "weapon.flame-forged-insight.after-listed-reaction.elemental-mastery"
    ])

    expect(starcallersWatch.elementalMastery).toBeCloseTo(100)
    expect(starcallersWatch.damageBonus).toBeCloseTo(0.28)
    expect(elegy.elementalMastery).toBeCloseTo(60)
    expect(etherlight.elementalMastery).toBeCloseTo(100)
    expect(dawningFrost.elementalMastery).toBeCloseTo(120)
    expect(sunnyMorning.elementalMastery).toBeCloseTo(248)
    expect(kingsSquire.elementalMastery).toBeCloseTo(60)
    expect(flameForgedInsight.elementalMastery).toBeCloseTo(60)
  })

  it("resolves reviewed shield, healing, reaction, and post-skill weapon windows", () => {
    const calamityOfEshu = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "CalamityOfEshu", [
      "weapon.calamity-of-eshu.shielded.normal-charged-damage-bonus",
      "weapon.calamity-of-eshu.shielded.normal-charged-crit-rate"
    ])
    const fluteOfEzpitzal = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FluteOfEzpitzal", [
      "weapon.flute-of-ezpitzal.after-skill.defense-percent"
    ])
    const tidalShadow = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TidalShadow", [
      "weapon.tidal-shadow.after-heal.attack-percent"
    ])
    const earthShaker = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "EarthShaker", [
      "weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus"
    ])
    const tamayuratei = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TamayurateiNoOhanashi", [
      "weapon.tamayuratei-no-ohanashi.after-skill.attack-percent"
    ])
    const footprint = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FootprintOfTheRainbow", [
      "weapon.footprint-of-the-rainbow.after-skill.defense-percent"
    ])
    const fleuve = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FleuveCendreFerryman", [
      "weapon.fleuve-cendre-ferryman.after-skill.energy-recharge"
    ])
    const harbinger = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "HarbingerOfDawn", [
      "weapon.harbinger-of-dawn.hp-above-90.crit-rate"
    ])
    const skyrider = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SkyriderSword", [
      "weapon.skyrider-sword.after-burst.attack-percent"
    ])

    expect(calamityOfEshu.damageBonus).toBeCloseTo(0.2)
    expect(calamityOfEshu.critRate).toBeCloseTo(0.08)
    expect(fluteOfEzpitzal.defensePercent).toBeCloseTo(0.16)
    expect(tidalShadow.attackPercent).toBeCloseTo(0.24)
    expect(earthShaker.damageBonus).toBeCloseTo(0.16)
    expect(tamayuratei.attackPercent).toBeCloseTo(0.2)
    expect(footprint.defensePercent).toBeCloseTo(0.16)
    expect(fleuve.critRate).toBeCloseTo(0.08)
    expect(fleuve.energyRecharge).toBeCloseTo(0.16)
    expect(harbinger.critRate).toBeCloseTo(0.14)
    expect(skyrider.attackPercent).toBeCloseTo(0.12)
  })

  it("resolves the next reviewed weapon batch, including a teammate-held team weapon at its own refinement", () => {
    const akuoumaru = resolveWeaponEffects(
      "xiangling.burst.pyronado.reverse_vaporize",
      "Akuoumaru",
      [],
      [
        { ...xianglingNationalBuiltinBuild, buildId: "test.akuoumaru.teammate-1" },
        { ...xianglingNationalBuiltinBuild, buildId: "test.akuoumaru.teammate-2" },
        { ...xianglingNationalBuiltinBuild, buildId: "test.akuoumaru.teammate-3" }
      ]
    )
    const beacon = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "BeaconOfTheReedSea", [
      "weapon.beacon-of-the-reed-sea.after-skill-hit.attack-percent",
      "weapon.beacon-of-the-reed-sea.after-taking-damage.attack-percent",
      "weapon.beacon-of-the-reed-sea.unshielded.hp-percent"
    ])
    const dragonsBane = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "DragonsBane", [
      "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus"
    ])
    const forestRegalia = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ForestRegalia", [
      "weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery"
    ])
    const lionsRoar = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LionsRoar", [
      "weapon.lions-roar.pyro-or-electro-aura.damage-bonus"
    ])
    const missiveWindspear = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MissiveWindspear", [
      "weapon.missive-windspear.after-reaction.attack-percent",
      "weapon.missive-windspear.after-reaction.elemental-mastery"
    ])
    const moonpiercer = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Moonpiercer", [
      "weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent"
    ])
    const rainslasher = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Rainslasher", [
      "weapon.rainslasher.hydro-or-electro-aura.damage-bonus"
    ])
    const songOfStillness = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SongOfStillness", [
      "weapon.song-of-stillness.after-heal.damage-bonus"
    ])
    const alleyFlash = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheAlleyFlash", [
      "weapon.the-alley-flash.damage-bonus-ready"
    ])
    const toukabouShigure = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ToukabouShigure", [
      "weapon.toukabou-shigure.cursed-parasol-target.damage-bonus"
    ])
    const teammateWolfsGravestone = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: ["weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("WolfsGravestone", 5), buildId: "test.wolfs-gravestone.r5-teammate" }]
    })

    expect(akuoumaru.damageBonus).toBeCloseTo(0.384)
    expect(beacon.attackPercent).toBeCloseTo(0.4)
    expect(beacon.hpPercent).toBeCloseTo(0.32)
    expect(dragonsBane.damageBonus).toBeCloseTo(0.2)
    expect(forestRegalia.elementalMastery).toBeCloseTo(60)
    expect(lionsRoar.damageBonus).toBeCloseTo(0.2)
    expect(missiveWindspear.attackPercent).toBeCloseTo(0.12)
    expect(missiveWindspear.elementalMastery).toBeCloseTo(48)
    expect(moonpiercer.attackPercent).toBeCloseTo(0.16)
    expect(rainslasher.damageBonus).toBeCloseTo(0.2)
    expect(songOfStillness.damageBonus).toBeCloseTo(0.16)
    expect(alleyFlash.damageBonus).toBeCloseTo(0.12)
    expect(toukabouShigure.damageBonus).toBeCloseTo(0.16)
    expect(teammateWolfsGravestone.attackPercent).toBeCloseTo(0.8)
    expect(teammateWolfsGravestone.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.wolfs-gravestone.r5-teammate" })])
    )
  })

  it("resolves the reviewed P3 weapon states, team holders, and matching Millennial Movement conflicts", () => {
    const freedomSworn = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [
        "weapon.freedom-sworn.full-sigil.party-attack-percent",
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
      ],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("FreedomSworn", 5), buildId: "test.freedom-sworn.r5-teammate" }]
    })
    const cranesEchoingCall = resolveCombatActionEffects({
      action: requireAction("xiao.burst.bane_of_all_evil.high_plunge"),
      activeEffectIds: ["weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("CranesEchoingCall", 5), buildId: "test.cranes-echoing-call.r5-teammate" }]
    })
    const crescentPike = resolveWeaponEffects("xiangling.normal.auto.first_hit", "CrescentPike", [
      "weapon.crescent-pike.after-particle.additional-physical-damage"
    ])
    const hamayumi = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Hamayumi", [
      "weapon.hamayumi.full-energy.normal-damage-bonus"
    ])
    const mitternachtsWaltz = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MitternachtsWaltz", [
      "weapon.mitternachts-waltz.after-normal-hit.skill-damage-bonus"
    ])
    const prototypeCrescent = resolveWeaponEffects("xiangling.normal.auto.first_hit", "PrototypeCrescent", [
      "weapon.prototype-crescent.after-weak-point-hit.attack-percent"
    ])
    const kagotsurubeIsshin = resolveWeaponEffects("xiangling.normal.auto.first_hit", "KagotsurubeIsshin", [
      "weapon.kagotsurube-isshin.physical-hit",
      "weapon.kagotsurube-isshin.after-hit.attack-percent"
    ])
    const mailedFlower = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MailedFlower", [
      "weapon.mailed-flower.after-skill-hit-or-reaction.attack-percent",
      "weapon.mailed-flower.after-skill-hit-or-reaction.elemental-mastery"
    ])
    const prototypeArchaic = resolveWeaponEffects("xiangling.normal.auto.first_hit", "PrototypeArchaic", [
      "weapon.prototype-archaic.physical-hit"
    ])
    const sapwoodBlade = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: ["weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("SapwoodBlade", 5), buildId: "test.sapwood-blade.r5-teammate" }]
    })
    const songOfBrokenPines = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.song-of-broken-pines.full-sigil.party-attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("SongOfBrokenPines", 5), buildId: "test.song-of-broken-pines.r5-teammate" }]
    })
    const wineAndSong = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "WineAndSong", [
      "weapon.wine-and-song.after-sprint.attack-percent"
    ])

    expect(freedomSworn.attackPercent).toBeCloseTo(0.4)
    expect(freedomSworn.damageBonus).toBeCloseTo(0.32)
    expect(freedomSworn.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.freedom-sworn.r5-teammate" })])
    )
    expect(cranesEchoingCall.damageBonus).toBeCloseTo(0.8)
    expect(crescentPike.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.2, element: "physical" })])
    )
    expect(hamayumi.damageBonus).toBeCloseTo(0.32)
    expect(mitternachtsWaltz.damageBonus).toBeCloseTo(0.2)
    expect(prototypeCrescent.attackPercent).toBeCloseTo(0.36)
    expect(kagotsurubeIsshin.attackPercent).toBeCloseTo(0.15)
    expect(kagotsurubeIsshin.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 1.8, element: "physical" })])
    )
    expect(mailedFlower.attackPercent).toBeCloseTo(0.12)
    expect(mailedFlower.elementalMastery).toBeCloseTo(48)
    expect(prototypeArchaic.additionalDamageEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ coefficient: 2.4, element: "physical", expectedTriggerProbability: 0.5 })
      ])
    )
    expect(sapwoodBlade.elementalMastery).toBeCloseTo(120)
    expect(sapwoodBlade.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.sapwood-blade.r5-teammate" })])
    )
    expect(songOfBrokenPines.attackPercent).toBeCloseTo(0.4)
    expect(wineAndSong.attackPercent).toBeCloseTo(0.2)
    expect(() =>
      resolveCombatActionEffects({
        action: requireAction("xiangling.normal.auto.first_hit"),
        activeEffectIds: [
          "weapon.freedom-sworn.full-sigil.party-attack-percent",
          "weapon.song-of-broken-pines.full-sigil.party-attack-percent"
        ],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: withWeapon("TestNoWeapon"),
        teammates: [
          { ...withWeapon("FreedomSworn"), buildId: "test.freedom-sworn.teammate" },
          { ...withWeapon("SongOfBrokenPines"), buildId: "test.song-of-broken-pines.teammate" }
        ]
      })
    ).toThrow("millennial-movement")
    const nonMatchingMillennialMovementEffects = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus",
        "weapon.song-of-broken-pines.full-sigil.party-attack-percent"
      ],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [
        { ...withWeapon("FreedomSworn"), buildId: "test.freedom-sworn.damage-teammate" },
        { ...withWeapon("SongOfBrokenPines"), buildId: "test.song-of-broken-pines.damage-teammate" }
      ]
    })
    expect(nonMatchingMillennialMovementEffects.attackPercent).toBeCloseTo(0.2)
    expect(nonMatchingMillennialMovementEffects.damageBonus).toBeCloseTo(0.16)
  })

  it("resolves Elegy's selected full-sigil buffs and only excludes matching Millennial Movement stats", () => {
    const elegyR5Teammate = { ...withWeapon("ElegyForTheEnd", 5), buildId: "test.elegy.r5-teammate" }
    const freedomSwornR5Teammate = { ...withWeapon("FreedomSworn", 5), buildId: "test.freedom-sworn.r5-teammate" }
    const activeElegyEffectIds = [
      "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
      "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery"
    ]
    const teammateElegy = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: activeElegyEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [elegyR5Teammate]
    })
    const primaryElegy = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: activeElegyEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("ElegyForTheEnd", 5),
      teammates: []
    })
    const inactiveElegy = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [elegyR5Teammate]
    })
    const compatibleMillennialMovementEffects = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [
        "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery",
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
      ],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [elegyR5Teammate, freedomSwornR5Teammate]
    })

    expect(teammateElegy.attackPercent).toBeCloseTo(0.4)
    expect(teammateElegy.elementalMastery).toBeCloseTo(200)
    expect(teammateElegy.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
          sourceId: "test.elegy.r5-teammate"
        }),
        expect.objectContaining({
          id: "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery",
          sourceId: "test.elegy.r5-teammate"
        })
      ])
    )
    expect(primaryElegy.attackPercent).toBeCloseTo(0.4)
    expect(primaryElegy.elementalMastery).toBeCloseTo(320)
    expect(inactiveElegy.attackPercent).toBeCloseTo(0)
    expect(inactiveElegy.elementalMastery).toBeCloseTo(0)
    expect(compatibleMillennialMovementEffects.damageBonus).toBeCloseTo(0.32)
    expect(compatibleMillennialMovementEffects.elementalMastery).toBeCloseTo(200)
    expect(() =>
      resolveCombatActionEffects({
        action: requireAction("xiangling.normal.auto.first_hit"),
        activeEffectIds: [
          "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
          "weapon.freedom-sworn.full-sigil.party-attack-percent"
        ],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: withWeapon("TestNoWeapon"),
        teammates: [elegyR5Teammate, freedomSwornR5Teammate]
      })
    ).toThrow("millennial-movement.party-attack-percent")
  })

  it("resolves Athame Artis's selected other-current-character Daylight Blade snapshot", () => {
    const athameR1Teammate = { ...withWeapon("AthameArtis", 1), buildId: "test.athame.r1-teammate" }
    const athameR5Teammate = { ...withWeapon("AthameArtis", 5), buildId: "test.athame.r5-teammate" }
    const activeDaylightBladeEffectIds = [
      "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
      "weapon.athame-artis.magic-secret.daylight-blade.other-current-character.extra-attack-percent"
    ]
    const r1TeammateAthame = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: activeDaylightBladeEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: withHexereiSecretRite([athameR1Teammate])
    })
    const r5TeammateAthame = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: activeDaylightBladeEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: withHexereiSecretRite([athameR5Teammate])
    })
    const inactiveTeammateAthame = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [athameR5Teammate]
    })
    const holderAthame = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: activeDaylightBladeEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("AthameArtis", 5),
      teammates: []
    })

    expect(r1TeammateAthame.attackPercent).toBeCloseTo(0.28)
    expect(r5TeammateAthame.attackPercent).toBeCloseTo(0.56)
    expect(r5TeammateAthame.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
          sourceId: "test.athame.r5-teammate"
        }),
        expect.objectContaining({
          id: "weapon.athame-artis.magic-secret.daylight-blade.other-current-character.extra-attack-percent",
          sourceId: "test.athame.r5-teammate"
        })
      ])
    )
    expect(inactiveTeammateAthame.attackPercent).toBeCloseTo(0)
    expect(holderAthame.attackPercent).toBeCloseTo(0)
  })

  it("resolves Symphonist of Scents's selected Sweet Echoes for its holder or healed current character", () => {
    const symphonistR1Teammate = { ...withWeapon("SymphonistOfScents", 1), buildId: "test.symphonist.r1-teammate" }
    const symphonistR5Teammate = { ...withWeapon("SymphonistOfScents", 5), buildId: "test.symphonist.r5-teammate" }
    const teammateSweetEchoes = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [symphonistR1Teammate]
    })
    const r5TeammateSweetEchoes = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [symphonistR5Teammate]
    })
    const holderSweetEchoes = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.symphonist-of-scents.sweet-echoes.self.attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("SymphonistOfScents", 5),
      teammates: []
    })
    const inactiveTeammateSymphonist = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [symphonistR5Teammate]
    })

    expect(teammateSweetEchoes.attackPercent).toBeCloseTo(0.32)
    expect(r5TeammateSweetEchoes.attackPercent).toBeCloseTo(0.64)
    expect(r5TeammateSweetEchoes.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent",
          sourceId: "test.symphonist.r5-teammate"
        })
      ])
    )
    expect(holderSweetEchoes.attackPercent).toBeCloseTo(0.88)
    expect(inactiveTeammateSymphonist.attackPercent).toBeCloseTo(0)
  })

  it("resolves Amos' Bow's selected projectile-flight stacks only on normal and charged attacks", () => {
    const amosR1 = { ...withWeapon("AmosBow", 1), buildId: "test.amos.r1", characterId: "Amber" }
    const amosR5 = { ...withWeapon("AmosBow", 5), buildId: "test.amos.r5", characterId: "Amber" }
    const r1OneStack = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.amos-bow.projectile-flight-time.1-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amosR1,
      teammates: []
    })
    const r1FiveStacks = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amosR1,
      teammates: []
    })
    const r5FiveStacks = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amosR5,
      teammates: []
    })
    const skill = resolveCombatActionEffects({
      action: requireAction("amber.skill.explosive_puppet.baron_bunny.explosion"),
      activeEffectIds: ["weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: amosR5,
      teammates: []
    })

    expect(r1OneStack.damageBonus).toBeCloseTo(0.2)
    expect(r1FiveStacks.damageBonus).toBeCloseTo(0.52)
    expect(r5FiveStacks.damageBonus).toBeCloseTo(1.04)
    expect(skill.damageBonus).toBeCloseTo(0)
    expect(() =>
      resolveCombatActionEffects({
        action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
        activeEffectIds: [
          "weapon.amos-bow.projectile-flight-time.1-stack.damage-bonus",
          "weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"
        ],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: amosR1,
        teammates: []
      })
    ).toThrow("amos-bow-projectile-flight-time")
  })

  it("resolves Alley Hunter's selected current damage-bonus stack without inferring its timer", () => {
    const alleyHunterR1 = { ...withWeapon("AlleyHunter", 1), buildId: "test.alley-hunter.r1", characterId: "Amber" }
    const alleyHunterR5 = { ...withWeapon("AlleyHunter", 5), buildId: "test.alley-hunter.r5", characterId: "Amber" }
    const r1OneStack = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.alley-hunter.off-field.1-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: alleyHunterR1,
      teammates: []
    })
    const r1TenStacks = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.alley-hunter.off-field.10-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: alleyHunterR1,
      teammates: []
    })
    const r5TenStacks = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: ["weapon.alley-hunter.off-field.10-stack.damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: alleyHunterR5,
      teammates: []
    })
    const inactive = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: alleyHunterR5,
      teammates: []
    })

    expect(r1OneStack.damageBonus).toBeCloseTo(0.02)
    expect(r1TenStacks.damageBonus).toBeCloseTo(0.2)
    expect(r5TenStacks.damageBonus).toBeCloseTo(0.4)
    expect(inactive.damageBonus).toBeCloseTo(0)
    expect(() =>
      resolveCombatActionEffects({
        action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
        activeEffectIds: [
          "weapon.alley-hunter.off-field.1-stack.damage-bonus",
          "weapon.alley-hunter.off-field.10-stack.damage-bonus"
        ],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary: alleyHunterR1,
        teammates: []
      })
    ).toThrow("alley-hunter-off-field")
  })

  it("resolves Golden Frostbound Oath's selected Mooncage Geo bonus only for other party members", () => {
    const goldenFrostboundOathR5Teammate = {
      ...withWeapon("GoldenFrostboundOath", 5),
      buildId: "test.golden-frostbound-oath.r5-teammate"
    }
    const effectId =
      "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus"
    const teammateGeoAction = resolveCombatActionEffects({
      action: requireAction("ningguang.normal.charged_attack.with_star_jades"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [goldenFrostboundOathR5Teammate]
    })
    const teammateNonGeoAction = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [goldenFrostboundOathR5Teammate]
    })
    const holderGeoAction = resolveCombatActionEffects({
      action: requireAction("ningguang.normal.charged_attack.with_star_jades"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("GoldenFrostboundOath", 5),
      teammates: []
    })

    expect(teammateGeoAction.damageBonus).toBeCloseTo(0.4)
    expect(teammateGeoAction.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: goldenFrostboundOathR5Teammate.buildId })])
    )
    expect(teammateNonGeoAction.damageBonus).toBeCloseTo(0)
    expect(holderGeoAction.damageBonus).toBeCloseTo(0)
  })

  it("resolves the reviewed P4 weapon values without inventing duration or stack history", () => {
    const skywardHarp = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SkywardHarp", [
      "weapon.skyward-harp.physical-hit"
    ], [])
    const skywardHarpR5 = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.skyward-harp.physical-hit"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("SkywardHarp", 5),
      teammates: []
    })
    const skywardBlade = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SkywardBlade", [
      "weapon.skyward-blade.after-burst.additional-physical-damage"
    ])
    const sacrificialJade = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SacrificialJade", [
      "weapon.sacrificial-jade.after-off-field.hp-percent",
      "weapon.sacrificial-jade.after-off-field.elemental-mastery"
    ])
    const talkingStick = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TalkingStick", [
      "weapon.talking-stick.pyro-attachment.attack-percent",
      "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus"
    ])
    const urakuMisugiri = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "UrakuMisugiri", [
      "weapon.uraku-misugiri.after-geo-hit.extra-skill-damage-bonus"
    ])
    const blazingSuns = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "AThousandBlazingSuns", [
      "weapon.a-thousand-blazing-suns.after-skill-or-burst.crit-damage",
      "weapon.a-thousand-blazing-suns.after-skill-or-burst.attack-percent"
    ])
    const mountainBracingBolt = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MountainBracingBolt", [
      "weapon.mountain-bracing-bolt.after-teammate-skill.extra-skill-damage-bonus"
    ])
    const fruitfulHook = resolveWeaponEffects("xiao.burst.bane_of_all_evil.high_plunge", "FruitfulHook", [
      "weapon.fruitful-hook.after-plunge.normal-charged-plunge-damage-bonus"
    ])
    const azurelight = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Azurelight", [
      "weapon.azurelight.after-skill.attack-percent",
      "weapon.azurelight.after-skill.zero-energy.extra-attack-percent",
      "weapon.azurelight.after-skill.zero-energy.crit-damage"
    ])
    const disasterAndRemorse = resolveWeaponEffects("xiangling.normal.auto.first_hit", "DisasterAndRemorse", [
      "weapon.disaster-and-remorse.after-skill.normal-charged-damage-bonus",
      "weapon.disaster-and-remorse.magic-secret.extra-normal-charged-damage-bonus"
    ])
    const crimsonMoonLowBond = resolveWeaponEffects("xiangling.normal.auto.first_hit", "CrimsonMoonsSemblance", [
      "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus"
    ])
    const crimsonMoonHighBond = resolveWeaponEffects("xiangling.normal.auto.first_hit", "CrimsonMoonsSemblance", [
      "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus"
    ])
    const athameArtis = resolveWeaponEffects("xiangling.burst.pyronado.reverse_vaporize", "AthameArtis", [
      "weapon.athame-artis.after-burst-hit.self-attack-percent",
      "weapon.athame-artis.magic-secret.after-burst-hit.self-extra-attack-percent"
    ])

    expect(skywardHarp.critDamage).toBeCloseTo(0.2)
    expect(skywardHarp.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 1.25, expectedTriggerProbability: 0.6 })])
    )
    expect(skywardHarpR5.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ expectedTriggerProbability: 1 })])
    )
    expect(skywardBlade.critRate).toBeCloseTo(0.04)
    expect(skywardBlade.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.2, element: "physical" })])
    )
    expect(sacrificialJade.hpPercent).toBeCloseTo(0.32)
    expect(sacrificialJade.elementalMastery).toBeCloseTo(40)
    expect(talkingStick.attackPercent).toBeCloseTo(0.16)
    expect(talkingStick.damageBonus).toBeCloseTo(0.12)
    expect(urakuMisugiri.defensePercent).toBeCloseTo(0.2)
    expect(urakuMisugiri.damageBonus).toBeCloseTo(0.48)
    expect(blazingSuns.attackPercent).toBeCloseTo(0.28)
    expect(blazingSuns.critDamage).toBeCloseTo(0.2)
    expect(blazingSuns.appliedEffects.some((effect) => effect.id.includes(".nightsoul."))).toBe(false)
    expect(mountainBracingBolt.damageBonus).toBeCloseTo(0.24)
    expect(fruitfulHook.critRate).toBeCloseTo(0.16)
    expect(fruitfulHook.damageBonus).toBeCloseTo(0.16)
    expect(azurelight.attackPercent).toBeCloseTo(0.48)
    expect(azurelight.critDamage).toBeCloseTo(0.4)
    expect(disasterAndRemorse.damageBonus).toBeCloseTo(0.7)
    expect(crimsonMoonLowBond.damageBonus).toBeCloseTo(0.12)
    expect(crimsonMoonHighBond.damageBonus).toBeCloseTo(0.36)
    expect(athameArtis.critDamage).toBeCloseTo(0.16)
    expect(athameArtis.attackPercent).toBeCloseTo(0.35)
    expect(() =>
      resolveWeaponEffects("xiangling.normal.auto.first_hit", "CrimsonMoonsSemblance", [
        "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus",
        "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus"
      ])
    ).toThrow("crimson-moons-semblance-bond")
  })

  it("resolves exact P5 clauses while their unsupported siblings stay out of the public calculation", () => {
    const teaspoon = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ATeaspoonOfTranscendence")
    const absolution = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Absolution")
    const amosBow = resolveWeaponEffects("xiangling.normal.auto.first_hit", "AmosBow")
    const angelosHeptades = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "AngelosHeptades")
    const ashGravenDrinkingHorn = resolveWeaponEffects("xiangling.normal.auto.first_hit", "AshGravenDrinkingHorn", [
      "weapon.ash-graven-drinking-horn.hp-physical-hit"
    ])
    const astralVulturesCrimsonPlumage = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "AstralVulturesCrimsonPlumage",
      ["weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent"]
    )

    expect(teaspoon.attackPercent).toBeCloseTo(0.28)
    expect(absolution.critDamage).toBeCloseTo(0.2)
    expect(amosBow.damageBonus).toBeCloseTo(0.12)
    expect(angelosHeptades.attackPercent).toBeCloseTo(0.12)
    expect(ashGravenDrinkingHorn.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, element: "physical", scalingStat: "hp" })])
    )
    expect(astralVulturesCrimsonPlumage.attackPercent).toBeCloseTo(0.24)
  })

  it("resolves Astral Vulture's Crimson Plumage from the highest nonmatching-element teammate tier", () => {
    const chargedAction = requireAction("ganyu.normal.frostflake_arrow.level_two.hit_and_bloom")
    const burstAction = requireAction("yelan.burst.exquisite_throw.single_wave")
    const primary = {
      ...withWeapon("AstralVulturesCrimsonPlumage", 5),
      buildId: "test.astral-vultures-crimson-plumage"
    }
    const resolveAtTier = (action: ReturnType<typeof requireAction>, count: number) =>
      resolveCombatActionEffects({
        action,
        activeEffectIds: [],
        baseEnergyRecharge: 1,
        enemyCount: 1,
        primary,
        primaryDifferentElementTeammateCount: count,
        teammates: []
      })

    const noDifferentCharged = resolveAtTier(chargedAction, 0)
    const oneDifferentCharged = resolveAtTier(chargedAction, 1)
    const twoDifferentCharged = resolveAtTier(chargedAction, 2)
    const oneDifferentBurst = resolveAtTier(burstAction, 1)
    const twoDifferentBurst = resolveAtTier(burstAction, 2)

    expect(noDifferentCharged.damageBonus).toBe(0)
    expect(oneDifferentCharged.damageBonus).toBeCloseTo(0.4)
    expect(twoDifferentCharged.damageBonus).toBeCloseTo(0.96)
    expect(oneDifferentBurst.damageBonus).toBeCloseTo(0.2)
    expect(twoDifferentBurst.damageBonus).toBeCloseTo(0.48)
    expect(twoDifferentCharged.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.charged-damage-bonus"
        })
      ])
    )
  })

  it("resolves P6 explicit stack snapshots and rejects incompatible tier selections", () => {
    const blackcliffPole = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "BlackcliffPole", [
      "weapon.blackcliff-pole.defeated-enemy.3-stack.attack-percent"
    ])
    const bloodsoakedRuins = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "BloodsoakedRuins",
      ["weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage"]
    )
    const calamityQuellerOnField = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "CalamityQueller",
      ["weapon.calamity-queller.consumption.on-field.6-stack.attack-percent"]
    )
    const calamityQuellerOffField = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "CalamityQueller",
      ["weapon.calamity-queller.consumption.off-field.6-stack.attack-percent"]
    )
    const cashflowNormal = resolveWeaponEffects("xiangling.normal.auto.first_hit", "CashflowSupervision", [
      "weapon.cashflow-supervision.hp-change.3-stack.normal-damage-bonus"
    ])
    const cashflowCharged = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "CashflowSupervision", [
      "weapon.cashflow-supervision.hp-change.3-stack.charged-damage-bonus"
    ])
    const chainBreakerThree = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ChainBreaker", [
      "weapon.chain-breaker.qualifying-party.3-character.attack-percent",
      "weapon.chain-breaker.qualifying-party.3-character.elemental-mastery"
    ])
    const chainBreakerFour = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ChainBreaker", [
      "weapon.chain-breaker.qualifying-party.4-character.attack-percent",
      "weapon.chain-breaker.qualifying-party.4-character.elemental-mastery"
    ])
    const cloudforged = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Cloudforged", [
      "weapon.cloudforged.energy-reduced.2-stack.elemental-mastery"
    ])
    const compoundBow = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "CompoundBow", [
      "weapon.compound-bow.normal-or-charged-hit.4-stack.attack-percent"
    ])

    expect(blackcliffPole.attackPercent).toBeCloseTo(0.36)
    expect(bloodsoakedRuins.critDamage).toBeCloseTo(0.28)
    expect(calamityQuellerOnField.attackPercent).toBeCloseTo(0.192)
    expect(calamityQuellerOnField.damageBonus).toBeCloseTo(0.12)
    expect(calamityQuellerOffField.attackPercent).toBeCloseTo(0.384)
    expect(cashflowNormal.attackPercent).toBeCloseTo(0.16)
    expect(cashflowNormal.damageBonus).toBeCloseTo(0.48)
    expect(cashflowCharged.damageBonus).toBeCloseTo(0.42)
    expect(chainBreakerThree.attackPercent).toBeCloseTo(0.144)
    expect(chainBreakerThree.elementalMastery).toBeCloseTo(24)
    expect(chainBreakerFour.attackPercent).toBeCloseTo(0.192)
    expect(chainBreakerFour.elementalMastery).toBeCloseTo(24)
    expect(cloudforged.elementalMastery).toBeCloseTo(80)
    expect(compoundBow.attackPercent).toBeCloseTo(0.16)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "BlackcliffPole", [
        "weapon.blackcliff-pole.defeated-enemy.1-stack.attack-percent",
        "weapon.blackcliff-pole.defeated-enemy.3-stack.attack-percent"
      ])
    ).toThrow("blackcliff-pole-defeated-enemy")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ChainBreaker", [
        "weapon.chain-breaker.qualifying-party.3-character.attack-percent",
        "weapon.chain-breaker.qualifying-party.4-character.attack-percent"
      ])
    ).toThrow("chain-breaker-qualifying-party")
  })

  it("resolves P7 current-action snapshots without inferring their trigger histories", () => {
    const dragonspineSpear = resolveWeaponEffects("xiangling.normal.auto.first_hit", "DragonspineSpear", [
      "weapon.dragonspine-spear.frost-icicle.without-cryo-aura.physical-hit"
    ])
    const dragonspineSpearCryoAura = resolveWeaponEffects("xiangling.normal.auto.first_hit", "DragonspineSpear", [
      "weapon.dragonspine-spear.frost-icicle.with-cryo-aura.physical-hit"
    ])
    const endOfTheLine = resolveWeaponEffects("xiangling.normal.auto.first_hit", "EndOfTheLine", [
      "weapon.end-of-the-line.flowrider.physical-hit"
    ])
    const eyeOfPerception = resolveWeaponEffects("xiangling.normal.auto.first_hit", "EyeOfPerception", [
      "weapon.eye-of-perception.initial-projectile.physical-hit"
    ])
    const fadingTwilight = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FadingTwilight", [
      "weapon.fading-twilight.dawn-glow.damage-bonus"
    ])
    const mountainKing = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FangOfTheMountainKing", [
      "weapon.fang-of-the-mountain-king.verdant-ember.6-stack.skill-burst-damage-bonus"
    ])
    const finaleOfTheDeep = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FinaleOfTheDeep", [
      "weapon.finale-of-the-deep.after-skill.attack-percent"
    ])
    const flowerWreathedFeathers = resolveWeaponEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "FlowerWreathedFeathers",
      ["weapon.flower-wreathed-feathers.aimed-shot.6-stack.charged-damage-bonus"]
    )
    const flowingPurity = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FlowingPurity", [
      "weapon.flowing-purity.after-skill.all-element-damage-bonus",
      "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
    ])
    const flowingPurityPhysical = resolveWeaponEffects("xiangling.normal.auto.first_hit", "FlowingPurity", [
      "weapon.flowing-purity.after-skill.all-element-damage-bonus",
      "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
    ])
    const fracturedHalo = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FracturedHalo", [
      "weapon.fractured-halo.after-skill-or-burst.self-attack-percent"
    ])
    const frostbearer = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Frostbearer", [
      "weapon.frostbearer.frost-icicle.with-cryo-aura.physical-hit"
    ])

    expect(dragonspineSpear.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.8, expectedTriggerProbability: 0.6 })])
    )
    expect(dragonspineSpearCryoAura.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 2, expectedTriggerProbability: 0.6 })])
    )
    expect(endOfTheLine.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.8, element: "physical" })])
    )
    expect(eyeOfPerception.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 2.4, expectedTriggerProbability: 0.5 })])
    )
    expect(fadingTwilight.damageBonus).toBeCloseTo(0.14)
    expect(mountainKing.damageBonus).toBeCloseTo(0.6)
    expect(finaleOfTheDeep.attackPercent).toBeCloseTo(0.12)
    expect(flowerWreathedFeathers.damageBonus).toBeCloseTo(0.36)
    expect(flowingPurity.damageBonus).toBeCloseTo(0.2)
    expect(flowingPurityPhysical.damageBonus).toBeCloseTo(0)
    expect(fracturedHalo.attackPercent).toBeCloseTo(0.24)
    expect(frostbearer.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 2, expectedTriggerProbability: 0.6 })])
    )
    expect(() =>
      resolveWeaponEffects("xiangling.normal.auto.first_hit", "DragonspineSpear", [
        "weapon.dragonspine-spear.frost-icicle.without-cryo-aura.physical-hit",
        "weapon.dragonspine-spear.frost-icicle.with-cryo-aura.physical-hit"
      ])
    ).toThrow("dragonspine-spear-frost-icicle")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FlowingPurity", [
        "weapon.flowing-purity.bond-of-life-cleared.1-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
      ])
    ).toThrow("flowing-purity-bond-of-life-cleared")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FadingTwilight", [
        "weapon.fading-twilight.evening-glow.damage-bonus",
        "weapon.fading-twilight.dawn-glow.damage-bonus"
      ])
    ).toThrow("fading-twilight-glow")
  })

  it("resolves P8 exact effects while preserving holder and snapshot boundaries", () => {
    const fruitOfFulfillment = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FruitOfFulfillment", [
      "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.elemental-mastery",
      "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.attack-percent"
    ])
    const gestOfTheMightyWolf = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "GestOfTheMightyWolf",
      [
        "weapon.gest-of-the-mighty-wolf.howl.4-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.magic-secret.4-stack.crit-damage"
      ]
    )
    const goldenFrostboundOath = resolveWeaponEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "GoldenFrostboundOath",
      ["weapon.golden-frostbound-oath.frost-fairys-requital.geo-damage-bonus"]
    )
    const hakushinRing = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: ["weapon.hakushin-ring.overloaded-related-element-damage-bonus"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [{ ...withWeapon("HakushinRing", 5), buildId: "test.hakushin-ring.r5-teammate" }]
    })
    const haranNormal = resolveWeaponEffects("xiangling.normal.auto.first_hit", "HaranGeppakuFutsu", [
      "weapon.haran-geppaku-futsu.wavespike.2-stack.normal-damage-bonus"
    ])
    const haranElemental = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "HaranGeppakuFutsu")
    const huntersPath = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "HuntersPath")
    const ibisPiercer = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "IbisPiercer", [
      "weapon.ibis-piercer.precision.2-stack.elemental-mastery"
    ])
    const ironSting = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "IronSting", [
      "weapon.iron-sting.infusion-stinger.2-stack.damage-bonus"
    ])
    const kagurasVerity = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "KagurasVerity", [
      "weapon.kaguras-verity.kagura-dance.3-stack.skill-damage-bonus",
      "weapon.kaguras-verity.kagura-dance.3-stack.all-element-damage-bonus"
    ])
    const keyOfKhajNisut = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "KeyOfKhajNisut")
    const lightOfFoliarIncision = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "LightOfFoliarIncision"
    )

    expect(fruitOfFulfillment.elementalMastery).toBeCloseTo(120)
    expect(fruitOfFulfillment.attackPercent).toBeCloseTo(-0.25)
    expect(gestOfTheMightyWolf.damageBonus).toBeCloseTo(0.3)
    expect(gestOfTheMightyWolf.critDamage).toBeCloseTo(0.3)
    expect(goldenFrostboundOath.defensePercent).toBeCloseTo(0.16)
    expect(goldenFrostboundOath.damageBonus).toBeCloseTo(0.4)
    expect(hakushinRing.damageBonus).toBeCloseTo(0.2)
    expect(hakushinRing.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.hakushin-ring.r5-teammate" })])
    )
    expect(haranNormal.damageBonus).toBeCloseTo(0.4)
    expect(haranElemental.damageBonus).toBeCloseTo(0.12)
    expect(huntersPath.damageBonus).toBeCloseTo(0.12)
    expect(ibisPiercer.elementalMastery).toBeCloseTo(80)
    expect(ironSting.damageBonus).toBeCloseTo(0.12)
    expect(kagurasVerity.damageBonus).toBeCloseTo(0.48)
    expect(keyOfKhajNisut.hpPercent).toBeCloseTo(0.2)
    expect(lightOfFoliarIncision.critRate).toBeCloseTo(0.04)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FruitOfFulfillment", [
        "weapon.fruit-of-fulfillment.wax-and-wane.1-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.2-stack.elemental-mastery"
      ])
    ).toThrow("fruit-of-fulfillment-wax-and-wane")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "GestOfTheMightyWolf", [
        "weapon.gest-of-the-mighty-wolf.howl.3-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.howl.4-stack.damage-bonus"
      ])
    ).toThrow("gest-of-the-mighty-wolf-howl-damage")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "GestOfTheMightyWolf", [
        "weapon.gest-of-the-mighty-wolf.magic-secret.3-stack.crit-damage",
        "weapon.gest-of-the-mighty-wolf.magic-secret.4-stack.crit-damage"
      ])
    ).toThrow("gest-of-the-mighty-wolf-howl-magic-secret")
    expect(() =>
      resolveWeaponEffects("raiden.burst.initial_slash", "HakushinRing", [
        "weapon.hakushin-ring.overloaded-related-element-damage-bonus",
        "weapon.hakushin-ring.aggravate-related-element-damage-bonus"
      ])
    ).toThrow("hakushin-ring-reaction")
  })

  it("resolves P9 element- and recipient-scoped snapshots without flattening their boundaries", () => {
    const lightbearingMoonshard = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "LightbearingMoonshard"
    )
    const lithicBlade = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LithicBlade", [
      "weapon.lithic-blade.liyue-party.4-character.attack-percent",
      "weapon.lithic-blade.liyue-party.4-character.crit-rate"
    ])
    const lithicSpear = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LithicSpear", [
      "weapon.lithic-spear.liyue-party.3-character.attack-percent",
      "weapon.lithic-spear.liyue-party.3-character.crit-rate"
    ])
    const lostPrayer = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LostPrayerToTheSacredWinds", [
      "weapon.lost-prayer-to-the-sacred-winds.movement.4-stack.all-element-damage-bonus"
    ])
    const lumidouceElegy = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LumidouceElegy", [
      "weapon.lumidouce-elegy.burning.2-stack.damage-bonus"
    ])
    const mappaMare = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MappaMare", [
      "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"
    ])
    const masterKey = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MasterKey", [
      "weapon.master-key.after-reaction.full-moon.elemental-mastery"
    ])
    const memoryOfDust = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MemoryOfDust", [
      "weapon.memory-of-dust.golden-majesty.shielded.5-stack.attack-percent"
    ])
    const mistsplitter = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MistsplitterReforged", [
      "weapon.mistsplitter-reforged.emblem.pyro.3-stack.damage-bonus"
    ])
    const mistsplitterWrongElement = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "MistsplitterReforged",
      ["weapon.mistsplitter-reforged.emblem.hydro.3-stack.damage-bonus"]
    )
    const moonweaversDawn = resolveWeaponEffects("raiden.burst.initial_slash", "MoonweaversDawn", [
      "weapon.moonweavers-dawn.at-most-forty-energy.extra-burst-damage-bonus"
    ])
    const nightweaversLookingGlass = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "NightweaversLookingGlass",
      [
        "weapon.nightweavers-looking-glass.after-hydro-or-dendro-skill.elemental-mastery",
        "weapon.nightweavers-looking-glass.after-lunar-bloom.elemental-mastery"
      ]
    )

    expect(lightbearingMoonshard.defensePercent).toBeCloseTo(0.2)
    expect(lithicBlade.attackPercent).toBeCloseTo(0.28)
    expect(lithicBlade.critRate).toBeCloseTo(0.12)
    expect(lithicSpear.attackPercent).toBeCloseTo(0.21)
    expect(lithicSpear.critRate).toBeCloseTo(0.09)
    expect(lostPrayer.damageBonus).toBeCloseTo(0.32)
    expect(lumidouceElegy.attackPercent).toBeCloseTo(0.15)
    expect(lumidouceElegy.damageBonus).toBeCloseTo(0.36)
    expect(mappaMare.damageBonus).toBeCloseTo(0.16)
    expect(masterKey.elementalMastery).toBeCloseTo(120)
    expect(memoryOfDust.attackPercent).toBeCloseTo(0.4)
    expect(mistsplitter.damageBonus).toBeCloseTo(0.4)
    expect(mistsplitterWrongElement.damageBonus).toBeCloseTo(0.12)
    expect(moonweaversDawn.damageBonus).toBeCloseTo(0.48)
    expect(nightweaversLookingGlass.elementalMastery).toBeCloseTo(120)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "LithicBlade", [
        "weapon.lithic-blade.liyue-party.3-character.attack-percent",
        "weapon.lithic-blade.liyue-party.4-character.attack-percent"
      ])
    ).toThrow("lithic-blade-liyue-party")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MasterKey", [
        "weapon.master-key.after-reaction.elemental-mastery",
        "weapon.master-key.after-reaction.full-moon.elemental-mastery"
      ])
    ).toThrow("master-key-reaction")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "MistsplitterReforged", [
        "weapon.mistsplitter-reforged.emblem.pyro.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.pyro.3-stack.damage-bonus"
      ])
    ).toThrow("mistsplitter-reforged-emblem")
  })

  it("resolves P10 stack values and keeps the official Polar Star correction", () => {
    const nocturnesCurtainCall = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "NocturnesCurtainCall",
      ["weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent"]
    )
    const peakPatrolSong = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PeakPatrolSong", [
      "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent",
      "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"
    ])
    const polarStarR4 = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: ["weapon.polar-star.ashen-nightstar.3-stack.attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("PolarStar", 4),
      teammates: []
    })
    const portablePowerSaw = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PortablePowerSaw", [
      "weapon.portable-power-saw.mariners-resolve.3-mark.elemental-mastery"
    ])
    const predator = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Predator", [
      "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus"
    ])
    const primordialJadeCutter = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PrimordialJadeCutter")
    const teammatePrimordialJadeCutter = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [withWeapon("PrimordialJadeCutter")]
    })
    const primordialJadeWingedSpear = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "PrimordialJadeWingedSpear",
      [
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus"
      ]
    )
    const prospectorsDrill = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ProspectorsDrill", [
      "weapon.prospectors-drill.unity.3-mark.attack-percent",
      "weapon.prospectors-drill.unity.3-mark.all-element-damage-bonus"
    ])
    const prototypeRancour = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PrototypeRancour", [
      "weapon.prototype-rancour.shattered-stone.4-stack.attack-percent",
      "weapon.prototype-rancour.shattered-stone.4-stack.defense-percent"
    ])
    const prototypeStarglitter = resolveWeaponEffects("xiangling.normal.auto.first_hit", "PrototypeStarglitter", [
      "weapon.prototype-starglitter.magic-affinity.2-stack.normal-charged-damage-bonus"
    ])

    expect(nocturnesCurtainCall.hpPercent).toBeCloseTo(0.24)
    expect(peakPatrolSong.defensePercent).toBeCloseTo(0.16)
    expect(peakPatrolSong.damageBonus).toBeCloseTo(0.2)
    expect(polarStarR4.damageBonus).toBeCloseTo(0.21)
    expect(polarStarR4.attackPercent).toBeCloseTo(0.525)
    expect(portablePowerSaw.elementalMastery).toBeCloseTo(120)
    expect(predator.damageBonus).toBeCloseTo(0.2)
    expect(primordialJadeCutter.hpPercent).toBeCloseTo(0.2)
    expect(primordialJadeCutter.finalHpToFlatAttack).toBeCloseTo(0.012)
    expect(primordialJadeCutter.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack",
          target: "finalHpToFlatAttack",
          value: 0.012
        })
      ])
    )
    expect(teammatePrimordialJadeCutter.finalHpToFlatAttack).toBe(0)
    expect(teammatePrimordialJadeCutter.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack" })])
    )
    expect(primordialJadeWingedSpear.attackPercent).toBeCloseTo(0.224)
    expect(primordialJadeWingedSpear.damageBonus).toBeCloseTo(0.12)
    expect(prospectorsDrill.attackPercent).toBeCloseTo(0.09)
    expect(prospectorsDrill.damageBonus).toBeCloseTo(0.21)
    expect(prototypeRancour.attackPercent).toBeCloseTo(0.16)
    expect(prototypeRancour.defensePercent).toBeCloseTo(0.16)
    expect(prototypeStarglitter.damageBonus).toBeCloseTo(0.16)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PeakPatrolSong", [
        "weapon.peak-patrol-song.ode-to-flowers.1-stack.defense-percent",
        "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent"
      ])
    ).toThrow("peak-patrol-song-ode-to-flowers")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "PolarStar", [
        "weapon.polar-star.ashen-nightstar.2-stack.attack-percent",
        "weapon.polar-star.ashen-nightstar.4-stack.attack-percent"
      ])
    ).toThrow("polar-star-ashen-nightstar")
  })

  it("resolves P11 published snapshots and rejects untrusted or mutually exclusive states", () => {
    const rainbowSerpentsRainBow = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "RainbowSerpentsRainBow",
      ["weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent"]
    )
    const rangeGauge = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "RangeGauge", [
      "weapon.range-gauge.unity.3-mark.attack-percent",
      "weapon.range-gauge.unity.3-mark.all-element-damage-bonus"
    ])
    const redhornStonethresher = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "RedhornStonethresher")
    const reliquaryOfTruth = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ReliquaryOfTruth", [
      "weapon.reliquary-of-truth.both-states.elemental-mastery",
      "weapon.reliquary-of-truth.both-states.crit-damage"
    ])
    const royalWeaponIds = ["RoyalBow", "RoyalGreatsword", "RoyalGrimoire", "RoyalLongsword", "RoyalSpear"] as const

    expect(rainbowSerpentsRainBow.attackPercent).toBeCloseTo(0.28)
    expect(rangeGauge.attackPercent).toBeCloseTo(0.09)
    expect(rangeGauge.damageBonus).toBeCloseTo(0.21)
    expect(redhornStonethresher.defensePercent).toBeCloseTo(0.28)
    expect(reliquaryOfTruth.critRate).toBeCloseTo(0.08)
    expect(reliquaryOfTruth.elementalMastery).toBeCloseTo(120)
    expect(reliquaryOfTruth.critDamage).toBeCloseTo(0.36)
    for (const weaponId of royalWeaponIds) {
      const effects = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", weaponId, [
        `weapon.${weaponId.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}.focus.5-stack.crit-rate`
      ])

      expect(effects.critRate).toBeCloseTo(0.4)
    }
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "ReliquaryOfTruth", [
        "weapon.reliquary-of-truth.after-skill.elemental-mastery",
        "weapon.reliquary-of-truth.both-states.elemental-mastery"
      ])
    ).toThrow("reliquary-of-truth-both-states")
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "RoyalBow", [
        "weapon.royal-bow.focus.1-stack.crit-rate",
        "weapon.royal-bow.focus.5-stack.crit-rate"
      ])
    ).toThrow("royal-bow-focus")
  })

  it("resolves P12 current-hit events and independent snapshot groups", () => {
    const sacrificersStaff = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SacrificersStaff", [
      "weapon.sacrificers-staff.sacrificial-rite.3-stack.attack-percent",
      "weapon.sacrificers-staff.sacrificial-rite.3-stack.energy-recharge"
    ])
    const scionOfTheBlazingSun = resolveWeaponEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "ScionOfTheBlazingSun",
      [
        "weapon.scion-of-the-blazing-sun.sunfire-arrow.physical-hit",
        "weapon.scion-of-the-blazing-sun.heartsearer-target.charged-damage-bonus"
      ]
    )
    const sequenceOfSolitude = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SequenceOfSolitude", [
      "weapon.sequence-of-solitude.hp-physical-hit"
    ])
    const sequenceOfSolitudeSkill = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "SequenceOfSolitude",
      ["weapon.sequence-of-solitude.hp-physical-hit"]
    )
    const sequenceOfSolitudeBurst = resolveWeaponEffects("raiden.burst.initial_slash", "SequenceOfSolitude", [
      "weapon.sequence-of-solitude.hp-physical-hit"
    ])
    const serenitysCall = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SerenitysCall", [
      "weapon.serenitys-call.after-reaction.full-moon.hp-percent"
    ])
    const serpentSpine = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SerpentSpine", [
      "weapon.serpent-spine.wavesplitter.5-stack.damage-bonus"
    ])
    const silvershowerHeartstrings = resolveWeaponEffects("raiden.burst.initial_slash", "SilvershowerHeartstrings", [
      "weapon.silvershower-heartstrings.bond.3-stack.hp-percent",
      "weapon.silvershower-heartstrings.bond.3-stack.burst-crit-rate"
    ])
    const skywardAtlas = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SkywardAtlas")
    const snareHook = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SnareHook", [
      "weapon.snare-hook.after-reaction.full-moon.elemental-mastery"
    ])
    const snowTombedStarsilver = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SnowTombedStarsilver", [
      "weapon.snow-tombed-starsilver.frost-icicle.with-cryo-aura.physical-hit"
    ])
    const splendorOfTranquilWaters = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "SplendorOfTranquilWaters",
      [
        "weapon.splendor-of-tranquil-waters.self-hp-change.3-stack.skill-damage-bonus",
        "weapon.splendor-of-tranquil-waters.teammate-hp-change.2-stack.hp-percent"
      ]
    )
    const staffOfHoma = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "StaffOfHoma")

    expect(sacrificersStaff.attackPercent).toBeCloseTo(0.24)
    expect(sacrificersStaff.energyRecharge).toBeCloseTo(0.18)
    expect(scionOfTheBlazingSun.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.6, element: "physical" })])
    )
    expect(scionOfTheBlazingSun.damageBonus).toBeCloseTo(0.28)
    expect(sequenceOfSolitude.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, scalingStat: "hp" })])
    )
    expect(sequenceOfSolitudeSkill.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, element: "physical", scalingStat: "hp" })])
    )
    expect(sequenceOfSolitudeBurst.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, element: "physical", scalingStat: "hp" })])
    )
    expect(serenitysCall.hpPercent).toBeCloseTo(0.32)
    expect(serpentSpine.damageBonus).toBeCloseTo(0.3)
    expect(silvershowerHeartstrings.hpPercent).toBeCloseTo(0.4)
    expect(silvershowerHeartstrings.critRate).toBeCloseTo(0.28)
    expect(skywardAtlas.damageBonus).toBeCloseTo(0.12)
    expect(snareHook.elementalMastery).toBeCloseTo(120)
    expect(snowTombedStarsilver.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 2, expectedTriggerProbability: 0.6 })])
    )
    expect(splendorOfTranquilWaters.damageBonus).toBeCloseTo(0.24)
    expect(splendorOfTranquilWaters.hpPercent).toBeCloseTo(0.28)
    expect(staffOfHoma.hpPercent).toBeCloseTo(0.2)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SerenitysCall", [
        "weapon.serenitys-call.after-reaction.hp-percent",
        "weapon.serenitys-call.after-reaction.full-moon.hp-percent"
      ])
    ).toThrow("serenitys-call-reaction")
  })

  it("resolves P13 current-action weapon snapshots and uses the official Flute refinement table", () => {
    const summitShaper = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SummitShaper", [
      "weapon.summit-shaper.golden-majesty.shielded.5-stack.attack-percent"
    ])
    const surfsUp = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SurfsUp", [
      "weapon.surfs-up.scorching-summer.4-stack.normal-damage-bonus"
    ])
    const swordOfDescension = resolveWeaponEffects("xiangling.normal.auto.first_hit", "SwordOfDescension", [
      "weapon.sword-of-descension.descension.physical-hit"
    ])
    const symphonistOfScents = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SymphonistOfScents", [
      "weapon.symphonist-of-scents.off-field.extra-attack-percent"
    ])
    const theBell = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheBell", [
      "weapon.the-bell.shielded.damage-bonus"
    ])
    const theDaybreakChronicles = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "TheDaybreakChronicles",
      ["weapon.the-daybreak-chronicles.radiance.skill.6-stack.damage-bonus"]
    )
    const theDockhandsAssistant = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "TheDockhandsAssistant",
      ["weapon.the-dockhands-assistant.mariners-resolve.3-mark.elemental-mastery"]
    )
    const theFirstGreatMagic = resolveWeaponEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "TheFirstGreatMagic",
      ["weapon.the-first-great-magic.same-element-party.3-character.attack-percent"]
    )
    const theFluteR4 = resolveCombatActionEffects({
      action: requireAction("xiangling.normal.auto.first_hit"),
      activeEffectIds: ["weapon.the-flute.five-harmonic.physical-hit"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TheFlute", 4),
      teammates: []
    })
    const theUnforged = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheUnforged", [
      "weapon.the-unforged.golden-majesty.shielded.5-stack.attack-percent"
    ])

    expect(summitShaper.attackPercent).toBeCloseTo(0.4)
    expect(surfsUp.hpPercent).toBeCloseTo(0.2)
    expect(surfsUp.damageBonus).toBeCloseTo(0.48)
    expect(swordOfDescension.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 2, expectedTriggerProbability: 0.5 })])
    )
    expect(symphonistOfScents.attackPercent).toBeCloseTo(0.24)
    expect(theBell.damageBonus).toBeCloseTo(0.12)
    expect(theDaybreakChronicles.damageBonus).toBeCloseTo(0.6)
    expect(theDockhandsAssistant.elementalMastery).toBeCloseTo(120)
    expect(theFirstGreatMagic.attackPercent).toBeCloseTo(0.48)
    expect(theFirstGreatMagic.damageBonus).toBeCloseTo(0.16)
    expect(theFluteR4.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 1.75, element: "physical" })])
    )
    expect(theUnforged.attackPercent).toBeCloseTo(0.4)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SummitShaper", [
        "weapon.summit-shaper.golden-majesty.unshielded.1-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.5-stack.attack-percent"
      ])
    ).toThrow("summit-shaper-golden-majesty")
  })

  it("resolves PlayStation fixed-attack snapshots only for their named weapon holders", () => {
    const predatorEffectId = "weapon.predator.playstation.aloy.flat-attack"
    const swordEffectId = "weapon.sword-of-descension.playstation.traveler.flat-attack"
    const aloy = { ...withWeapon("Predator"), buildId: "test.aloy.predator", characterId: "Aloy" }
    const ganyu = { ...withWeapon("Predator"), buildId: "test.ganyu.predator", characterId: "Ganyu" }
    const traveler = {
      ...withWeapon("SwordOfDescension"),
      buildId: "test.traveler.sword-of-descension",
      characterId: "Traveler",
      variant: { element: "anemo" as const, gender: "female" as const, kind: "traveler" as const }
    }
    const bennett = { ...withWeapon("SwordOfDescension"), buildId: "test.bennett.sword-of-descension", characterId: "Bennett" }
    const aloyResult = resolveCombatActionEffects({
      action: requireAction("aloy.burst.prophecies_of_dawn.explosion"),
      activeEffectIds: [predatorEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: aloy,
      teammates: []
    })
    const ganyuResult = resolveCombatActionEffects({
      action: requireAction("ganyu.skill.trail_of_the_qilin.skill_damage"),
      activeEffectIds: [predatorEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: ganyu,
      teammates: []
    })
    const travelerResult = resolveCombatActionEffects({
      action: requireAction("traveler.anemo.skill.palm_vortex.initial_gust"),
      activeEffectIds: [swordEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: traveler,
      teammates: []
    })
    const bennettResult = resolveCombatActionEffects({
      action: requireAction("bennett.skill.passion_overload.press"),
      activeEffectIds: [swordEffectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: bennett,
      teammates: []
    })

    expect(aloyResult.flatAttack).toBeCloseTo(66)
    expect(aloyResult.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: predatorEffectId, value: 66 })])
    )
    expect(ganyuResult.flatAttack).toBeCloseTo(0)
    expect(ganyuResult.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: predatorEffectId })]))
    expect(travelerResult.flatAttack).toBeCloseTo(66)
    expect(travelerResult.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: swordEffectId, value: 66 })])
    )
    expect(bennettResult.flatAttack).toBeCloseTo(0)
    expect(bennettResult.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: swordEffectId })]))
  })

  it("resolves P14 selected weapon states without turning timeline effects into current-hit damage", () => {
    const theWidsith = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheWidsith", [
      "weapon.the-widsith.aria.all-element-damage-bonus"
    ])
    const thunderingPulse = resolveWeaponEffects("xiangling.normal.auto.first_hit", "ThunderingPulse", [
      "weapon.thundering-pulse.thunder-emblem.3-stack.normal-damage-bonus"
    ])
    const tomeOfTheEternalFlow = resolveWeaponEffects(
      "ningguang.normal.charged_attack.with_star_jades",
      "TomeOfTheEternalFlow",
      ["weapon.tome-of-the-eternal-flow.raging-tides.3-stack.charged-damage-bonus"]
    )
    const tulaytullahsRemembrance = resolveWeaponEffects("xiangling.normal.auto.first_hit", "TulaytullahsRemembrance", [
      "weapon.tulaytullahs-remembrance.aeons-flow.10-unit.normal-damage-bonus"
    ])
    const ultimateOverlordsMegaMagicSword = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "UltimateOverlordsMegaMagicSword",
      ["weapon.ultimate-overlords-mega-magic-sword.melusine.12-stack.attack-percent"]
    )
    const verdict = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Verdict", [
      "weapon.verdict.rift-ripple.2-stack.skill-damage-bonus"
    ])
    const vividNotions = resolveWeaponEffects("xiao.burst.bane_of_all_evil.high_plunge", "VividNotions", [
      "weapon.vivid-notions.dawn.plunge-crit-damage",
      "weapon.vivid-notions.dusk.plunge-crit-damage"
    ])
    const vortexVanquisher = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "VortexVanquisher", [
      "weapon.vortex-vanquisher.golden-majesty.shielded.5-stack.attack-percent"
    ])
    const waveridingWhirl = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "WaveridingWhirl", [
      "weapon.waveriding-whirl.hydro-character-count.2.hp-percent"
    ])
    const whiteblind = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "Whiteblind", [
      "weapon.whiteblind.infusion-blade.4-stack.attack-percent",
      "weapon.whiteblind.infusion-blade.4-stack.defense-percent"
    ])

    expect(theWidsith.damageBonus).toBeCloseTo(0.48)
    expect(thunderingPulse.attackPercent).toBeCloseTo(0.2)
    expect(thunderingPulse.damageBonus).toBeCloseTo(0.4)
    expect(tomeOfTheEternalFlow.hpPercent).toBeCloseTo(0.16)
    expect(tomeOfTheEternalFlow.damageBonus).toBeCloseTo(0.42)
    expect(tulaytullahsRemembrance.damageBonus).toBeCloseTo(0.48)
    expect(ultimateOverlordsMegaMagicSword.attackPercent).toBeCloseTo(0.24)
    expect(verdict.attackPercent).toBeCloseTo(0.2)
    expect(verdict.damageBonus).toBeCloseTo(0.36)
    expect(vividNotions.attackPercent).toBeCloseTo(0.28)
    expect(vividNotions.critDamage).toBeCloseTo(0.68)
    expect(vortexVanquisher.attackPercent).toBeCloseTo(0.4)
    expect(waveridingWhirl.hpPercent).toBeCloseTo(0.44)
    expect(whiteblind.attackPercent).toBeCloseTo(0.24)
    expect(whiteblind.defensePercent).toBeCloseTo(0.24)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TheWidsith", [
        "weapon.the-widsith.recitative.attack-percent",
        "weapon.the-widsith.interlude.elemental-mastery"
      ])
    ).toThrow("the-widsith-theme")
  })

  it("resolves P15 low-rarity and skill-state effects as explicit current snapshots", () => {
    const windblumeOde = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "WindblumeOde", [
      "weapon.windblume-ode.after-skill.attack-percent"
    ])
    const wolfFangSkill = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "WolfFang", [
      "weapon.wolf-fang.skill-hit.4-stack.crit-rate"
    ])
    const wolfFangBurst = resolveWeaponEffects("raiden.burst.initial_slash", "WolfFang", [
      "weapon.wolf-fang.burst-hit.4-stack.crit-rate"
    ])
    const blackTassel = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "BlackTassel", [
      "weapon.black-tassel.slime-target.damage-bonus"
    ])
    const bloodtaintedGreatsword = resolveWeaponEffects(
      "xiangling.skill.guoba.single_flame_breath",
      "BloodtaintedGreatsword",
      ["weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus"]
    )
    const coolSteel = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "CoolSteel", [
      "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus"
    ])
    const darkIronSword = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "DarkIronSword", [
      "weapon.dark-iron-sword.electro-reaction-window.attack-percent"
    ])
    const debateClub = resolveWeaponEffects("xiangling.normal.auto.first_hit", "DebateClub", [
      "weapon.debate-club.after-skill.physical-hit"
    ])
    const ferrousShadow = resolveWeaponEffects("ningguang.normal.charged_attack.with_star_jades", "FerrousShadow", [
      "weapon.ferrous-shadow.low-hp.charged-damage-bonus"
    ])

    expect(windblumeOde.attackPercent).toBeCloseTo(0.16)
    expect(wolfFangSkill.damageBonus).toBeCloseTo(0.16)
    expect(wolfFangSkill.critRate).toBeCloseTo(0.08)
    expect(wolfFangBurst.damageBonus).toBeCloseTo(0.16)
    expect(wolfFangBurst.critRate).toBeCloseTo(0.08)
    expect(blackTassel.damageBonus).toBeCloseTo(0.4)
    expect(bloodtaintedGreatsword.damageBonus).toBeCloseTo(0.12)
    expect(coolSteel.damageBonus).toBeCloseTo(0.12)
    expect(darkIronSword.attackPercent).toBeCloseTo(0.2)
    expect(debateClub.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.6, element: "physical" })])
    )
    expect(ferrousShadow.damageBonus).toBeCloseTo(0.3)
    expect(() =>
      resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "WolfFang", [
        "weapon.wolf-fang.skill-hit.1-stack.crit-rate",
        "weapon.wolf-fang.skill-hit.4-stack.crit-rate"
      ])
    ).toThrow("wolf-fang-skill-crit-rate")
  })

  it("resolves P16b stack, arrow-flight, teammate-switch, and weak-point snapshots", () => {
    const skyriderGreatsword = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SkyriderGreatsword", [
      "weapon.skyrider-greatsword.courage.4-stack.attack-percent"
    ])
    const slingshotWithin = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Slingshot", [
      "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus"
    ])
    const slingshotAfter = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Slingshot", [
      "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
    ])
    const thrillingTales = resolveCombatActionEffects({
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: ["weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon"),
      teammates: [withWeapon("ThrillingTalesOfDragonSlayers")]
    })
    const twinNephrite = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "TwinNephrite", [
      "weapon.twin-nephrite.after-defeat.attack-percent"
    ])
    const sharpshootersOath = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "SharpshootersOath", [
      "weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus"
    ])

    expect(skyriderGreatsword.attackPercent).toBeCloseTo(0.24)
    expect(slingshotWithin.damageBonus).toBeCloseTo(0.36)
    expect(slingshotAfter.damageBonus).toBeCloseTo(-0.1)
    expect(thrillingTales.attackPercent).toBeCloseTo(0.24)
    expect(thrillingTales.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ sourceId: "test.equipment.ThrillingTalesOfDragonSlayers" })])
    )
    expect(twinNephrite.attackPercent).toBeCloseTo(0.12)
    expect(sharpshootersOath.damageBonus).toBeCloseTo(0.24)
    expect(() =>
      resolveWeaponEffects("xiangling.normal.auto.first_hit", "Slingshot", [
        "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
        "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
      ])
    ).toThrow("slingshot-flight-time")
  })

  it("keeps party weapon effects off their holder and requires a selected source for duplicate holders", () => {
    const effectId = "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"
    const selfHolder = { ...withWeapon("ThrillingTalesOfDragonSlayers", 5), buildId: "test.ttds.self" }
    const singleHolder = { ...withWeapon("ThrillingTalesOfDragonSlayers", 5), buildId: "test.ttds.single" }
    const firstHolder = { ...withWeapon("ThrillingTalesOfDragonSlayers", 1), buildId: "test.ttds.r1" }
    const fifthHolder = { ...withWeapon("ThrillingTalesOfDragonSlayers", 5), buildId: "test.ttds.r5" }
    const baseInput = {
      action: requireAction("xiangling.skill.guoba.single_flame_breath"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("TestNoWeapon")
    }
    const self = resolveCombatActionEffects({ ...baseInput, primary: selfHolder, teammates: [] })
    const single = resolveCombatActionEffects({ ...baseInput, teammates: [singleHolder] })

    expect(self.attackPercent).toBeCloseTo(0)
    expect(self.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(single.attackPercent).toBeCloseTo(0.48)
    expect(single.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: singleHolder.buildId })])
    )
    expect(() =>
      resolveCombatActionEffects({ ...baseInput, teammates: [firstHolder, fifthHolder] })
    ).toThrow("multiple eligible source builds")

    const selected = resolveCombatActionEffects({
      ...baseInput,
      activeEffectSourceBuildIds: { [effectId]: fifthHolder.buildId },
      teammates: [firstHolder, fifthHolder]
    })

    expect(selected.attackPercent).toBeCloseTo(0.48)
    expect(selected.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: fifthHolder.buildId })])
    )
  })

  it("resolves P16b cooldown-ready physical events without imitating guaranteed weak-point crits", () => {
    const filletBlade = resolveWeaponEffects("xiangling.skill.guoba.single_flame_breath", "FilletBlade", [
      "weapon.fillet-blade.cooldown-ready.expected-physical-hit"
    ])
    const halberd = resolveWeaponEffects("xiangling.normal.auto.first_hit", "Halberd", [
      "weapon.halberd.cooldown-ready.physical-hit"
    ])

    expect(filletBlade.additionalDamageEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ coefficient: 2.4, element: "physical", expectedTriggerProbability: 0.5 })
      ])
    )
    expect(halberd.additionalDamageEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 1.6, element: "physical" })])
    )
  })

  it("resolves Finale of the Deep's selected capped Bond-of-Life snapshot at the flat-attack stage", () => {
    const effectId = "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"
    const r1 = resolveCombatActionEffects({
      action: requireAction("xingqiu.skill.fatal_rainscreen"),
      activeEffectIds: ["weapon.finale-of-the-deep.after-skill.attack-percent", effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("FinaleOfTheDeep", 1),
      teammates: []
    })
    const r5 = resolveCombatActionEffects({
      action: requireAction("xingqiu.skill.fatal_rainscreen"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("FinaleOfTheDeep", 5),
      teammates: []
    })
    const inactive = resolveCombatActionEffects({
      action: requireAction("xingqiu.skill.fatal_rainscreen"),
      activeEffectIds: [],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: withWeapon("FinaleOfTheDeep", 5),
      teammates: []
    })

    expect(r1.attackPercent).toBeCloseTo(0.12)
    expect(r1.flatAttack).toBeCloseTo(150)
    expect(r5.flatAttack).toBeCloseTo(300)
    expect(inactive.flatAttack).toBeCloseTo(0)
    expect(r1.appliedEffects).toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId, value: 150 })]))
  })

  it("resolves Messenger's selected weak-point physical event with a guaranteed crit policy", () => {
    const effectId = "weapon.messenger.weak-point-guaranteed-crit.additional-damage"
    const messengerR1 = { ...withWeapon("Messenger", 1), buildId: "test.messenger.r1", characterId: "Amber" }
    const messengerR5 = { ...withWeapon("Messenger", 5), buildId: "test.messenger.r5", characterId: "Amber" }
    const r1 = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: messengerR1,
      teammates: []
    })
    const r5 = resolveCombatActionEffects({
      action: requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: messengerR5,
      teammates: []
    })
    const normal = resolveCombatActionEffects({
      action: requireAction("amber.normal.auto.first_hit"),
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: messengerR5,
      teammates: []
    })

    expect(r1.additionalDamageEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canCrit: true,
          coefficient: 1,
          critPolicy: "guaranteed",
          element: "physical",
          expectedTriggerProbability: 1,
          id: effectId
        })
      ])
    )
    expect(r5.additionalDamageEvents).toEqual(expect.arrayContaining([expect.objectContaining({ coefficient: 2 })]))
    expect(normal.additionalDamageEvents).toEqual([])
  })
})
