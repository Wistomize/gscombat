import type { CombatActionEffect } from "../../combat/types.js"

export const JADE_VISTA_ELEMENTAL_MASTERY_PER_SAME_ELEMENT_TEAMMATE = [64, 80, 96, 112, 128] as const
export const JADE_VISTA_ATTACK_PERCENT_PER_DIFFERENT_ELEMENT_TEAMMATE = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const teammateStackThresholds = [1, 2, 3] as const

function createSameElementEffects(): readonly CombatActionEffect[] {
  return teammateStackThresholds.map((minimum) => ({
    activation: "automatic",
    condition: { kind: "primary_same_element_teammate_count", minimum },
    id: `weapon.jade-vista.same-element-teammate.${minimum}.elemental-mastery-stack`,
    label: `悬黎千钧 · 第${minimum}名同元素队友提供的元素精通`,
    source: { kind: "weapon", weaponId: "JadeVista" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: JADE_VISTA_ELEMENTAL_MASTERY_PER_SAME_ELEMENT_TEAMMATE }
  }))
}

function createDifferentElementEffects(): readonly CombatActionEffect[] {
  return teammateStackThresholds.map((minimum) => ({
    activation: "automatic",
    condition: { kind: "primary_different_element_teammate_count", minimum },
    id: `weapon.jade-vista.different-element-teammate.${minimum}.attack-percent-stack`,
    label: `悬黎千钧 · 第${minimum}名异元素队友提供的攻击力`,
    source: { kind: "weapon", weaponId: "JadeVista" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: JADE_VISTA_ATTACK_PERCENT_PER_DIFFERENT_ELEMENT_TEAMMATE }
  }))
}

/** Typed team-composition contributions of Jade Vista. */
export const jadeVistaCombatActionEffects: readonly CombatActionEffect[] = [
  ...createSameElementEffects(),
  ...createDifferentElementEffects()
]
