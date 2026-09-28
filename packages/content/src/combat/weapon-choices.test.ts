import { expect, it } from "vitest"
import { equipmentCombatActionEffects } from "../registry/equipment-action-effects.generated.js"
import { lostPrayerToTheSacredWindsCombatActionEffects } from "../weapons/lost-prayer-to-the-sacred-winds/effects.js"
import { assertWeaponChoices } from "./weapon-choices.js"

it("validates all authored choices independently of declaration order", () => {
  expect(() => assertWeaponChoices(equipmentCombatActionEffects)).not.toThrow()
  expect(() => assertWeaponChoices([...equipmentCombatActionEffects].reverse())).not.toThrow()
})

it("rejects inconsistent or nonexistent defaults", () => {
  const effects = lostPrayerToTheSacredWindsCombatActionEffects
  const first = effects[0]!
  expect(() => assertWeaponChoices(effects.map((effect) => ({ ...effect,
    weaponChoice: { ...effect.weaponChoice!, defaultVariant: "missing" }
  })))).toThrow("Unknown weapon choice default")
  expect(() => assertWeaponChoices([{ ...first, weaponChoice: { ...first.weaponChoice!, defaultVariant: "missing" } },
    ...effects.slice(1)])).toThrow()
})
