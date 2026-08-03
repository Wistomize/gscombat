import { describe, expect, it } from "vitest"

import {
  isCombatActionEffectApplicable,
  listActiveCombatActionEffectOptionsForAction,
  listCombatActionEffects
} from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Keqing C4 current-action effect", () => {
  it("declares an explicit self-only Attunement snapshot after a confirmed Electro-related reaction", () => {
    const effectId = "keqing.constellation.4.attunement.electro_reaction.attack_percent"
    const recastSlash = requireAction("keqing.skill.stellar_restoration.recast_slash")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "调律 · C4 雷元素相关反应触发后攻击力（10秒）",
      source: { characterId: "Keqing", kind: "character", minimumSourceConstellation: 4 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    })
    expect(isCombatActionEffectApplicable(effect!, recastSlash)).toBe(true)
    expect(listActiveCombatActionEffectOptionsForAction(recastSlash)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          recipientSourceRelation: "source",
          source: { characterId: "Keqing", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
  })
})
