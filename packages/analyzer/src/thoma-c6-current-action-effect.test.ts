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

function createPolearmBuild(
  characterId: "HuTao" | "Thoma" | "Xiangling" | "Xiao",
  buildId: string,
  constellation: number
): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 托马 C6 当前动作效果测试配置`,
    weapon: { ...xianglingNationalBuiltinBuild.weapon, weaponId: "TheCatch" }
  }
}

describe("Thoma C6 current-action effect", () => {
  it("requires C6, inherits at C6, buffs party normal/charged/plunge actions, and excludes skill/burst", () => {
    const effectId = "thoma.constellation.6.burning_heart.normal_charged_plunge_damage_bonus"
    const normalAction = requireAction("xiangling.normal.auto.first_hit")
    const chargedAction = requireAction(
      "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )
    const plungeAction = requireAction("xiao.burst.bane_of_all_evil.high_plunge")
    const thomaSkill = requireAction("thoma.skill.blazing_blessing.initial_kick")
    const thomaBurst = requireAction("thoma.burst.crimson_ooyoroi.initial_sweep")
    const thomaC5 = createPolearmBuild("Thoma", "test.thoma.c5", 5)
    const thomaC6 = createPolearmBuild("Thoma", "test.thoma.c6", 6)
    const xiangling = createPolearmBuild("Xiangling", "test.xiangling.thoma-c6-recipient", 0)
    const huTao = createPolearmBuild("HuTao", "test.hu-tao.thoma-c6-recipient", 0)
    const xiao = createPolearmBuild("Xiao", "test.xiao.thoma-c6-recipient", 0)
    const activeEffectSourceBuildIds = { [effectId]: thomaC6.buildId }

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: normalAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: thomaC5.buildId },
        build: xiangling,
        buffs: [],
        enemy,
        gameData,
        teammates: [thomaC5]
      })
    ).toThrow(`Active effect ${effectId} requires Thoma constellation 6`)

    const normalBaseline = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const normalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const chargedBaseline = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      build: huTao,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const chargedSnapshot = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds,
      build: huTao,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const plungeBaseline = evaluateDeclaredDirectScenarioAction({
      action: plungeAction,
      build: xiao,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const plungeSnapshot = evaluateDeclaredDirectScenarioAction({
      action: plungeAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds,
      build: xiao,
      buffs: [],
      enemy,
      gameData,
      teammates: [thomaC6]
    })
    const skillBaseline = evaluateDeclaredDirectScenarioAction({
      action: thomaSkill,
      build: thomaC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const skillSnapshot = evaluateDeclaredDirectScenarioAction({
      action: thomaSkill,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds,
      build: thomaC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const burstBaseline = evaluateDeclaredDirectScenarioAction({
      action: thomaBurst,
      build: thomaC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const burstSnapshot = evaluateDeclaredDirectScenarioAction({
      action: thomaBurst,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds,
      build: thomaC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    for (const [baseline, snapshot] of [
      [normalBaseline, normalSnapshot],
      [chargedBaseline, chargedSnapshot],
      [plungeBaseline, plungeSnapshot]
    ] as const) {
      expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.15)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: effectId, sourceId: thomaC6.buildId, target: "damageBonus", value: 0.15 })
        ])
      )
    }
    expect(skillSnapshot.stats.damageBonus).toBeCloseTo(skillBaseline.stats.damageBonus)
    expect(skillSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(burstSnapshot.stats.damageBonus).toBeCloseTo(burstBaseline.stats.damageBonus)
    expect(burstSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
