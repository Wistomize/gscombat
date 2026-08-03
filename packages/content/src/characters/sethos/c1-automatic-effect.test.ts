import { describe, expect, it } from "vitest"

import { isCombatActionEffectApplicable, listCombatActionEffects } from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Sethos C1 automatic effect", () => {
  it("declares only Shadowpiercing Shot as a self-only C1 automatic critical-rate effect", () => {
    const effectId = "sethos.constellation.1.seal_of_the_forbidden_rite.shadowpiercing_shot.crit_rate"
    const shadowpiercingShot = requireAction("sethos.normal.royal_reed_archery.shadowpiercing_shot")
    const skillDamage = requireAction("sethos.skill.ancient_rite_the_thundering_sand.skill_damage")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "automatic",
      id: effectId,
      label: "C1 · 封龛谒灵歌：贯影箭暴击率 +15%",
      source: { characterId: "Sethos", kind: "character", minimumSourceConstellation: 1 },
      target: "critRate",
      targetFilter: {
        actionIds: ["sethos.normal.royal_reed_archery.shadowpiercing_shot"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, shadowpiercingShot)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, skillDamage)).toBe(false)
  })
})
