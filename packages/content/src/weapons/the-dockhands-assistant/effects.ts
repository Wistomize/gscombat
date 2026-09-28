import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponHealingMarks } from "../../combat/weapon-preparation.js"

export const THE_DOCKHANDS_ASSISTANT_ELEMENTAL_MASTERY_PER_CONSUMED_MARK = [40, 50, 60, 70, 80] as const

const consumedMarkCounts = [1, 2, 3] as const

function getElementalMasteryValues(consumedMarkCount: number): readonly number[] {
  return THE_DOCKHANDS_ASSISTANT_ELEMENTAL_MASTERY_PER_CONSUMED_MARK.map((value) => value * consumedMarkCount)
}

function createConsumedMarkEffect(consumedMarkCount: (typeof consumedMarkCounts)[number]): CombatActionEffect {
  return {
    activation: "automatic",
    lifecycle: consumedMarkCount === 3 ? prepareWeaponHealingMarks() : { kind: "excluded", reason: "按适用治疗来源自动准备三枚标记" },
    exclusivity: { group: "the-dockhands-assistant-mariners-resolve", variant: `${consumedMarkCount}-mark` },
    id: `weapon.the-dockhands-assistant.mariners-resolve.${consumedMarkCount}-mark.elemental-mastery`,
    label: `船坞长剑 · 消耗${consumedMarkCount}枚坚忍标记后的元素精通`,
    source: { kind: "weapon", weaponId: "TheDockhandsAssistant" },
    target: "elementalMastery",
    value: {
      kind: "refinement_table",
      values: getElementalMasteryValues(consumedMarkCount)
    }
  }
}

/** Typed selected consumed-Mariner's-Resolve contributions of The Dockhand's Assistant. */
export const theDockhandsAssistantCombatActionEffects: readonly CombatActionEffect[] = consumedMarkCounts.map(
  createConsumedMarkEffect
)
