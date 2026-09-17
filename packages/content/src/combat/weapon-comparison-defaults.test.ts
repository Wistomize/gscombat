import { expect, it } from "vitest"
import { equipmentCombatActionEffects } from "../registry/equipment-action-effects.generated.js"
import { sacrificialJadeCombatActionEffects } from "../weapons/sacrificial-jade/effects.js"
import { assertWeaponComparisonDefaults } from "./weapon-comparison-defaults.js"
import type { CombatActionEffect } from "./types.js"

it("accepts the real equipment registry and all contributions from one default state", () => {
  expect(() => assertWeaponComparisonDefaults(equipmentCombatActionEffects)).not.toThrow()
  expect(() => assertWeaponComparisonDefaults([...sacrificialJadeCombatActionEffects].reverse())).not.toThrow()
})

it("rejects overlapping default variants but preserves disjoint character-specific defaults", () => {
  const first = sacrificialJadeCombatActionEffects[0]!
  const other: CombatActionEffect = { ...first, id: "conflicting-default",
    exclusivity: { group: first.exclusivity!.group, variant: "other" },
    weaponComparisonDefault: { recipientCharacterIds: ["Neuvillette"] } }
  expect(() => assertWeaponComparisonDefaults([first, other])).toThrow("Conflicting weapon comparison defaults")
  expect(() => assertWeaponComparisonDefaults([
    { ...first, weaponComparisonDefault: { recipientCharacterIds: ["YumemizukiMizuki"] } }, other
  ])).not.toThrow()
})
