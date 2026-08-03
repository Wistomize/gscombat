import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createCryoBuild(characterId: "Kaeya" | "Shenhe", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 申鹤 C2 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Shenhe" ? "FavoniusLance" : "FavoniusSword"
    }
  }
}

describe("Shenhe C2 current-action effect", () => {
  it("applies an explicit field snapshot to self and teammates' Cryo actions, requires C2, and inherits at C6", () => {
    const effectId = "shenhe.divine_maidens_deliverance.c2.current_character.cryo_damage_bonus"
    const shenheAction = requireAction("shenhe.skill.spring_spirit_summoning.press")
    const kaeyaCryoAction = requireAction("kaeya.skill.frostgnaw")
    const kaeyaPhysicalAction = requireAction("kaeya.normal.auto.first_hit")
    const shenheC1 = createCryoBuild("Shenhe", "test.shenhe.c1", 1)
    const shenheC2 = createCryoBuild("Shenhe", "test.shenhe.c2", 2)
    const shenheC6 = createCryoBuild("Shenhe", "test.shenhe.c6", 6)
    const kaeya = createCryoBuild("Kaeya", "test.kaeya.shenhe-c2-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: shenheAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: shenheC1.buildId },
        build: shenheC1,
        buffs: [],
        enemy,
        gameData,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Shenhe constellation 2`)

    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: shenheAction,
      build: shenheC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: shenheAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: shenheC2.buildId },
      build: shenheC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: kaeyaCryoAction,
      build: kaeya,
      buffs: [],
      enemy,
      gameData,
      teammates: [shenheC2]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: kaeyaCryoAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: shenheC2.buildId },
      build: kaeya,
      buffs: [],
      enemy,
      gameData,
      teammates: [shenheC2]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: kaeyaCryoAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: shenheC6.buildId },
      build: kaeya,
      buffs: [],
      enemy,
      gameData,
      teammates: [shenheC6]
    })
    const nonCryoBaseline = evaluateDeclaredDirectScenarioAction({
      action: kaeyaPhysicalAction,
      build: kaeya,
      buffs: [],
      enemy,
      gameData,
      teammates: [shenheC2]
    })
    const nonCryoSnapshot = evaluateDeclaredDirectScenarioAction({
      action: kaeyaPhysicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: shenheC2.buildId },
      build: kaeya,
      buffs: [],
      enemy,
      gameData,
      teammates: [shenheC2]
    })

    expect(selfSnapshot.stats.damageBonus - selfBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(selfSnapshot.result.expectedDamage).toBeCloseTo(
      selfBaseline.result.expectedDamage * (1 + selfSnapshot.stats.damageBonus) / (1 + selfBaseline.stats.damageBonus)
    )
    expect(selfSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: shenheC2.buildId, target: "damageBonus", value: 0.15 })
      ])
    )
    expect(teammateSnapshot.stats.damageBonus - teammateBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(teammateSnapshot.result.expectedDamage).toBeCloseTo(
      teammateBaseline.result.expectedDamage * (1 + teammateSnapshot.stats.damageBonus) /
        (1 + teammateBaseline.stats.damageBonus)
    )
    expect(teammateSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: shenheC2.buildId, value: 0.15 })])
    )
    expect(c6Snapshot.stats.damageBonus - teammateBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: shenheC6.buildId, value: 0.15 })])
    )
    expect(nonCryoSnapshot.stats.damageBonus).toBeCloseTo(nonCryoBaseline.stats.damageBonus)
    expect(nonCryoSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
