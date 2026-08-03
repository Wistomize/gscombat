import { describe, expect, it } from "vitest"

import { getCombatElementOverrideEffectDefinition, listCombatElementOverrideEffects } from "./combat-effects.js"

describe("combat element override effects", () => {
  it("indexes source-owned effects independently from action selection", () => {
    const effect = getCombatElementOverrideEffectDefinition("chongyun.skill.chonghuas_frost_field")

    expect(effect).toMatchObject({
      element: "cryo",
      id: "chongyun.skill.chonghuas_frost_field",
      sourceCharacterId: "Chongyun",
      target: "normal_attack"
    })
    expect(listCombatElementOverrideEffects()).toContain(effect)
  })

  it("declares Bennett C6's supported melee normal-attack Pyro infusion slice", () => {
    const effect = getCombatElementOverrideEffectDefinition("bennett.constellation.6.pyro_infusion")

    expect(effect).toEqual({
      durationChecks: [
        { expectedCoefficient: 12, talentLevel: 1 },
        { expectedCoefficient: 12, talentLevel: 10 }
      ],
      durationParameter: {
        groupId: "burst",
        id: "inspiration-field-duration",
        parameterIndex: 4,
        source: "talent",
        talentSlot: "burst"
      },
      eligibleWeaponTypes: ["claymore", "polearm", "sword"],
      element: "pyro",
      id: "bennett.constellation.6.pyro_infusion",
      label: "美妙旅程领域内 · C6 普通攻击火元素附魔",
      minimumSourceConstellation: 6,
      requiredActiveEffectIds: ["bennett.burst.field"],
      sourceCharacterId: "Bennett",
      target: "normal_attack"
    })
  })
})
