import { describe, expect, it } from "vitest"

import {
  isCombatActionEffectApplicable,
  listActiveCombatActionEffectsForAction,
  listCombatActionEffects
} from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Thoma C6 current-action effect", () => {
  it("declares an explicit shield-refresh snapshot for normal, charged, and plunge actions only", () => {
    const effectId = "thoma.constellation.6.burning_heart.normal_charged_plunge_damage_bonus"
    const normalAction = requireAction("xiangling.normal.auto.first_hit")
    const chargedAction = requireAction(
      "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )
    const plungeAction = requireAction("xiao.burst.bane_of_all_evil.high_plunge")
    const skillAction = requireAction("thoma.skill.blazing_blessing.initial_kick")
    const burstAction = requireAction("thoma.burst.crimson_ooyoroi.initial_sweep")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "炽烧的至心 · C6 获取或刷新烈烧佑命护盾后普通、重击与下落攻击伤害加成",
      source: { characterId: "Thoma", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, normalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, chargedAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, plungeAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, skillAction)).toBe(false)
    expect(isCombatActionEffectApplicable(effect!, burstAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(normalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(skillAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
