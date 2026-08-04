import {
  bennettNationalBuiltinBuild,
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { RotationEffectWindow } from "@gscombat/calculator"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateDeclaredDirectScenarioAction,
  type DeclaredDirectScenarioInput
} from "./declared-scenario.js"
import { resolveCoreCombatStats } from "./base-stats.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("declared direct scenario actions", () => {
  it("resolves Bennett's burst initial-hit coefficient from the pinned talent table", () => {
    const action = requireAction("bennett.burst.initial_hit")
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(evaluation.parts).toEqual([{ coefficient: 4.1904, id: "initial-hit" }])
    expect(evaluation.stats.talentMultiplier).toBeCloseTo(4.1904)
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
  })

  it("applies Crimson Witch's Vaporize and Melt bonus in both direct and rotation formula traces", () => {
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const createBuild = (setId: string): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId })),
      buildId: `test.xiangling.${setId.toLowerCase()}`
    })
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: createBuild("TestNoArtifactSet"),
      buffs: [],
      enemy,
      gameData
    })
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: createBuild("CrimsonWitchOfFlames"),
      buffs: [],
      enemy,
      gameData
    })
    const directReaction = evaluation.result.trace.find((entry) => entry.stage === "amplifying_reaction")
    const rotationReaction = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "amplifying_reaction")

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
          target: "amplifyingReactionBonus",
          value: 0.15
        })
      ])
    )
    expect(directReaction).toMatchObject({ formula: { bonus: 0.15, reaction: "vaporize_reverse" } })
    expect(rotationReaction).toMatchObject({ bonus: 0.15, reaction: "vaporize_reverse" })
    expect(evaluation.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(evaluation.rotation.dpr).toBeGreaterThan(baseline.rotation.dpr)
  })

  it("derives Gilded Dreams' selected same- and different-element bonuses from the configured party", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const build = {
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "GildedDreams" })),
      buildId: "test.xiangling.gilded-dreams"
    }
    const coreStats = resolveCoreCombatStats(build, gameData)
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [
        "artifact.gilded-dreams.4pc.after-reaction.1-same-element-teammate.attack-percent",
        "artifact.gilded-dreams.4pc.after-reaction.2-different-element-teammates.elemental-mastery"
      ],
      build,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild, xingqiuNationalBuiltinBuild, raidenNationalBuiltinBuild]
    })

    expect(evaluation.stats.attackPercent).toBeCloseTo(coreStats.attackPercent + 0.14)
    expect(evaluation.stats.elementalMastery).toBeCloseTo(coreStats.elementalMastery + 180)
    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.gilded-dreams.4pc.after-reaction.1-same-element-teammate.attack-percent",
          value: 0.14
        }),
        expect.objectContaining({
          id: "artifact.gilded-dreams.4pc.after-reaction.2-different-element-teammates.elemental-mastery",
          value: 100
        })
      ])
    )
  })

  it("derives A Thousand Floating Dreams' holder-only elemental composition bonuses from the configured party", () => {
    const action = requireAction("nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit")
    const createNahidaBuild = (refinement: number): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
      buildId: `test.nahida.a-thousand-floating-dreams.r${refinement}`,
      characterId: "Nahida",
      label: `纳西妲千夜浮梦 R${refinement} 测试配置`,
      weapon: { ascension: 6, level: 90, refinement, weaponId: "AThousandFloatingDreams" }
    })
    const dendroTraveler: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.traveler.dendro-female",
      characterId: "Traveler",
      variant: { element: "dendro", gender: "female", kind: "traveler" }
    }
    const r1Build = createNahidaBuild(1)
    const r5Build = createNahidaBuild(5)
    const teammates = [dendroTraveler, xingqiuNationalBuiltinBuild, bennettNationalBuiltinBuild]
    const r1CoreStats = resolveCoreCombatStats(r1Build, gameData)
    const r5CoreStats = resolveCoreCombatStats(r5Build, gameData)
    const r1 = evaluateDeclaredDirectScenarioAction({ action, build: r1Build, buffs: [], enemy, gameData, teammates })
    const r5 = evaluateDeclaredDirectScenarioAction({ action, build: r5Build, buffs: [], enemy, gameData, teammates })
    const r1SameElementEffect = r1.appliedEffects.find(
      (effect) => effect.id === "weapon.a-thousand-floating-dreams.1-same-element-teammate.elemental-mastery"
    )
    const r1DifferentElementEffect = r1.appliedEffects.find(
      (effect) => effect.id === "weapon.a-thousand-floating-dreams.2-different-element-teammates.damage-bonus"
    )
    const r5SameElementEffect = r5.appliedEffects.find(
      (effect) => effect.id === "weapon.a-thousand-floating-dreams.1-same-element-teammate.elemental-mastery"
    )
    const r5DifferentElementEffect = r5.appliedEffects.find(
      (effect) => effect.id === "weapon.a-thousand-floating-dreams.2-different-element-teammates.damage-bonus"
    )

    expect(r1.stats.elementalMastery).toBeCloseTo(r1CoreStats.elementalMastery + 32)
    expect(r5.stats.elementalMastery).toBeCloseTo(r5CoreStats.elementalMastery + 64)
    expect(r1SameElementEffect).toMatchObject({ value: 32 })
    expect(r1DifferentElementEffect).toMatchObject({ value: 0.2 })
    expect(r5SameElementEffect).toMatchObject({ value: 64 })
    expect(r5DifferentElementEffect).toMatchObject({ value: 0.52 })
  })

  it("stacks A Thousand Floating Dreams' automatic party elemental mastery from each other equipped source", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const createAThousandFloatingDreamsBuild = (
      characterId: "Mona" | "Nahida",
      buildId: string,
      refinement: number
    ): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      buildId,
      characterId,
      label: `${characterId}千夜浮梦 R${refinement} 测试配置`,
      weapon: { ascension: 6, level: 90, refinement, weaponId: "AThousandFloatingDreams" }
    })
    const coreStats = resolveCoreCombatStats(xianglingNationalBuiltinBuild, gameData)
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [
        createAThousandFloatingDreamsBuild("Nahida", "test.nahida.a-thousand-floating-dreams.r1", 1),
        createAThousandFloatingDreamsBuild("Mona", "test.mona.a-thousand-floating-dreams.r5", 5)
      ]
    })
    const partyEffects = evaluation.appliedEffects.filter(
      (effect) => effect.id === "weapon.a-thousand-floating-dreams.other-party.elemental-mastery"
    )

    expect(evaluation.stats.elementalMastery).toBeCloseTo(coreStats.elementalMastery + 88)
    expect(partyEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourceId: "test.nahida.a-thousand-floating-dreams.r1", value: 40 }),
        expect.objectContaining({ sourceId: "test.mona.a-thousand-floating-dreams.r5", value: 48 })
      ])
    )
  })

  it("applies Key of Khaj-Nisut's selected Grand Hymn stack from final maximum HP", () => {
    const action = requireAction("nilou.skill.dance_of_haftkarsvar.initial_hit")
    const build: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.nilou.key-of-khaj-nisut.r1",
      characterId: "Nilou",
      label: "妮露圣显之钥 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "KeyOfKhajNisut" }
    }
    const coreStats = resolveCoreCombatStats(build, gameData)
    const expectedFinalHp = coreStats.hp + coreStats.baseHp * 0.2
    const oneStack = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: ["weapon.key-of-khaj-nisut.grand-hymn.1-stack.final-hp-to-elemental-mastery"],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const threeStacks = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: ["weapon.key-of-khaj-nisut.grand-hymn.3-stack.final-hp-to-elemental-mastery"],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const oneStackEffect = oneStack.appliedEffects.find(
      (effect) => effect.id === "weapon.key-of-khaj-nisut.grand-hymn.1-stack.final-hp-to-elemental-mastery"
    )
    const threeStackEffect = threeStacks.appliedEffects.find(
      (effect) => effect.id === "weapon.key-of-khaj-nisut.grand-hymn.3-stack.final-hp-to-elemental-mastery"
    )

    expect(oneStack.stats.elementalMastery).toBeCloseTo(coreStats.elementalMastery + expectedFinalHp * 0.0012)
    expect(threeStacks.stats.elementalMastery).toBeCloseTo(coreStats.elementalMastery + expectedFinalHp * 0.0036)
    expect(oneStackEffect).toMatchObject({ target: "elementalMastery", value: expectedFinalHp * 0.0012 })
    expect(threeStackEffect).toMatchObject({ target: "elementalMastery", value: expectedFinalHp * 0.0036 })
  })

  it("uses Key of Khaj-Nisut holder's final HP for its selected three-stack party elemental mastery", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const keyHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.nilou.key-of-khaj-nisut.party-source.r1",
      characterId: "Nilou",
      label: "妮露圣显之钥队伍来源 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "KeyOfKhajNisut" }
    }
    const effectId = "weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"
    const sourceCoreStats = resolveCoreCombatStats(keyHolder, gameData)
    const expectedSourceFinalHp = sourceCoreStats.hp + sourceCoreStats.baseHp * 0.2
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [keyHolder]
    })
    const partySnapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [keyHolder]
    })
    const effect = partySnapshot.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, sourceId: keyHolder.buildId, target: "elementalMastery" })
    expect(effect?.value).toBeCloseTo(expectedSourceFinalHp * 0.002)
    expect(partySnapshot.stats.elementalMastery - baseline.stats.elementalMastery).toBeCloseTo(effect?.value as number)
  })

  it("includes the primary Key holder's target-side HP inputs in its selected party elemental mastery", () => {
    const action = requireAction("nilou.skill.dance_of_haftkarsvar.initial_hit")
    const build: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.nilou.key-of-khaj-nisut.primary-source.r1",
      characterId: "Nilou",
      label: "妮露圣显之钥主角色来源 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "KeyOfKhajNisut" }
    }
    const effectId = "weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"
    const coreStats = resolveCoreCombatStats(build, gameData)
    const expectedSourceFinalHp = coreStats.hp + coreStats.baseHp * 0.45 + 500
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      artifactStatDeltas: { hp: 500 },
      build,
      buffs: [{ label: "测试生命值", sourceId: "test.hp", stat: "hp_percent", value: 0.25 }],
      enemy,
      gameData
    })
    const effect = evaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ sourceId: build.buildId, target: "elementalMastery" })
    expect(effect?.value).toBeCloseTo(expectedSourceFinalHp * 0.002)
  })

  it("applies Jadefall's Splendor's selected final-HP bonus only to the holder's own element", () => {
    const dendroAction = requireAction("baizhu.skill.universal_diagnosis.gossamer_sprite.initial_hit")
    const nonOwnElementAction = {
      ...dendroAction,
      element: "hydro",
      id: "test.baizhu.jadefalls-splendor.non-own-element"
    } satisfies CombatActionMetadata
    const build: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.baizhu.jadefalls-splendor.r1",
      characterId: "Baizhu",
      label: "白术碧落之珑 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "JadefallsSplendor" }
    }
    const effectId = "weapon.jadefalls-splendor.after-burst-or-shield.final-hp-to-own-element-damage-bonus"
    const dendroBaseline = evaluateDeclaredDirectScenarioAction({
      action: dendroAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const dendroSnapshot = evaluateDeclaredDirectScenarioAction({
      action: dendroAction,
      activeEffectIds: [effectId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const nonOwnElementBaseline = evaluateDeclaredDirectScenarioAction({
      action: nonOwnElementAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const nonOwnElementSnapshot = evaluateDeclaredDirectScenarioAction({
      action: nonOwnElementAction,
      activeEffectIds: [effectId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const cappedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: dendroAction,
      activeEffectIds: [effectId],
      artifactStatDeltas: { hp_percent: 10 },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const effect = dendroSnapshot.appliedEffects.find((candidate) => candidate.id === effectId)
    const cappedEffect = cappedSnapshot.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, target: "damageBonus", value: expect.any(Number) })
    expect(effect?.value).toBeGreaterThan(0)
    expect(dendroSnapshot.stats.damageBonus - dendroBaseline.stats.damageBonus).toBeCloseTo(effect?.value as number)
    expect(cappedEffect).toMatchObject({ target: "damageBonus", value: 0.12 })
    expect(nonOwnElementSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(nonOwnElementSnapshot.stats.damageBonus).toBeCloseTo(nonOwnElementBaseline.stats.damageBonus)
  })

  it("applies Ring of Yaxche's selected final-HP bonus only to normal-attack damage", () => {
    const normalAction = requireAction("mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum")
    const burstAction = requireAction("mualani.burst.boomsharka_laka.tracking_missile")
    const build: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mualani.ring-of-yaxche.r1",
      characterId: "Mualani",
      label: "玛拉妮木棉之环 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RingOfYaxche" }
    }
    const effectId = "weapon.ring-of-yaxche.after-skill.final-hp-to-normal-damage-bonus"
    const normalBaseline = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const normalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [effectId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const cappedNormalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [effectId],
      artifactStatDeltas: { hp_percent: 10 },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const burstBaseline = evaluateDeclaredDirectScenarioAction({
      action: burstAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const burstSnapshot = evaluateDeclaredDirectScenarioAction({
      action: burstAction,
      activeEffectIds: [effectId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const normalEffect = normalSnapshot.appliedEffects.find((candidate) => candidate.id === effectId)
    const cappedNormalEffect = cappedNormalSnapshot.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(normalEffect).toMatchObject({ id: effectId, target: "damageBonus", value: expect.any(Number) })
    expect(normalEffect?.value).toBeGreaterThan(0)
    expect(normalSnapshot.stats.damageBonus - normalBaseline.stats.damageBonus).toBeCloseTo(normalEffect?.value as number)
    expect(cappedNormalEffect).toMatchObject({ target: "damageBonus", value: 0.16 })
    expect(burstSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(burstSnapshot.stats.damageBonus).toBeCloseTo(burstBaseline.stats.damageBonus)
  })

  it("applies Staff of the Scarlet Sands' elemental-mastery attack conversions from the resolved mastery stage", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const createBuild = (refinement: number): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      buildId: `test.xiangling.staff-of-the-scarlet-sands.r${refinement}`,
      label: `香菱赤沙之杖 R${refinement} 测试配置`,
      weapon: { ascension: 6, level: 90, refinement, weaponId: "StaffOfTheScarletSands" }
    })
    const r1Build = createBuild(1)
    const r5Build = createBuild(5)
    const automaticEffectId = "weapon.staff-of-the-scarlet-sands.elemental-mastery-to-flat-attack"
    const threeStackEffectId = "weapon.staff-of-the-scarlet-sands.red-sands-dream.3-stack.elemental-mastery-to-flat-attack"
    const r1FinalElementalMastery = resolveCoreCombatStats(r1Build, gameData).elementalMastery + 100
    const r5FinalElementalMastery = resolveCoreCombatStats(r5Build, gameData).elementalMastery + 100
    const r1Automatic = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const r1ThreeStacks = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [threeStackEffectId],
      artifactStatDeltas: { elemental_mastery: 100 },
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const r5Automatic = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build: r5Build,
      buffs: [],
      enemy,
      gameData
    })
    const r5ThreeStacks = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [threeStackEffectId],
      artifactStatDeltas: { elemental_mastery: 100 },
      build: r5Build,
      buffs: [],
      enemy,
      gameData
    })
    const automaticEffect = r1Automatic.appliedEffects.find((effect) => effect.id === automaticEffectId)
    const r1ThreeStackEffect = r1ThreeStacks.appliedEffects.find((effect) => effect.id === threeStackEffectId)
    const r5ThreeStackEffect = r5ThreeStacks.appliedEffects.find((effect) => effect.id === threeStackEffectId)

    expect(automaticEffect).toMatchObject({ target: "flatAttack" })
    expect(r1ThreeStackEffect).toMatchObject({ target: "flatAttack" })
    expect(r5ThreeStackEffect).toMatchObject({ target: "flatAttack" })
    expect(automaticEffect?.value).toBeCloseTo(r1FinalElementalMastery * 0.52)
    expect(r1ThreeStackEffect?.value).toBeCloseTo(r1FinalElementalMastery * 0.84)
    expect(r5ThreeStackEffect?.value).toBeCloseTo(r5FinalElementalMastery * 1.68)
    expect(r1ThreeStacks.stats.flatAttack - r1Automatic.stats.flatAttack).toBeCloseTo(r1FinalElementalMastery * 0.84)
    expect(r5ThreeStacks.stats.flatAttack - r5Automatic.stats.flatAttack).toBeCloseTo(r5FinalElementalMastery * 1.68)
  })

  it("uses each party holder's final elemental mastery for selected Makhaira Aquamarine and Wandering Evenstar snapshots", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const makhairaHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.noelle.makhaira-aquamarine.r1",
      characterId: "Noelle",
      label: "诺艾尔 玛海菈的水色 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "MakhairaAquamarine" }
    }
    const wanderingEvenstarHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mona.wandering-evenstar.r5",
      characterId: "Mona",
      label: "莫娜 流浪的晚星 R5 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "WanderingEvenstar" }
    }
    const aThousandFloatingDreamsHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.nahida.a-thousand-floating-dreams.source-mastery",
      characterId: "Nahida",
      label: "纳西妲 千夜浮梦来源精通测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AThousandFloatingDreams" }
    }
    const makhairaEffectId = "weapon.makhaira-aquamarine.after-10s.other-party.source-em-to-flat-attack"
    const wanderingEvenstarEffectId = "weapon.wandering-evenstar.after-10s.other-party.source-em-to-flat-attack"
    const makhairaFinalElementalMastery = resolveCoreCombatStats(makhairaHolder, gameData).elementalMastery + 40
    const wanderingEvenstarFinalElementalMastery =
      resolveCoreCombatStats(wanderingEvenstarHolder, gameData).elementalMastery + 40
    const teammates = [makhairaHolder, wanderingEvenstarHolder, aThousandFloatingDreamsHolder]
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates
    })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [makhairaEffectId, wanderingEvenstarEffectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates
    })
    const makhairaEffect = snapshot.appliedEffects.find((effect) => effect.id === makhairaEffectId)
    const wanderingEvenstarEffect = snapshot.appliedEffects.find((effect) => effect.id === wanderingEvenstarEffectId)

    expect(makhairaEffect).toMatchObject({ sourceId: makhairaHolder.buildId, target: "flatAttack" })
    expect(wanderingEvenstarEffect).toMatchObject({ sourceId: wanderingEvenstarHolder.buildId, target: "flatAttack" })
    expect(makhairaEffect?.value).toBeCloseTo(makhairaFinalElementalMastery * 0.24 * 0.3)
    expect(wanderingEvenstarEffect?.value).toBeCloseTo(wanderingEvenstarFinalElementalMastery * 0.48 * 0.3)
    expect(snapshot.stats.flatAttack - baseline.stats.flatAttack).toBeCloseTo(
      makhairaFinalElementalMastery * 0.24 * 0.3 + wanderingEvenstarFinalElementalMastery * 0.48 * 0.3
    )
  })

  it("stacks each same-name Makhaira Aquamarine party source in one selected snapshot", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const createMakhairaHolder = (characterId: "Beidou" | "Noelle", refinement: number): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      buildId: `test.${characterId.toLowerCase()}.makhaira-aquamarine.r${refinement}`,
      characterId,
      label: `${characterId} 玛海菈的水色 R${refinement} 测试配置`,
      weapon: { ascension: 6, level: 90, refinement, weaponId: "MakhairaAquamarine" }
    })
    const r1Holder = createMakhairaHolder("Noelle", 1)
    const r5Holder = createMakhairaHolder("Beidou", 5)
    const effectId = "weapon.makhaira-aquamarine.after-10s.other-party.source-em-to-flat-attack"
    const r1FinalElementalMastery = resolveCoreCombatStats(r1Holder, gameData).elementalMastery
    const r5FinalElementalMastery = resolveCoreCombatStats(r5Holder, gameData).elementalMastery
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r1Holder, r5Holder]
    })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r1Holder, r5Holder]
    })
    const effects = snapshot.appliedEffects.filter((effect) => effect.id === effectId)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: r1Holder.buildId },
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [r1Holder, r5Holder]
      })
    ).toThrow(`Effect ${effectId} resolves every matching party source and cannot select only ${r1Holder.buildId}`)
    expect(effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourceId: r1Holder.buildId, target: "flatAttack" }),
        expect.objectContaining({ sourceId: r5Holder.buildId, target: "flatAttack" })
      ])
    )
    expect(snapshot.stats.flatAttack - baseline.stats.flatAttack).toBeCloseTo(
      r1FinalElementalMastery * 0.24 * 0.3 + r5FinalElementalMastery * 0.48 * 0.3
    )
  })

  it("applies Primordial Jade Cutter's final maximum HP conversion after its own and external HP bonuses", () => {
    const action = requireAction("bennett.skill.passion_overload.press")
    const r1Build = {
      ...bennettNationalBuiltinBuild,
      buildId: "test.bennett.primordial-jade-cutter.r1",
      label: "Bennett Primordial Jade Cutter R1 fixture",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PrimordialJadeCutter" as const }
    }
    const r5Build = {
      ...r1Build,
      buildId: "test.bennett.primordial-jade-cutter.r5",
      label: "Bennett Primordial Jade Cutter R5 fixture",
      weapon: { ...r1Build.weapon, refinement: 5 }
    }
    const r1Core = resolveCoreCombatStats(r1Build, gameData)
    const r5Core = resolveCoreCombatStats(r5Build, gameData)
    const r1 = evaluateDeclaredDirectScenarioAction({ action, build: r1Build, buffs: [], enemy, gameData })
    const r5 = evaluateDeclaredDirectScenarioAction({ action, build: r5Build, buffs: [], enemy, gameData })
    const externallyBuffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { hp: 1000 },
      build: r1Build,
      buffs: [{ label: "测试生命值", sourceId: "test.hp", stat: "hp_percent", value: 0.25 }],
      enemy,
      gameData
    })
    const expectedR1Hp = r1Core.hp + r1Core.baseHp * 0.2
    const expectedR5Hp = r5Core.hp + r5Core.baseHp * 0.4
    const expectedR1FlatAttack = expectedR1Hp * 0.012
    const expectedR5FlatAttack = expectedR5Hp * 0.024
    const r1Effect = r1.appliedEffects.find(
      (effect) => effect.id === "weapon.primordial-jade-cutter.hp-sourced-flat-attack"
    )
    const r5Effect = r5.appliedEffects.find(
      (effect) => effect.id === "weapon.primordial-jade-cutter.hp-sourced-flat-attack"
    )
    const externallyBuffedEffect = externallyBuffed.appliedEffects.find(
      (effect) => effect.id === "weapon.primordial-jade-cutter.hp-sourced-flat-attack"
    )

    expect(r1.stats.flatAttack).toBeCloseTo(r1Core.flatAttack + expectedR1FlatAttack)
    expect(r5.stats.flatAttack).toBeCloseTo(r5Core.flatAttack + expectedR5FlatAttack)
    expect(r1.stats.effectiveAttack).toBeCloseTo(
      r1Core.baseAttack * (1 + r1Core.attackPercent) + r1Core.flatAttack + expectedR1FlatAttack
    )
    expect(r5.stats.effectiveAttack).toBeCloseTo(
      r5Core.baseAttack * (1 + r5Core.attackPercent) + r5Core.flatAttack + expectedR5FlatAttack
    )
    expect(r1Effect).toMatchObject({ target: "flatAttack", value: expectedR1FlatAttack })
    expect(r5Effect).toMatchObject({ target: "flatAttack", value: expectedR5FlatAttack })
    expect(externallyBuffedEffect).toMatchObject({
      target: "flatAttack",
      value: expectedR1FlatAttack + (r1Core.baseHp * 0.25 + 1000) * 0.012
    })
    expect(externallyBuffed.result.expectedDamage).toBeGreaterThan(r1.result.expectedDamage)
    expect(externallyBuffed.rotation.dpr).toBeCloseTo(externallyBuffed.result.expectedDamage)
  })

  it("adds Redhorn's defense term to the triggering hit before that hit's shared Vaporize multiplier", () => {
    const action = {
      ...requireAction("noelle.normal.auto.first_hit"),
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" as const },
      element: "pyro" as const,
      id: "test.noelle.redhorn.normal.vaporize"
    } satisfies CombatActionMetadata
    const build = {
      ...bennettNationalBuiltinBuild,
      buildId: "test.noelle.redhorn.r1",
      characterId: "Noelle",
      constellation: 0,
      label: "诺艾尔赤角 R1 测试配置",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RedhornStonethresher" as const }
    }
    const evaluation = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const resultScaling = evaluation.result.trace[0]?.formula
    const rotationEvent = evaluation.rotation.events[0]
    const rotationScaling = rotationEvent?.trace[0]

    if (!resultScaling || resultScaling.kind !== "scaling_terms") {
      throw new Error("Expected same-hit Redhorn term in the direct formula trace")
    }
    if (!rotationScaling || rotationScaling.kind !== "scaling_terms") {
      throw new Error("Expected same-hit Redhorn term in the rotation formula trace")
    }

    const redhornTerm = rotationScaling.terms.find(
      (term) => term.label === "赤角石溃杵 · 普通攻击与重击防御力同一命中加算"
    )
    const vaporize = rotationEvent.trace.find((entry) => entry.kind === "amplifying_reaction")

    expect(evaluation.rotation.events).toHaveLength(1)
    expect(resultScaling.terms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          coefficient: 0.4,
          label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
          stat: "defense"
        })
      ])
    )
    expect(redhornTerm).toMatchObject({ coefficient: 0.4, stat: "defense" })
    expect(redhornTerm?.contribution).toBeCloseTo((redhornTerm?.value ?? 0) * 0.4)
    expect(vaporize).toMatchObject({ before: rotationScaling.after, kind: "amplifying_reaction" })
    expect(rotationEvent.trace.map((entry) => entry.kind)).toEqual([
      "scaling_terms",
      "amplifying_reaction",
      "damage_bonus",
      "expected_crit",
      "defense",
      "resistance"
    ])
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
  })

  it("adds Cinnabar Spindle's selected cooldown-ready defense term to Albedo's one Transient Blossom", () => {
    const action = requireAction("albedo.skill.transient_blossom")
    const effectId = "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"
    const createBuild = (refinement: number) => ({
      ...raidenNationalBuiltinBuild,
      artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
      buildId: `test.albedo.cinnabar-spindle.r${refinement}`,
      characterId: "Albedo",
      constellation: 0,
      label: `阿贝多辰砂之纺锤 R${refinement} 测试配置`,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement, weaponId: "CinnabarSpindle" as const }
    })
    const inactive = evaluateDeclaredDirectScenarioAction({
      action,
      build: createBuild(1),
      buffs: [],
      enemy,
      gameData
    })
    const r1 = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: createBuild(1),
      buffs: [],
      enemy,
      gameData
    })
    const r5 = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: createBuild(5),
      buffs: [],
      enemy,
      gameData
    })
    const r1Trace = r1.rotation.events[0]?.trace[0]
    const r5Trace = r5.rotation.events[0]?.trace[0]

    if (!r1Trace || r1Trace.kind !== "scaling_terms") throw new Error("Expected Cinnabar R1 same-hit formula trace")
    if (!r5Trace || r5Trace.kind !== "scaling_terms") throw new Error("Expected Cinnabar R5 same-hit formula trace")

    expect(inactive.rotation.events).toHaveLength(1)
    expect(r1.rotation.events).toHaveLength(1)
    expect(r1Trace.terms).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, stat: "defense" })])
    )
    expect(r5Trace.terms).toEqual(
      expect.arrayContaining([expect.objectContaining({ coefficient: 0.8, stat: "defense" })])
    )
    expect(r1.appliedEffects).toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId, value: 0.4 })]))
    expect(r5.appliedEffects).toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId, value: 0.8 })]))
    expect(r1.rotation.dpr).toBeGreaterThan(inactive.rotation.dpr)
    expect(r5.rotation.dpr).toBeGreaterThan(r1.rotation.dpr)
  })

  it("does not multiply Redhorn's same-hit term by an original event-only coefficient multiplier", () => {
    const action = {
      ...requireAction("noelle.normal.auto.first_hit"),
      id: "test.noelle.redhorn.event-coefficient-multiplier",
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "original-hit-multiplier-state",
          label: "测试原始技能倍率档位",
          maximumValue: 1,
          minimumValue: 0
        }
      ],
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "original-hit-multiplier-state",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 2, parameterValue: 1 }
              ]
            },
            damagePartId: "normal-attack-first-hit",
            id: "normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    } satisfies CombatActionMetadata
    const build = {
      ...bennettNationalBuiltinBuild,
      buildId: "test.noelle.redhorn.event-coefficient-multiplier",
      characterId: "Noelle",
      constellation: 0,
      label: "诺艾尔赤角事件倍率测试配置",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RedhornStonethresher" as const }
    }
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      actionParameters: { "original-hit-multiplier-state": 1 },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const scaling = evaluation.rotation.events[0]?.trace[0]

    if (!scaling || scaling.kind !== "scaling_terms") {
      throw new Error("Expected scaling terms for a Redhorn event multiplier test")
    }

    const originalAttackTerm = scaling.terms.find((term) => term.stat === "attack")
    const redhornTerm = scaling.terms.find(
      (term) => term.label === "赤角石溃杵 · 普通攻击与重击防御力同一命中加算"
    )

    expect(originalAttackTerm?.coefficient).toBeCloseTo(1.564 * 2)
    expect(redhornTerm?.coefficient).toBeCloseTo(0.4)
  })

  it("uses a declared health scaling stat through the scenario result and rotation", () => {
    const action = {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [{ coefficientParameterId: "initial-hit-multiplier", id: "test-hit" }],
      element: "pyro",
      evaluator: "declared_direct",
      id: "test.bennett.hp_scaling",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "initial-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    } satisfies CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [{ label: "测试生命值", sourceId: "test.hp", stat: "hp_percent", value: 0.25 }],
      enemy,
      gameData
    })

    expect(baseline.result.trace[0]?.stage).toBe("scaling")
    expect(baseline.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(baseline.rotation.events[0]?.trace[0]).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage)
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(buffed.rotation.dpr).toBeCloseTo(buffed.result.expectedDamage)
  })

  it("uses a declared elemental-mastery scaling stat through the scenario result and rotation", () => {
    const action = {
      ...requireAction("bennett.burst.initial_hit"),
      id: "test.bennett.elemental_mastery_scaling",
      scalingStat: "elementalMastery"
    } satisfies CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 200 },
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const baselineFormula = baseline.result.trace[0]?.formula
    const buffedFormula = buffed.result.trace[0]?.formula

    expect(baselineFormula).toMatchObject({ kind: "scaling", stat: "elementalMastery" })
    expect(baseline.rotation.events[0]?.trace[0]).toMatchObject({ kind: "scaling", stat: "elementalMastery" })
    if (baselineFormula?.kind !== "scaling" || buffedFormula?.kind !== "scaling") {
      throw new Error("Expected elemental-mastery scaling formulas")
    }
    expect(buffedFormula.value - baselineFormula.value).toBeCloseTo(100)
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(buffed.rotation.dpr).toBeCloseTo(buffed.result.expectedDamage)
  })

  it("puts an action-owned intrinsic effect in the damage-bonus multiplier", () => {
    const baselineAction = requireAction("bennett.burst.initial_hit")
    const action = {
      ...baselineAction,
      id: "test.bennett.action_intrinsic_damage_bonus",
      intrinsicEffects: [
        {
          coefficientParameterId: "initial-hit-multiplier",
          kind: "flat",
          snapshotChecks: [
            { expectedCoefficient: 2.328, talentLevel: 1 },
            { expectedCoefficient: 4.1904, talentLevel: 10 }
          ],
          target: "damageBonus"
        }
      ]
    } satisfies CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({ action: baselineAction, build: bennettNationalBuiltinBuild, buffs: [], enemy, gameData })
    const intrinsic = evaluateDeclaredDirectScenarioAction({ action, build: bennettNationalBuiltinBuild, buffs: [], enemy, gameData })
    const expectedDamageMultiplier = (1 + intrinsic.stats.damageBonus) / (1 + baseline.stats.damageBonus)

    expect(intrinsic.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(4.1904)
    expect(intrinsic.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage * expectedDamageMultiplier)
    expect(intrinsic.rotation.dpr).toBeCloseTo(intrinsic.result.expectedDamage)
  })

  it("applies intrinsic source-stat, crit, pre-scaling, and bounded action-state effects through both evaluators", () => {
    const createBuild = (characterId: string, weaponId: string) => ({
      ...raidenNationalBuiltinBuild,
      buildId: `test.intrinsic-effects.${characterId}`,
      characterId,
      constellation: 0,
      label: `${characterId} intrinsic effect fixture`,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
    })
    const nahidaAction = requireAction("nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit")
    const { intrinsicEffects: _nahidaEffects, ...nahidaWithoutEffects } = nahidaAction
    const nahidaBuild = createBuild("Nahida", "FavoniusCodex")
    const nahidaBaseline = evaluateDeclaredDirectScenarioAction({
      action: nahidaWithoutEffects,
      artifactStatDeltas: { elemental_mastery: 10_000 },
      build: nahidaBuild,
      buffs: [],
      enemy,
      gameData
    })
    const nahida = evaluateDeclaredDirectScenarioAction({
      action: nahidaAction,
      artifactStatDeltas: { elemental_mastery: 10_000 },
      build: nahidaBuild,
      buffs: [],
      enemy,
      gameData
    })
    const neferAction = requireAction("nefer.skill.senet_strategy.phantom_performance.second_hit")
    const { intrinsicEffects: _neferEffects, ...neferWithoutEffects } = neferAction
    const neferBuild = createBuild("Nefer", "FavoniusCodex")
    const neferBaseline = evaluateDeclaredDirectScenarioAction({
      action: neferWithoutEffects,
      build: neferBuild,
      buffs: [],
      enemy,
      gameData
    })
    const nefer = evaluateDeclaredDirectScenarioAction({
      action: neferAction,
      build: neferBuild,
      buffs: [],
      enemy,
      gameData
    })
    const xiaoAction = requireAction("xiao.burst.bane_of_all_evil.high_plunge")
    const xiaoBuild = createBuild("Xiao", "FavoniusLance")
    const xiaoAtStart = evaluateDeclaredDirectScenarioAction({
      action: xiaoAction,
      actionParameters: { "a1-bane-extra-stage-count": 0 },
      build: xiaoBuild,
      buffs: [],
      enemy,
      gameData
    })
    const xiaoAtCap = evaluateDeclaredDirectScenarioAction({
      action: xiaoAction,
      actionParameters: { "a1-bane-extra-stage-count": 4 },
      build: xiaoBuild,
      buffs: [],
      enemy,
      gameData
    })
    const zhongliAction = requireAction("zhongli.burst.planet_befall.meteor")
    const zhongliBeforeA4 = evaluateDeclaredDirectScenarioAction({
      action: zhongliAction,
      build: { ...createBuild("Zhongli", "FavoniusLance"), ascension: 3 },
      buffs: [],
      enemy,
      gameData
    })
    const zhongliAtA4 = evaluateDeclaredDirectScenarioAction({
      action: zhongliAction,
      build: createBuild("Zhongli", "FavoniusLance"),
      buffs: [],
      enemy,
      gameData
    })
    const mavuikaAction = requireAction("mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize")
    const { intrinsicEffects: _mavuikaEffects, ...mavuikaWithoutEffects } = mavuikaAction
    const mavuikaBuild = createBuild("Mavuika", "FavoniusGreatsword")
    const mavuikaAt100 = evaluateDeclaredDirectScenarioAction({
      action: mavuikaAction,
      actionParameters: { "fighting-spirit": 100 },
      build: mavuikaBuild,
      buffs: [],
      enemy,
      gameData
    })
    const mavuikaAt200 = evaluateDeclaredDirectScenarioAction({
      action: mavuikaAction,
      build: mavuikaBuild,
      buffs: [],
      enemy,
      gameData
    })
    const mavuikaAt200WithoutA4 = evaluateDeclaredDirectScenarioAction({
      action: mavuikaWithoutEffects,
      build: mavuikaBuild,
      buffs: [],
      enemy,
      gameData
    })
    const mavuikaBeforeA4 = evaluateDeclaredDirectScenarioAction({
      action: mavuikaAction,
      build: { ...mavuikaBuild, ascension: 3 },
      buffs: [],
      enemy,
      gameData
    })
    const mavuikaBeforeA4WithoutA4 = evaluateDeclaredDirectScenarioAction({
      action: mavuikaWithoutEffects,
      build: { ...mavuikaBuild, ascension: 3 },
      buffs: [],
      enemy,
      gameData
    })
    const travelerAction = requireAction("traveler.dendro.skill.razorgrass_blade")
    const { intrinsicEffects: _travelerEffects, ...travelerWithoutEffects } = travelerAction
    const travelerBuild = {
      ...createBuild("Traveler", "FavoniusSword"),
      variant: { element: "dendro" as const, gender: "female" as const, kind: "traveler" as const }
    }
    const travelerAtHighElementalMastery = evaluateDeclaredDirectScenarioAction({
      action: travelerAction,
      artifactStatDeltas: { elemental_mastery: 10_000 },
      build: travelerBuild,
      buffs: [],
      enemy,
      gameData
    })
    const travelerAtHighElementalMasteryWithoutA4 = evaluateDeclaredDirectScenarioAction({
      action: travelerWithoutEffects,
      artifactStatDeltas: { elemental_mastery: 10_000 },
      build: travelerBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(nahida.stats.damageBonus - nahidaBaseline.stats.damageBonus).toBeCloseTo(0.8)
    expect(nahida.stats.critRate - nahidaBaseline.stats.critRate).toBeCloseTo(0.24)
    expect(nefer.stats.elementalMastery - neferBaseline.stats.elementalMastery).toBeCloseTo(100)
    expect(xiaoAtCap.stats.damageBonus - xiaoAtStart.stats.damageBonus).toBeCloseTo(0.2)
    expect(zhongliBeforeA4.parts[0]?.terms?.[1]).toEqual({ coefficient: 0, stat: "hp" })
    expect(zhongliAtA4.parts[0]?.terms?.[1]).toEqual({ coefficient: 0.33, stat: "hp" })
    expect(mavuikaAt100.stats.actionParameters).toEqual({ "fighting-spirit": 100 })
    expect(mavuikaAt200.stats.damageBonus - mavuikaAt100.stats.damageBonus).toBeCloseTo(0.2)
    expect(mavuikaAt200.stats.damageBonus - mavuikaAt200WithoutA4.stats.damageBonus).toBeCloseTo(0.4)
    expect(mavuikaBeforeA4.stats.damageBonus).toBeCloseTo(mavuikaBeforeA4WithoutA4.stats.damageBonus)
    expect(
      travelerAtHighElementalMastery.stats.damageBonus - travelerAtHighElementalMasteryWithoutA4.stats.damageBonus
    ).toBeCloseTo(0.15)
    for (const evaluation of [nefer, nahida, xiaoAtCap, zhongliAtA4, mavuikaAt200, travelerAtHighElementalMastery]) {
      expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
    }
  })

  it("applies a capped source-stat-to-Attack conversion before a declared direct action", () => {
    const action = requireAction("hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize")
    const { cappedStatToAttackConversion: conversion, ...uncappedAction } = action
    if (!conversion) throw new Error("Expected Hu Tao's Paramita Papilio action to declare a capped conversion")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.hu-tao.capped-hp-to-attack",
      characterId: "HuTao",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, burst: 10, normal: 10, skill: 10 }
    }
    const evaluateWithHpDelta = (hp: number) =>
      evaluateDeclaredDirectScenarioAction({
        action,
        artifactStatDeltas: { hp },
        build,
        buffs: [],
        enemy,
        gameData
      })
    const uncapped = evaluateDeclaredDirectScenarioAction({ action: uncappedAction, build, buffs: [], enemy, gameData })
    const baseline = evaluateWithHpDelta(0)
    const belowCap = evaluateWithHpDelta(100)
    const furtherBelowCap = evaluateWithHpDelta(200)
    const capped = evaluateWithHpDelta(1_000_000)
    const cappedWithMoreHp = evaluateWithHpDelta(2_000_000)
    const baselineConversion = baseline.stats.flatAttack - uncapped.stats.flatAttack
    const belowCapConversion = belowCap.stats.flatAttack - uncapped.stats.flatAttack
    const furtherBelowCapConversion = furtherBelowCap.stats.flatAttack - uncapped.stats.flatAttack
    const cappedConversion = capped.stats.flatAttack - uncapped.stats.flatAttack

    expect(belowCapConversion - baselineConversion).toBeCloseTo(100 * 0.06256)
    expect(furtherBelowCapConversion - belowCapConversion).toBeCloseTo(100 * 0.06256)
    expect(cappedConversion).toBeCloseTo(capped.stats.baseAttack * 4)
    expect(cappedWithMoreHp.stats.flatAttack).toBeCloseTo(capped.stats.flatAttack)
    expect(belowCap.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(capped.result.expectedDamage).toBeGreaterThan(furtherBelowCap.result.expectedDamage)
    expect(capped.rotation.dpr).toBeCloseTo(capped.result.expectedDamage)
  })

  it("resolves Yelan and Albedo from reviewed health and defense talent parameters", () => {
    const yelan = evaluateDeclaredDirectScenarioAction({
      action: requireAction("yelan.skill.lingering_lifeline.explosion"),
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.yelan.skill",
        characterId: "Yelan",
        talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
      },
      buffs: [],
      enemy,
      gameData
    })
    const albedo = evaluateDeclaredDirectScenarioAction({
      action: requireAction("albedo.skill.transient_blossom"),
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.albedo.skill",
        characterId: "Albedo",
        talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
      },
      buffs: [],
      enemy,
      gameData
    })

    expect(yelan.parts).toEqual([{ coefficient: 0.407045, id: "lingering-lifeline-explosion" }])
    expect(yelan.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(yelan.rotation.dpr).toBeCloseTo(yelan.result.expectedDamage)
    expect(albedo.parts).toEqual([{ coefficient: 2.4048, id: "transient-blossom" }])
    expect(albedo.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "defense" })
    expect(albedo.rotation.dpr).toBeCloseTo(albedo.result.expectedDamage)
  })

  it("resolves Yelan's C0 Exquisite Throw as one three-projectile burst wave", () => {
    const action = requireAction("yelan.burst.exquisite_throw.single_wave")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.yelan.burst.exquisite-throw",
      characterId: "Yelan",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, burst: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { hp: 1000 },
      build,
      buffs: [],
      enemy,
      gameData
    })

    expect(baseline.parts).toEqual([{ coefficient: 0.087696, id: "exquisite-throw" }])
    expect(baseline.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(baseline.rotation.events).toMatchObject([{ hitCount: 3, id: expect.stringContaining("exquisite-throw") }])
    expect(baseline.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ hitCount: 3, kind: "hit_count" })])
    )
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage * 3)
    expect(buffed.rotation.dpr).toBeGreaterThan(baseline.rotation.dpr)
  })

  it("resolves Furina's Ousia Crabaletta hit from its selected HP-consumption count", () => {
    const action = requireAction("furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.furina.skill.crabaletta",
      characterId: "Furina",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const noConsumption = evaluateDeclaredDirectScenarioAction({
      action,
      actionParameters: { "hp-consumption-participant-count": 0 },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const fullConsumption = evaluateDeclaredDirectScenarioAction({
      action,
      build,
      buffs: [],
      enemy,
      gameData
    })

    expect(fullConsumption.parts).toEqual([{ coefficient: 0.149184, id: "mademoiselle-crabaletta" }])
    expect(fullConsumption.stats.actionParameters).toEqual({ "hp-consumption-participant-count": 4 })
    expect(fullConsumption.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(fullConsumption.rotation.dpr).toBeCloseTo(noConsumption.rotation.dpr * 1.4)
  })

  it("resolves Neuvillette's Equitable Judgment tick from the selected C0 stack count", () => {
    const action = requireAction("neuvillette.normal.charged_attack.equitable_judgment.single_tick")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.neuvillette.charged-attack.equitable-judgment",
      characterId: "Neuvillette",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const noStacks = evaluateDeclaredDirectScenarioAction({
      action,
      actionParameters: { "past-draconic-glories-stack-count": 0 },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const fullStacks = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const fullStacksWithoutA4 = evaluateDeclaredDirectScenarioAction({
      action: { ...action, intrinsicEffects: [] },
      build,
      buffs: [],
      enemy,
      gameData
    })
    const preA4FullStacks = evaluateDeclaredDirectScenarioAction({
      action,
      build: { ...build, ascension: 3 },
      buffs: [],
      enemy,
      gameData
    })
    const preA4FullStacksWithoutA4 = evaluateDeclaredDirectScenarioAction({
      action: { ...action, intrinsicEffects: [] },
      build: { ...build, ascension: 3 },
      buffs: [],
      enemy,
      gameData
    })

    expect(fullStacks.parts).toEqual([{ coefficient: 0.14467, id: "equitable-judgment-tick" }])
    expect(fullStacks.stats.actionParameters).toEqual({ "past-draconic-glories-stack-count": 3 })
    expect(fullStacks.result.trace[0]?.formula).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(fullStacks.rotation.dpr).toBeCloseTo(noStacks.rotation.dpr * 1.6)
    expect(fullStacks.stats.damageBonus).toBeCloseTo(fullStacksWithoutA4.stats.damageBonus + 0.3)
    expect(fullStacks.rotation.dpr).toBeCloseTo(fullStacksWithoutA4.rotation.dpr * 1.3)
    expect(preA4FullStacks.stats.damageBonus).toBeCloseTo(preA4FullStacksWithoutA4.stats.damageBonus)
    expect(preA4FullStacks.rotation.dpr).toBeCloseTo(preA4FullStacksWithoutA4.rotation.dpr)
  })

  it("resolves Ganyu's C0 level-two Frostflake Arrow as separate arrow and bloom events without reaction", () => {
    const action = requireAction("ganyu.normal.frostflake_arrow.level_two.hit_and_bloom")
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.ganyu.frostflake-arrow",
        characterId: "Ganyu",
        constellation: 0,
        talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
      },
      buffs: [],
      enemy,
      gameData
    })

    expect(evaluation.parts).toEqual([
      { coefficient: 2.304, id: "frostflake-arrow-hit" },
      { coefficient: 3.9168, id: "frostflake-arrow-bloom" }
    ])
    expect(evaluation.rotation.events).toHaveLength(2)
    expect(
      evaluation.rotation.events.every((event) =>
        event.trace.every((entry) => entry.kind !== "amplifying_reaction" && entry.kind !== "additive_reaction")
      )
    ).toBe(true)
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
  })

  it("resolves Mualani's full-stack Sharky's Surging Bite as Hydro or Pyro-aura Vaporize by scenario", () => {
    const action = requireAction("mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum")
    const createBuild = (setId: string) => ({
      ...raidenNationalBuiltinBuild,
      artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId })),
      buildId: `test.mualani.full-sharkys-surging-bite.${setId.toLowerCase()}`,
      characterId: "Mualani",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    })
    const build = createBuild("TestNoArtifactSet")
    const hydro = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const vaporize = evaluateDeclaredDirectScenarioAction({
      action,
      build,
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
    })
    const crimsonWitchVaporize = evaluateDeclaredDirectScenarioAction({
      action,
      build: createBuild("CrimsonWitchOfFlames"),
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
    })
    const crimsonWitchHydro = evaluateDeclaredDirectScenarioAction({
      action,
      build: createBuild("CrimsonWitchOfFlames"),
      buffs: [],
      enemy,
      gameData
    })
    const crimsonWitchReaction = crimsonWitchVaporize.rotation.events[0]?.trace.find(
      (entry) => entry.kind === "amplifying_reaction"
    )

    expect(hydro.parts).toEqual([{ coefficient: 0.15624, id: "sharkys-surging-bite" }])
    expect(hydro.stats.actionParameters).toEqual({ "wave-momentum-stack-count": 3 })
    expect(hydro.rotation.events[0]?.trace.some((entry) => entry.kind === "amplifying_reaction")).toBe(false)
    expect(vaporize.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "amplifying_reaction", reaction: "vaporize_forward" })])
    )
    expect(vaporize.rotation.dpr).toBeCloseTo(hydro.rotation.dpr * 2)
    expect(crimsonWitchVaporize.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
          target: "amplifyingReactionBonus",
          value: 0.15
        })
      ])
    )
    expect(crimsonWitchHydro.appliedEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus" })
      ])
    )
    expect(crimsonWitchReaction).toMatchObject({ bonus: 0.15, reaction: "vaporize_forward" })
    expect(
      crimsonWitchReaction?.kind === "amplifying_reaction" ? crimsonWitchReaction.multiplier : undefined
    ).toBeCloseTo(2.3)
    expect(crimsonWitchVaporize.rotation.dpr).toBeGreaterThan(vaporize.rotation.dpr)
  })

  it("keeps Dehya's attack and health coefficients inside one burst hit", () => {
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action: requireAction("dehya.burst.flame_manes_fist"),
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.dehya.burst.flame-manes-fist",
        characterId: "Dehya",
        constellation: 0,
        talents: { ...raidenNationalBuiltinBuild.talents, burst: 10 },
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
      },
      buffs: [],
      enemy,
      gameData
    })

    expect(evaluation.parts).toEqual([
      {
        id: "flame-manes-fist",
        terms: [
          { coefficient: 1.7766, stat: "attack" },
          { coefficient: 0.030456, stat: "hp" }
        ]
      }
    ])
    expect(evaluation.stats.talentMultiplier).toBeNull()
    expect(evaluation.stats.scalingTerms).toEqual([
      { coefficient: 1.7766, stat: "attack" },
      { coefficient: 0.030456, stat: "hp" }
    ])
    expect(evaluation.result.trace[0]?.formula).toMatchObject({ kind: "scaling_terms" })
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.rotation.events[0]?.trace[0]).toMatchObject({ kind: "scaling_terms" })
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
  })

  it("multiplies a declared secondary talent coefficient into one mixed-scaling term", () => {
    const action = {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [
        {
          id: "mixed-hit",
          scalingTerms: [
            { coefficientParameterId: "normal-hit-ratio", stat: "attack" },
            {
              coefficientMultiplierParameterId: "burst-conversion-ratio",
              coefficientParameterId: "normal-hit-ratio",
              stat: "defense"
            }
          ]
        }
      ],
      element: "pyro",
      evaluator: "declared_direct",
      id: "test.bennett.mixed-scaling-coefficient-product",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-hit-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "burst-conversion-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    } as unknown as CombatActionMetadata
    const build = {
      ...bennettNationalBuiltinBuild,
      talents: { ...bennettNationalBuiltinBuild.talents, burst: 10, normal: 10 }
    }
    const normalRatio = gameData.getCharacterSkillParameter("Bennett", "auto", 0, build.talents.normal)
    const burstConversion = gameData.getCharacterSkillParameter("Bennett", "burst", 1, build.talents.burst)
    if (normalRatio === undefined || burstConversion === undefined) {
      throw new Error("Expected Bennett's normal and burst coefficients in the pinned snapshot")
    }

    const evaluation = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })

    expect(evaluation.parts).toEqual([
      {
        id: "mixed-hit",
        terms: [
          { coefficient: normalRatio, stat: "attack" },
          { coefficient: normalRatio * burstConversion, stat: "defense" }
        ]
      }
    ])
  })

  it("evaluates Itto's selected Arataki Kesagiri chain and final slash without hit falloff", () => {
    const action = requireAction("arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.arataki-itto.arataki-kesagiri",
      characterId: "AratakiItto",
      constellation: 0,
      label: "Arataki Itto Arataki Kesagiri fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }

    const evaluation = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })

    expect(evaluation.parts).toEqual([
      {
        id: "arataki-kesagiri-chain",
        terms: [
          { coefficient: 1.802, stat: "attack" },
          { coefficient: 1.8683136, stat: "defense" },
          { coefficient: 0.35, stat: "defense" }
        ]
      },
      {
        id: "arataki-kesagiri-final",
        terms: [
          { coefficient: 3.774, stat: "attack" },
          { coefficient: 3.9128832, stat: "defense" },
          { coefficient: 0.35, stat: "defense" }
        ]
      }
    ])
    expect(evaluation.rotation.events.map((event) => event.hitCount)).toEqual([4, 1])
    expect(evaluation.stats.actionParameters).toEqual({ "arataki-kesagiri-chain-hit-count": 4 })
  })

  it("applies Itto's C6 Crit DMG only to the declared Arataki Kesagiri action", () => {
    const kesagiri = requireAction("arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final")
    const normalAttack = requireAction("arataki_itto.normal.auto.first_hit")
    const c0Build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.arataki-itto.c0",
      characterId: "AratakiItto",
      constellation: 0,
      label: "Arataki Itto C0 fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const c6Build = { ...c0Build, buildId: "test.arataki-itto.c6", constellation: 6 }
    const c0 = evaluateDeclaredDirectScenarioAction({ action: kesagiri, build: c0Build, buffs: [], enemy, gameData })
    const c6 = evaluateDeclaredDirectScenarioAction({ action: kesagiri, build: c6Build, buffs: [], enemy, gameData })
    const unrelatedC6 = evaluateDeclaredDirectScenarioAction({
      action: normalAttack,
      build: c6Build,
      buffs: [],
      enemy,
      gameData
    })

    expect(c6.stats.critDamage).toBeCloseTo(c0.stats.critDamage + 0.7)
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "arataki_itto.constellation.6.arataki_kesagiri.crit_damage",
          target: "critDamage",
          value: 0.7
        })
      ])
    )
    expect(unrelatedC6.stats.critDamage).toBeCloseTo(c0.stats.critDamage)
  })

  it("applies Klee's explicitly pre-existing C2 target defense reduction only after it is selected", () => {
    const action = requireAction("klee.normal.charged_attack.single_hit")
    const c0Build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.klee.c0",
      characterId: "Klee",
      constellation: 0,
      label: "Klee C0 fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const c2Build = { ...c0Build, buildId: "test.klee.c2", constellation: 2 }
    const c2EffectId = "klee.constellation.2.sparkling_burst.enemy_defense_reduction"
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build: c2Build, buffs: [], enemy, gameData })

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds: [c2EffectId],
        build: c0Build,
        buffs: [],
        enemy,
        gameData
      })
    ).toThrow(`Active effect ${c2EffectId} requires Klee constellation 2`)

    const debuffed = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [c2EffectId],
      build: c2Build,
      buffs: [],
      enemy,
      gameData
    })
    const defenseTrace = debuffed.rotation.events[0]?.trace.find((entry) => entry.kind === "defense")

    expect(debuffed.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: c2EffectId, target: "enemyDefenseReduction", value: 0.23 })
      ])
    )
    expect(defenseTrace).toMatchObject({ defenseReduction: 0.23, kind: "defense" })
    expect(debuffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
  })

  it("applies Yae Miko's C6 defense ignore only to the declared level-three Sesshou Sakura bolt", () => {
    const sesshouSakura = requireAction("yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt")
    const normalAttack = requireAction("yae_miko.normal.auto.first_hit")
    const c0Build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.yae-miko.c0",
      characterId: "YaeMiko",
      constellation: 0,
      label: "Yae Miko C0 fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const c3Build = { ...c0Build, buildId: "test.yae-miko.c3", constellation: 3 }
    const c6Build = { ...c0Build, buildId: "test.yae-miko.c6", constellation: 6 }
    const c0 = evaluateDeclaredDirectScenarioAction({ action: sesshouSakura, build: c0Build, buffs: [], enemy, gameData })
    const c3 = evaluateDeclaredDirectScenarioAction({ action: sesshouSakura, build: c3Build, buffs: [], enemy, gameData })
    const c6 = evaluateDeclaredDirectScenarioAction({ action: sesshouSakura, build: c6Build, buffs: [], enemy, gameData })
    const unrelatedC6 = evaluateDeclaredDirectScenarioAction({
      action: normalAttack,
      build: c6Build,
      buffs: [],
      enemy,
      gameData
    })
    const c6Defense = c6.rotation.events[0]?.trace.find((entry) => entry.kind === "defense")
    const unrelatedDefense = unrelatedC6.rotation.events[0]?.trace.find((entry) => entry.kind === "defense")

    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
          target: "enemyDefenseIgnore",
          value: 0.6
        })
      ])
    )
    expect(c6Defense).toMatchObject({ defenseIgnore: 0.6, kind: "defense" })
    expect(unrelatedDefense).toMatchObject({ defenseIgnore: 0, kind: "defense" })
    expect(c6.result.expectedDamage).toBeGreaterThan(c3.result.expectedDamage)
    expect(c3.result.expectedDamage).toBeGreaterThan(c0.result.expectedDamage)
  })

  it("evaluates Noelle's C0 Sweeping Time four-hit normal combo from attack and defense terms", () => {
    const action = requireAction("noelle.burst.sweeping_time.normal_attack_combo")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.noelle.sweeping-time-normal-combo",
      characterId: "Noelle",
      constellation: 0,
      label: "Noelle Sweeping Time fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }

    const evaluation = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })

    expect(evaluation.parts).toMatchObject([
      {
        id: "sweeping-time-normal-hit-one",
        terms: [
          { coefficient: 1.564, stat: "attack" },
          { coefficient: 1.12608, stat: "defense" }
        ]
      },
      {
        id: "sweeping-time-normal-hit-two",
        terms: [
          { coefficient: 1.4501, stat: "attack" },
          { coefficient: 1.044072, stat: "defense" }
        ]
      },
      {
        id: "sweeping-time-normal-hit-three",
        terms: [
          { coefficient: 1.7051, stat: "attack" },
          { coefficient: 1.227672, stat: "defense" }
        ]
      },
      {
        id: "sweeping-time-normal-hit-four",
        terms: [
          { coefficient: 2.2423, stat: "attack" },
          { coefficient: expect.any(Number), stat: "defense" }
        ]
      }
    ])
    const finalHit = evaluation.parts[3]
    if (!finalHit || finalHit.terms === undefined) throw new Error("Expected Noelle's fourth Sweeping Time hit")
    expect(finalHit.terms[1]?.coefficient).toBeCloseTo(1.614456)
    expect(evaluation.rotation.events.map((event) => event.hitCount)).toEqual([1, 1, 1, 1])
  })

  it("derives scenario reactions from registered elemental applications instead of action-specific reaction presets", () => {
    const fixtures = [
      {
        actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
        aura: { element: "quicken" as const, id: "target.quicken" },
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.scenario.nahida",
          characterId: "Nahida" as const,
          constellation: 0,
          label: "Scenario reaction fixture",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" as const }
        },
        reaction: "spread" as const,
        traceKind: "additive_reaction" as const
      },
      {
        actionId: "klee.normal.charged_attack.single_hit",
        aura: { element: "hydro" as const, id: "target.hydro" },
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.scenario.klee",
          characterId: "Klee" as const,
          constellation: 0,
          label: "Scenario reaction fixture",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" as const }
        },
        reaction: "vaporize_reverse" as const,
        traceKind: "amplifying_reaction" as const
      },
      {
        actionId: "keqing.skill.stellar_restoration.stiletto_damage",
        aura: { element: "quicken" as const, id: "target.quicken" },
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.scenario.keqing",
          characterId: "Keqing" as const,
          constellation: 0,
          label: "Scenario reaction fixture",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" as const }
        },
        reaction: "aggravate" as const,
        traceKind: "additive_reaction" as const
      }
    ] as const

    for (const fixture of fixtures) {
      const action = requireAction(fixture.actionId)
      const baseline = evaluateDeclaredDirectScenarioAction({ action, build: fixture.build, buffs: [], enemy, gameData })
      const reacted = evaluateDeclaredDirectScenarioAction({
        action,
        build: fixture.build,
        buffs: [],
        enemy,
        gameData,
        rotationAuras: [{ ...fixture.aura, end: 1, start: 0 }]
      })

      expect(baseline.rotation.events).toHaveLength(1)
      expect(baseline.rotation.events[0]?.trace.some((entry) => entry.kind === fixture.traceKind)).toBe(false)
      expect(reacted.rotation.events[0]?.trace).toEqual(
        expect.arrayContaining([expect.objectContaining({ kind: fixture.traceKind, reaction: fixture.reaction })])
      )
      expect(reacted.rotation.dpr).toBeGreaterThan(baseline.rotation.dpr)
    }
  })

  it("resolves Xiangling's Hydro-aura Vaporize Pyronado and applies elemental-mastery gains", () => {
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { atk_percent: 0.05, crit_rate: 0.033, elemental_mastery: 100 },
      build: xianglingNationalBuiltinBuild,
      buffs: [{ label: "测试攻击力", sourceId: "test.attack", stat: "attack_flat", value: 100 }],
      enemy,
      gameData
    })

    expect(baseline.parts).toEqual([{ coefficient: 2.38, id: "pyronado-tick" }])
    expect(baseline.result.trace.map((entry) => entry.stage)).toContain("amplifying_reaction")
    const reactionFormula = baseline.result.trace[2]?.formula
    expect(reactionFormula).toMatchObject({
      kind: "amplifying_reaction",
      reaction: "vaporize_reverse"
    })
    if (reactionFormula?.kind !== "amplifying_reaction") throw new Error("Expected an amplifying reaction formula")
    expect(reactionFormula.multiplier).toBeCloseTo(
      1.5 * (1 + (2.78 * baseline.stats.elementalMastery) / (baseline.stats.elementalMastery + 1400))
    )
    expect(buffed.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent + 0.05)
    expect(buffed.stats.critRate).toBeCloseTo(baseline.stats.critRate + 0.033)
    expect(buffed.stats.elementalMastery).toBeCloseTo(baseline.stats.elementalMastery + 100)
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage)
  })

  it("applies Ballad of the Fjords only when the configured party has three distinct elements", () => {
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const r1Build = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xiangling.ballad-of-the-fjords.r1",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "BalladOfTheFjords" }
    }
    const twoElements = evaluateDeclaredDirectScenarioAction({
      action,
      build: r1Build,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    })
    const threeElements = evaluateDeclaredDirectScenarioAction({
      action,
      build: r1Build,
      buffs: [],
      enemy,
      gameData,
      teammates: [raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    })
    const r5 = evaluateDeclaredDirectScenarioAction({
      action,
      build: {
        ...r1Build,
        buildId: "test.xiangling.ballad-of-the-fjords.r5",
        weapon: { ...r1Build.weapon, refinement: 5 }
      },
      buffs: [],
      enemy,
      gameData,
      teammates: [raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    })

    expect(twoElements.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.ballad-of-the-fjords.team-elemental-mastery" })])
    )
    expect(threeElements.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
          target: "elementalMastery",
          value: 120
        })
      ])
    )
    expect(threeElements.stats.elementalMastery).toBeCloseTo(twoElements.stats.elementalMastery + 120)
    expect(threeElements.result.expectedDamage).toBeGreaterThan(twoElements.result.expectedDamage)
    expect(r5.stats.elementalMastery).toBeCloseTo(twoElements.stats.elementalMastery + 240)
  })

  it("applies Astral Vulture's Crimson Plumage at the one- or two-different-element teammate tier", () => {
    const ganyu = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.ganyu.astral-vultures-crimson-plumage",
      characterId: "Ganyu",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "AstralVulturesCrimsonPlumage" }
    }
    const yelan = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.yelan.astral-vultures-crimson-plumage",
      characterId: "Yelan",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "AstralVulturesCrimsonPlumage" }
    }
    const chargedAction = requireAction("ganyu.normal.frostflake_arrow.level_two.hit_and_bloom")
    const burstAction = requireAction("yelan.burst.exquisite_throw.single_wave")
    const baselineCharged = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      build: ganyu,
      buffs: [],
      enemy,
      gameData
    })
    const oneDifferentCharged = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      build: ganyu,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild]
    })
    const twoDifferentCharged = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      build: ganyu,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    })
    const baselineBurst = evaluateDeclaredDirectScenarioAction({
      action: burstAction,
      build: yelan,
      buffs: [],
      enemy,
      gameData
    })
    const oneDifferentBurst = evaluateDeclaredDirectScenarioAction({
      action: burstAction,
      build: yelan,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild]
    })
    const twoDifferentBurst = evaluateDeclaredDirectScenarioAction({
      action: burstAction,
      build: yelan,
      buffs: [],
      enemy,
      gameData,
      teammates: [bennettNationalBuiltinBuild, raidenNationalBuiltinBuild]
    })

    expect(oneDifferentCharged.stats.damageBonus).toBeCloseTo(baselineCharged.stats.damageBonus + 0.4)
    expect(twoDifferentCharged.stats.damageBonus).toBeCloseTo(baselineCharged.stats.damageBonus + 0.96)
    expect(oneDifferentBurst.stats.damageBonus).toBeCloseTo(baselineBurst.stats.damageBonus + 0.2)
    expect(twoDifferentBurst.stats.damageBonus).toBeCloseTo(baselineBurst.stats.damageBonus + 0.48)
    expect(twoDifferentCharged.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.charged-damage-bonus",
          value: 0.96
        })
      ])
    )
    expect(twoDifferentBurst.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.burst-damage-bonus",
          value: 0.48
        })
      ])
    )
  })

  it("carries Instructor elemental-mastery effects through the reaction damage pipeline", () => {
    const action = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const noSetBuild = {
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
      buildId: "test.xiangling.no-artifact-set"
    }
    const instructorBuild = {
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "Instructor" })),
      buildId: "test.xiangling.instructor"
    }
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build: noSetBuild, buffs: [], enemy, gameData })
    const automatic = evaluateDeclaredDirectScenarioAction({ action, build: instructorBuild, buffs: [], enemy, gameData })
    const active = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: ["artifact.instructor.4pc.after-reaction.party-elemental-mastery"],
      build: instructorBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(automatic.stats.elementalMastery).toBeCloseTo(baseline.stats.elementalMastery + 80)
    expect(active.stats.elementalMastery).toBeCloseTo(baseline.stats.elementalMastery + 200)
    expect(active.result.expectedDamage).toBeGreaterThan(automatic.result.expectedDamage)
    expect(active.rotation.dpr).toBeCloseTo(active.result.expectedDamage)
  })

  it("resolves Collei's outbound Floral Sidewinder under a Spread assumption", () => {
    const action = requireAction("collei.skill.floral_sidewinder.outbound.spread")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.collei.skill.floral-sidewinder-outbound",
      characterId: "Collei",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build,
      buffs: [],
      enemy,
      gameData
    })

    expect(baseline.parts).toEqual([{ coefficient: 2.7216, id: "floral-sidewinder-outbound" }])
    expect(baseline.result.trace.map((entry) => entry.stage)).toContain("additive_reaction")
    expect(baseline.result.trace.find((entry) => entry.stage === "additive_reaction")?.formula).toMatchObject({
      kind: "additive_reaction",
      reaction: "spread"
    })
    expect(baseline.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "additive_reaction", reaction: "spread" })])
    )
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage)
  })

  it("resolves Tighnari's one Wreath Arrow hit under a Spread assumption", () => {
    const action = requireAction("tighnari.normal.wreath_arrow.single_hit.spread")
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.tighnari.normal.wreath-arrow",
      characterId: "Tighnari",
      constellation: 0,
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build,
      buffs: [],
      enemy,
      gameData
    })

    expect(baseline.parts).toEqual([{ coefficient: 1.5696, id: "wreath-arrow" }])
    expect(baseline.result.trace.map((entry) => entry.stage)).toContain("additive_reaction")
    expect(baseline.result.trace.find((entry) => entry.stage === "additive_reaction")?.formula).toMatchObject({
      kind: "additive_reaction",
      reaction: "spread"
    })
    expect(baseline.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "additive_reaction", reaction: "spread" })])
    )
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage)
  })

  it("combines Xingqiu's C6-inherited C5 skill hits for the single-target expected-damage report", () => {
    const action = requireAction("xingqiu.skill.fatal_rainscreen")
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(evaluation.parts).toEqual([
      { coefficient: 3.36, id: "first-hit" },
      { coefficient: 3.824, id: "second-hit" }
    ])
    expect(evaluation.stats.talentMultiplier).toBeCloseTo(7.184)
    expect(evaluation.rotation.events).toHaveLength(2)
    expect(evaluation.rotation.events.every((event) => event.ownerId === xingqiuNationalBuiltinBuild.buildId)).toBe(true)
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
  })

  it("resolves Xingqiu's C6-inherited C5 Fatal Rainscreen hits under the declared double Pyro-aura Vaporize setup", () => {
    const action = requireAction("xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize")
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const buffed = evaluateDeclaredDirectScenarioAction({
      action,
      artifactStatDeltas: { elemental_mastery: 100 },
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(baseline.parts).toEqual([
      { coefficient: 3.36, id: "first-hit" },
      { coefficient: 3.824, id: "second-hit" }
    ])
    expect(baseline.result.trace.find((entry) => entry.stage === "amplifying_reaction")?.formula).toMatchObject({
      baseMultiplier: 2,
      reaction: "vaporize_forward"
    })
    expect(baseline.rotation.events).toHaveLength(2)
    expect(baseline.rotation.events.map((event) => event.trace.find((entry) => entry.kind === "amplifying_reaction"))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ baseMultiplier: 2, reaction: "vaporize_forward" }),
        expect.objectContaining({ baseMultiplier: 2, reaction: "vaporize_forward" })
      ])
    )
    expect(buffed.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(baseline.rotation.dpr).toBeCloseTo(baseline.result.expectedDamage)
  })

  it("compiles an explicit damage-event timeline with independent hit and snapshot times", () => {
    const action = {
      ...requireAction("xingqiu.skill.fatal_rainscreen"),
      timeline: {
        damageEvents: [
          { at: 0, damagePartId: "first-hit", id: "first-hit", snapshot: "cast" },
          { at: 0.35, damagePartId: "second-hit", id: "second-hit", snapshot: "hit" }
        ],
        duration: 0.7
      }
    } satisfies CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const rotationEffects: readonly RotationEffectWindow[] = [
      {
        end: 0.7,
        id: "test.late-damage-bonus",
        ownerId: xingqiuNationalBuiltinBuild.buildId,
        start: 0.1,
        stats: { damageBonus: 0.5 }
      }
    ]
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      rotationEffects
    })

    expect(evaluation.rotation.duration).toBe(0.7)
    expect(evaluation.rotation.events.map((event) => ({ snapshot: event.statSnapshotTime, time: event.time }))).toEqual([
      { snapshot: 0, time: 0 },
      { snapshot: 0.35, time: 0.35 }
    ])
    expect(evaluation.rotation.events.map((event) => event.appliedEffectIds)).toEqual([[], ["test.late-damage-bonus"]])
    expect(evaluation.rotation.events[0]?.expectedDamage).toBeCloseTo(baseline.rotation.events[0]?.expectedDamage ?? 0)
    expect(evaluation.rotation.events[1]?.expectedDamage).toBeGreaterThan(baseline.rotation.events[1]?.expectedDamage ?? 0)
    expect(evaluation.rotation.dps).toBeCloseTo(evaluation.rotation.dpr / 0.7)
  })

  it("uses an explicit action-relative snapshot time even when the hit occurs after that effect expires", () => {
    const action = {
      ...requireAction("xingqiu.skill.fatal_rainscreen"),
      timeline: {
        damageEvents: [
          {
            at: 0.7,
            damagePartId: "first-hit",
            id: "delayed-hit",
            snapshot: "time",
            snapshotAt: 0.4
          }
        ],
        duration: 0.8
      }
    } as unknown as CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: xingqiuNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      rotationEffects: [
        {
          end: 0.5,
          id: "test.precise-snapshot-damage-bonus",
          ownerId: xingqiuNationalBuiltinBuild.buildId,
          start: 0.25,
          stats: { damageBonus: 0.5 }
        }
      ]
    })

    expect(evaluation.rotation.events[0]).toMatchObject({ statSnapshotTime: 0.4, time: 0.7 })
    expect(evaluation.rotation.events[0]?.appliedEffectIds).toEqual(["test.precise-snapshot-damage-bonus"])
    expect(evaluation.rotation.events[0]?.expectedDamage).toBeGreaterThan(baseline.rotation.events[0]?.expectedDamage ?? 0)
  })

  it("derives reactions from a sustained aura for individual declared timeline events", () => {
    const action = {
      ...requireAction("bennett.burst.initial_hit"),
      element: "pyro",
      id: "test.bennett.pyro-timeline",
      timeline: {
        damageEvents: [0, 0.2, 0.4, 0.6].map((at, index) => ({
          at,
          damagePartId: "initial-hit",
          elementalApplication: { icd: { groupId: "test.bennett.pyro", kind: "standard" } },
          id: `hit-${index + 1}`,
          snapshot: "hit"
        })),
        duration: 1
      }
    } as unknown as CombatActionMetadata
    const evaluation = evaluateDeclaredDirectScenarioAction({
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
    } as never)

    expect(evaluation.rotation.events.map((event) => event.elementalApplication?.reaction ?? "normal")).toEqual([
      "vaporize_reverse",
      "normal",
      "normal",
      "vaporize_reverse"
    ])
  })

  it("does not expose Crimson Witch's reaction effect when standard ICD prevents every configured aura reaction", () => {
    const crimsonWitchEffectId = "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"
    const action = {
      ...requireAction("bennett.burst.initial_hit"),
      element: "pyro",
      id: "test.bennett.pyro-timeline-crimson-witch",
      timeline: {
        damageEvents: [0, 0.2, 0.4, 0.6].map((at, index) => ({
          at,
          damagePartId: "initial-hit",
          elementalApplication: { icd: { groupId: "test.bennett.pyro.crimson-witch", kind: "standard" } },
          id: `hit-${index + 1}`,
          snapshot: "hit"
        })),
        duration: 1
      }
    } as unknown as CombatActionMetadata
    const build = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "CrimsonWitchOfFlames" })),
      buildId: "test.bennett.crimson-witch-standard-icd"
    }
    const electroAura = evaluateDeclaredDirectScenarioAction({
      action,
      build,
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "quicken", end: 0.5, id: "target.quicken", start: 0.1 }]
    } as never)
    const hydroAura = evaluateDeclaredDirectScenarioAction({
      action,
      build,
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "hydro", end: 0.5, id: "target.hydro", start: 0.1 }]
    } as never)

    expect(electroAura.rotation.events.map((event) => event.elementalApplication?.reaction)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ])
    expect(electroAura.appliedEffects.map((effect) => effect.id)).not.toContain(crimsonWitchEffectId)
    expect(hydroAura.rotation.events.map((event) => event.elementalApplication?.reaction)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ])
    expect(hydroAura.appliedEffects.map((effect) => effect.id)).not.toContain(crimsonWitchEffectId)
  })

  it("preserves an explicit stat snapshot while a tagged normal attack becomes Pyro at hit time", () => {
    const action = {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [{ coefficientParameterId: "first-hit-multiplier", id: "first-hit" }],
      element: "physical",
      evaluator: "declared_direct",
      id: "test.bennett.infused-normal",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0.7,
            damagePartId: "first-hit",
            elementalApplication: {
              activation: "while_element_overridden",
              icd: { kind: "none" }
            },
            elementOverrideTarget: "normal_attack",
            id: "infused-hit",
            snapshot: "time",
            snapshotAt: 0.4
          }
        ],
        duration: 0.8
      }
    } as unknown as CombatActionMetadata
    const input = {
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      rotationAuras: [{ element: "hydro", end: 0.8, id: "target.hydro", start: 0 }],
      rotationEffects: [
        {
          end: 0.5,
          id: "test.snapshot-attack",
          ownerId: bennettNationalBuiltinBuild.buildId,
          start: 0.2,
          stats: { attack: 1000 }
        }
      ],
      rotationElementOverrides: [
        {
          element: "pyro",
          end: 0.8,
          id: "test.pyro-infusion",
          ownerId: bennettNationalBuiltinBuild.buildId,
          start: 0.6,
          target: "normal_attack"
        }
      ]
    } as unknown as DeclaredDirectScenarioInput

    const evaluation = evaluateDeclaredDirectScenarioAction(input)
    const event = evaluation.rotation.events[0]

    expect(event).toMatchObject({
      appliedEffectIds: ["test.snapshot-attack"],
      element: "pyro",
      elementOverride: { baseElement: "physical", element: "pyro", id: "test.pyro-infusion" },
      elementalApplication: { applied: true, reaction: "vaporize_reverse" },
      statSnapshotTime: 0.4,
      time: 0.7
    })
  })

  it("resolves bounded action parameters into declared event hit counts and coefficient multipliers", () => {
    const action = {
      ...requireAction("bennett.burst.initial_hit"),
      id: "test.bennett.parameterized-hit",
      scenarioParameters: [
        {
          allowedValues: [1, 3],
          defaultValue: 1,
          id: "hit-count",
          label: "命中次数",
          maximumValue: 3,
          minimumValue: 1
        }
      ],
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "hit-count",
              values: [
                { multiplier: 1, parameterValue: 1 },
                { multiplier: 1.1, parameterValue: 2 },
                { multiplier: 1.2, parameterValue: 3 }
              ]
            },
            damagePartId: "initial-hit",
            hitCount: { kind: "scenario_parameter", parameterId: "hit-count" },
            id: "parameterized-hit",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    } as unknown as CombatActionMetadata
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const configured = evaluateDeclaredDirectScenarioAction({
      action,
      actionParameters: { "hit-count": 3 },
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(configured.stats.actionParameters).toEqual({ "hit-count": 3 })
    expect(configured.rotation.events[0]).toMatchObject({ hitCount: 3 })
    expect(configured.rotation.dpr).toBeCloseTo((baseline.rotation.dpr * 3 * 1.2) / 1)
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        actionParameters: { "hit-count": 2 },
        build: bennettNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData
      })
    ).toThrow("allowed")
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        actionParameters: { "hit-count": 4 },
        build: bennettNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData
      })
    ).toThrow("hit-count")
  })

  it("does not apply a normal-attack-only team bonus to Crescent Pike's independent physical hit", () => {
    const action = requireAction("xiangling.normal.auto.first_hit")
    const build = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.crescent-pike.primary",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "CrescentPike" }
    }
    const freedomSwornTeammate = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.freedom-sworn.teammate",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FreedomSworn" }
    }
    const sharedActiveEffectIds = [
      "weapon.crescent-pike.after-particle.additional-physical-damage",
      "weapon.freedom-sworn.full-sigil.party-attack-percent"
    ]
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: sharedActiveEffectIds,
      build,
      buffs: [],
      enemy,
      gameData,
      teammates: [freedomSwornTeammate]
    })
    const fullSigil = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [
        ...sharedActiveEffectIds,
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
      ],
      build,
      buffs: [],
      enemy,
      gameData,
      teammates: [freedomSwornTeammate]
    })
    const crescentPikeEventId = "xiangling.normal.auto.first_hit.weapon.crescent-pike.after-particle.additional-physical-damage"
    const baselineCrescentPike = baseline.rotation.events.find((event) => event.id === crescentPikeEventId)
    const fullSigilCrescentPike = fullSigil.rotation.events.find((event) => event.id === crescentPikeEventId)
    const baselineNormalHit = baseline.rotation.events.find((event) => event.id !== crescentPikeEventId)
    const fullSigilNormalHit = fullSigil.rotation.events.find((event) => event.id !== crescentPikeEventId)

    expect(fullSigilCrescentPike?.element).toBe("physical")
    expect(fullSigilCrescentPike?.expectedDamage).toBeCloseTo(baselineCrescentPike?.expectedDamage ?? 0)
    expect(fullSigilCrescentPike?.trace.find((entry) => entry.kind === "damage_bonus")).toEqual(
      baselineCrescentPike?.trace.find((entry) => entry.kind === "damage_bonus")
    )
    expect(fullSigilNormalHit?.expectedDamage).toBeGreaterThan(baselineNormalHit?.expectedDamage ?? 0)
  })

  it("evaluates Alhaitham's Chisel-Light Mirror Projection Attack as one attack and elemental-mastery Spread hit", () => {
    const action = requireAction(
      "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread"
    )
    const build = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.alhaitham.chisel-light-mirror-projection-attack",
      characterId: "Alhaitham",
      constellation: 0,
      label: "Alhaitham Chisel-Light Mirror Projection Attack fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }

    const evaluation = evaluateDeclaredDirectScenarioAction({ action, build, buffs: [], enemy, gameData })

    expect(evaluation.parts).toEqual([
      {
        id: "chisel-light-mirror-projection-attack",
        terms: [
          { coefficient: 1.2096, stat: "attack" },
          { coefficient: 2.4192, stat: "elementalMastery" }
        ]
      }
    ])
    expect(evaluation.result.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ stage: "additive_reaction" })])
    )
    expect(evaluation.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "additive_reaction", reaction: "spread" })])
    )
  })

  it("uses a Peak Patrol Song holder's full two-stack defense for its selected party elemental-damage snapshot", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const peakPatrolHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xilonen.peak-patrol-song.r1",
      characterId: "Xilonen",
      label: "希诺宁 岩峰巡歌 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PeakPatrolSong" }
    }
    const partyEffectId = "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [peakPatrolHolder]
    })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [partyEffectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [peakPatrolHolder]
    })
    const effect = snapshot.appliedEffects.find((candidate) => candidate.id === partyEffectId)
    const coreStats = resolveCoreCombatStats(peakPatrolHolder, gameData)
    const fullTwoStackDefense = coreStats.defense + coreStats.baseDefense * 0.16
    const expectedDamageBonus = Math.min(fullTwoStackDefense * 0.00008, 0.256)

    expect(effect).toMatchObject({ sourceId: peakPatrolHolder.buildId, target: "damageBonus" })
    expect(effect?.value).toBeCloseTo(expectedDamageBonus)
    expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(expectedDamageBonus)
  })

  it("caps Peak Patrol Song's selected source snapshot, requires one source, and excludes physical actions", () => {
    const elementalAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const partyEffectId = "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"
    const createPeakPatrolHolder = (characterId: "Chiori" | "Xilonen", refinement: number): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
        ...artifact,
        mainStat:
          artifact.slot === "circlet" || artifact.slot === "goblet" || artifact.slot === "sands"
            ? { stat: "def_percent" as const, value: 0.583 }
            : artifact.mainStat,
        setId: "TestNoArtifactSet"
      })),
      buildId: `test.${characterId.toLowerCase()}.peak-patrol-song.r${refinement}`,
      characterId,
      label: `${characterId} 岩峰巡歌 R${refinement} 测试配置`,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement, weaponId: "PeakPatrolSong" }
    })
    const r5Xilonen = createPeakPatrolHolder("Xilonen", 5)
    const r1Chiori = createPeakPatrolHolder("Chiori", 1)
    const cappedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      activeEffectIds: [partyEffectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Xilonen]
    })
    const cappedEffect = cappedSnapshot.appliedEffects.find((effect) => effect.id === partyEffectId)
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [partyEffectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Xilonen]
    })

    expect(cappedEffect?.value).toBeCloseTo(0.512)
    expect(physicalSnapshot.appliedEffects.find((effect) => effect.id === partyEffectId)).toBeUndefined()
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: elementalAction,
        activeEffectIds: [partyEffectId],
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [r5Xilonen, r1Chiori]
      })
    ).toThrow(`Active effect ${partyEffectId} has multiple eligible source builds; select one explicitly`)

    const selectedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      activeEffectIds: [partyEffectId],
      activeEffectSourceBuildIds: { [partyEffectId]: r5Xilonen.buildId },
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Xilonen, r1Chiori]
    })
    const selectedEffects = selectedSnapshot.appliedEffects.filter((effect) => effect.id === partyEffectId)

    expect(selectedEffects).toEqual([expect.objectContaining({ sourceId: r5Xilonen.buildId, value: 0.512 })])
  })

  it("includes Peak Patrol Song's implied two-stack self effects when its holder is the current action recipient", () => {
    const action = requireAction("xilonen.skill.yohuals_scratch.dash")
    const partyEffectId = "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"
    const selfDefenseEffectId = "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent"
    const selfDamageEffectId = "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"
    const xilonen: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xilonen.peak-patrol-song.self-r1",
      characterId: "Xilonen",
      label: "希诺宁 岩峰巡歌自身满层测试配置",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PeakPatrolSong" }
    }
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build: xilonen, buffs: [], enemy, gameData })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [partyEffectId],
      build: xilonen,
      buffs: [],
      enemy,
      gameData
    })
    const partyEffect = snapshot.appliedEffects.find((effect) => effect.id === partyEffectId)

    expect(snapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: selfDefenseEffectId, target: "defensePercent", value: 0.16 }),
        expect.objectContaining({ id: selfDamageEffectId, target: "damageBonus", value: 0.2 }),
        expect.objectContaining({ id: partyEffectId, sourceId: xilonen.buildId, target: "damageBonus" })
      ])
    )
    expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.2 + (partyEffect?.value ?? 0))
  })

  it("uses an Angelos Heptades holder's final attack for its selected current-on-field damage snapshot", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const angelosHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mona.angelos-heptades.r1",
      characterId: "Mona",
      label: "莫娜 尘光七谕 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AngelosHeptades" }
    }
    const effectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [angelosHolder]
    })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [angelosHolder]
    })
    const effect = snapshot.appliedEffects.find((candidate) => candidate.id === effectId)
    const coreStats = resolveCoreCombatStats(angelosHolder, gameData)
    const finalAttack = coreStats.attack + coreStats.baseAttack * 0.12
    const expectedDamageBonus = Math.min(finalAttack * 0.0001, 0.26)

    expect(effect).toMatchObject({ sourceId: angelosHolder.buildId, target: "damageBonus" })
    expect(effect?.value).toBeCloseTo(expectedDamageBonus)
    expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(expectedDamageBonus)
    expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
  })

  it("uses half of Angelos Heptades' source-attack bonus for a selected Magic Secret off-field snapshot", () => {
    const action = requireAction("venti.skill.skyward_sonnet.press")
    const angelosHolder: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mona.angelos-heptades.magic-secret.r1",
      characterId: "Mona",
      label: "莫娜 尘光七谕魔导·秘仪 R1 测试配置",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AngelosHeptades" }
    }
    const currentOnFieldEffectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const magicSecretOffFieldEffectId =
      "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"
    const magicRecipient = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.venti.angelos-heptades.magic-secret.recipient",
      characterId: "Venti"
    }
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: magicRecipient,
      buffs: [],
      enemy,
      gameData,
      teammates: [angelosHolder]
    })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [magicSecretOffFieldEffectId],
      build: magicRecipient,
      buffs: [],
      enemy,
      gameData,
      teammates: [angelosHolder]
    })
    const effect = snapshot.appliedEffects.find((candidate) => candidate.id === magicSecretOffFieldEffectId)
    const coreStats = resolveCoreCombatStats(angelosHolder, gameData)
    const finalAttack = coreStats.attack + coreStats.baseAttack * 0.12
    const expectedDamageBonus = Math.min(finalAttack * 0.00005, 0.13)

    expect(effect).toMatchObject({ sourceId: angelosHolder.buildId, target: "damageBonus" })
    expect(effect?.value).toBeCloseTo(expectedDamageBonus)
    expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(expectedDamageBonus)
    expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds: [currentOnFieldEffectId, magicSecretOffFieldEffectId],
        build: magicRecipient,
        buffs: [],
        enemy,
        gameData,
        teammates: [angelosHolder]
      })
    ).toThrow("Selected angelos-heptades-guiding-light-recipient-position effects cannot stack")
  })

  it("lets an on-field Angelos Heptades holder receive its own selected current-on-field snapshot", () => {
    const action = requireAction("mona.normal.auto.first_hit")
    const mona: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.mona.angelos-heptades.self-r1",
      characterId: "Mona",
      label: "莫娜 尘光七谕自身 R1 测试配置",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AngelosHeptades" }
    }
    const effectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build: mona, buffs: [], enemy, gameData })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: mona,
      buffs: [],
      enemy,
      gameData
    })
    const coreStats = resolveCoreCombatStats(mona, gameData)
    const expectedDamageBonus = Math.min((coreStats.attack + coreStats.baseAttack * 0.12) * 0.0001, 0.26)

    expect(snapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: mona.buildId, target: "damageBonus", value: expectedDamageBonus })
      ])
    )
    expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(expectedDamageBonus)
  })

  it("caps Angelos Heptades' source attack snapshot and requires one selected holder", () => {
    const elementalAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const effectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const magicSecretOffFieldEffectId =
      "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"
    const createAngelosHolder = (characterId: "Lisa" | "Mona", refinement: number): CharacterBuild => ({
      ...xianglingNationalBuiltinBuild,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
        ...artifact,
        mainStat:
          artifact.slot === "circlet" || artifact.slot === "goblet" || artifact.slot === "sands"
            ? { stat: "atk_percent" as const, value: 0.466 }
            : artifact.mainStat,
        setId: "TestNoArtifactSet"
      })),
      buildId: `test.${characterId.toLowerCase()}.angelos-heptades.r${refinement}`,
      characterId,
      label: `${characterId} 尘光七谕 R${refinement} 测试配置`,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement, weaponId: "AngelosHeptades" }
    })
    const r5Mona = createAngelosHolder("Mona", 5)
    const r1Lisa = createAngelosHolder("Lisa", 1)
    const hexereiTeammate = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.venti.angelos-heptades.cap",
      characterId: "Venti"
    }
    const magicRecipient = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.venti.angelos-heptades.cap.recipient",
      characterId: "Venti"
    }
    const cappedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Mona, hexereiTeammate]
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Mona]
    })
    const magicSecretSnapshot = evaluateDeclaredDirectScenarioAction({
      action: requireAction("venti.skill.skyward_sonnet.press"),
      activeEffectIds: [magicSecretOffFieldEffectId],
      build: magicRecipient,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Mona]
    })

    expect(cappedSnapshot.appliedEffects.find((effect) => effect.id === effectId)?.value).toBeCloseTo(0.58)
    expect(physicalSnapshot.appliedEffects.find((effect) => effect.id === effectId)?.value).toBeCloseTo(0.58)
    expect(magicSecretSnapshot.appliedEffects.find((effect) => effect.id === magicSecretOffFieldEffectId)?.value).toBeCloseTo(
      0.29
    )
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: elementalAction,
        activeEffectIds: [effectId],
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [r5Mona, r1Lisa]
      })
    ).toThrow(`Active effect ${effectId} has multiple eligible source builds; select one explicitly`)

    const selectedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: r5Mona.buildId },
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [r5Mona, r1Lisa]
    })

    expect(selectedSnapshot.appliedEffects.filter((effect) => effect.id === effectId)).toEqual([
      expect.objectContaining({ sourceId: r5Mona.buildId, value: 0.58 })
    ])
  })
})
