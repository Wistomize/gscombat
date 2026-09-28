import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const CLOUDFORGED_ONE_STACK_ELEMENTAL_MASTERY = [40, 50, 60, 70, 80] as const
export const CLOUDFORGED_TWO_STACK_ELEMENTAL_MASTERY = [80, 100, 120, 140, 160] as const

/** Typed selected energy-reduction stacks of Cloudforged. */
export const cloudforgedCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "energy_spend", provider: "source", recipient: "source",
      opportunityWindow: { seconds: 18, measure: "casts", minimum: 1 } }, "十八秒内至少一次本人合法元素能量减少"),
    exclusivity: { group: "cloudforged-energy-reduced", variant: "one-stack", automaticPriority: 1 },
    id: "weapon.cloudforged.energy-reduced.1-stack.elemental-mastery",
    label: "筑云 · 元素能量减少后的1层元素精通",
    source: { kind: "weapon", weaponId: "Cloudforged" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLOUDFORGED_ONE_STACK_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "energy_spend", provider: "source", recipient: "source",
      opportunityWindow: { seconds: 18, measure: "casts", minimum: 2 } }, "按冷却/自身扣能/追忆证明十八秒内两次扣能；含已准备补能，不模拟循环"),
    exclusivity: { group: "cloudforged-energy-reduced", variant: "two-stack", automaticPriority: 2 },
    id: "weapon.cloudforged.energy-reduced.2-stack.elemental-mastery",
    label: "筑云 · 元素能量减少后的2层元素精通",
    source: { kind: "weapon", weaponId: "Cloudforged" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLOUDFORGED_TWO_STACK_ELEMENTAL_MASTERY }
  }
]
