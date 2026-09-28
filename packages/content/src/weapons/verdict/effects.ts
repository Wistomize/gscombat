import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect, prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

export const VERDICT_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const VERDICT_SKILL_DAMAGE_BONUS_PER_STACK = [0.18, 0.225, 0.27, 0.315, 0.36] as const

const skillDamageStackCounts = [1, 2] as const

function getSkillDamageBonusValues(stackCount: number): readonly number[] {
  return VERDICT_SKILL_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createSkillDamageStackEffect(
  stackCount: (typeof skillDamageStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "automatic",
    hitConsumption: { clearAfterSeconds: 0.2 },
    lifecycle: stackCount === 2 ? { kind: "any_of", alternatives: [
      prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "ordinary_crystallize", provider: "party", recipient: "source" }, "队伍可普通结晶，默认已拾取两枚晶片"),
      prepareWeaponSpecialReaction(["lunar_crystallize"], "party")
    ] } : { kind: "excluded", reason: "已确认自动准备两层，无结晶条件为零" },
    exclusivity: { group: "verdict-rift-ripple", variant: stackCount + "-stack" },
    id: "weapon.verdict.rift-ripple." + stackCount + "-stack.skill-damage-bonus",
    label: "裁断 · 裂谷之灾" + stackCount + "层元素战技伤害",
    source: { kind: "weapon", weaponId: "Verdict" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: getSkillDamageBonusValues(stackCount) }
  }
}

/** Typed self attack and selected Rift Ripple contributions of Verdict. */
export const verdictCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.verdict.attack-percent",
    label: "裁断 · 攻击力",
    source: { kind: "weapon", weaponId: "Verdict" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: VERDICT_ATTACK_PERCENT }
  },
  ...skillDamageStackCounts.map(createSkillDamageStackEffect)
]
