import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

/** R1–R5 literals from the pinned 7.1 source; each cast owns an independent twelve-second stack. */
export const silverlightCombatActionEffects: readonly CombatActionEffect[] = [1, 2].map((count) => ({
  activation: "automatic",
  id: `weapon.silverlight.${count}-stack.elemental-mastery`,
  label: `银釭 · 12秒内施放战技${count}次的元素精通`,
  source: { kind: "weapon", weaponId: "Silverlight" },
  lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source",
    opportunityWindow: { seconds: 12, minimum: count, measure: "casts" } }, "按装备者十二秒内可施放战技次数，最多两层"),
  exclusivity: { group: "silverlight-stacks", variant: String(count), automaticPriority: count },
  target: "elementalMastery",
  value: { kind: "refinement_table", values: [52, 65, 78, 91, 104].map(value => value * count) }
}))
