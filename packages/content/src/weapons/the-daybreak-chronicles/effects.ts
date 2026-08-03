import type { CombatActionEffect } from "../../combat/types.js"

export const THE_DAYBREAK_CHRONICLES_DAMAGE_BONUS_PER_STACK = [0.1, 0.125, 0.15, 0.175, 0.2] as const

const talentSlots = ["normal", "skill", "burst"] as const
const stackCounts = [1, 2, 3, 4, 5, 6] as const
const talentLabels = { burst: "元素爆发", normal: "普通攻击", skill: "元素战技" } as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return THE_DAYBREAK_CHRONICLES_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(
  talentSlot: (typeof talentSlots)[number],
  stackCount: (typeof stackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "the-daybreak-chronicles-radiance", variant: `${talentSlot}-${stackCount}-stack` },
    id: `weapon.the-daybreak-chronicles.radiance.${talentSlot}.${stackCount}-stack.damage-bonus`,
    label: `黎明破晓之史 · ${talentLabels[talentSlot]}${stackCount}层光辉伤害`,
    source: { kind: "weapon", weaponId: "TheDaybreakChronicles" },
    target: "damageBonus",
    targetFilter:
      talentSlot === "normal"
        ? { attackKinds: ["normal"] }
        : { talentSlots: [talentSlot] },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected current-category Radiance stack contributions of The Daybreak Chronicles. */
export const theDaybreakChroniclesCombatActionEffects: readonly CombatActionEffect[] = talentSlots.flatMap((talentSlot) =>
  stackCounts.map((stackCount) => createStackEffect(talentSlot, stackCount))
)
