import { describe, expect, it } from "vitest"

import {
  EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT,
  getTwoPieceHealingBonus,
  HEALING_BONUS_TWO_PIECE_SET_IDS,
  listHealingEquipmentEffects,
  resolveHealingEquipmentEffectValue,
  TWO_PIECE_HEALING_BONUS
} from "./effects.js"

describe("self-owned outgoing-healing equipment effects", () => {
  it.each(HEALING_BONUS_TWO_PIECE_SET_IDS)("grants 15 percent outgoing healing for %s", (setId) => {
    expect(getTwoPieceHealingBonus(setId, 2)).toBe(TWO_PIECE_HEALING_BONUS)
    expect(getTwoPieceHealingBonus(setId, 4)).toBe(TWO_PIECE_HEALING_BONUS)
  })

  it("does not grant a healing bonus for one piece or an unrelated set", () => {
    expect(getTwoPieceHealingBonus("MaidenBeloved", 1)).toBe(0)
    expect(getTwoPieceHealingBonus("NoblesseOblige", 4)).toBe(0)
  })

  it("exposes supported artifact and weapon healing bonuses as typed metric effects", () => {
    expect(listHealingEquipmentEffects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.maiden-beloved.2pc.healing-bonus",
          source: { kind: "artifact_set", minimumPieces: 2, setId: "MaidenBeloved" },
          target: "outgoingHealingBonus",
          value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
        }),
        expect.objectContaining({
          id: "artifact.ocean-hued-clam.2pc.healing-bonus",
          source: { kind: "artifact_set", minimumPieces: 2, setId: "OceanHuedClam" }
        }),
        expect.objectContaining({
          id: "artifact.song-of-days-past.2pc.healing-bonus",
          source: { kind: "artifact_set", minimumPieces: 2, setId: "SongOfDaysPast" }
        }),
        expect.objectContaining({
          id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
          source: { kind: "weapon", weaponId: "EverlastingMoonglow" },
          target: "outgoingHealingBonus",
          value: { kind: "refinement_table", values: EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT }
        })
      ])
    )
  })

  it("resolves fixed artifact and refinement-indexed weapon healing bonuses", () => {
    const effects = listHealingEquipmentEffects()
    const artifactEffect = effects.find((effect) => effect.id === "artifact.maiden-beloved.2pc.healing-bonus")
    const weaponEffect = effects.find((effect) => effect.id === "weapon.everlasting-moonglow.outgoing-healing-bonus")

    expect(artifactEffect).toBeDefined()
    expect(weaponEffect).toBeDefined()
    expect(resolveHealingEquipmentEffectValue(artifactEffect!, 5)).toBe(TWO_PIECE_HEALING_BONUS)
    expect(EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT).toEqual([0.1, 0.125, 0.15, 0.175, 0.2])
    expect([1, 2, 3, 4, 5].map((refinement) => resolveHealingEquipmentEffectValue(weaponEffect!, refinement))).toEqual(
      [0.1, 0.125, 0.15, 0.175, 0.2]
    )
    expect(() => resolveHealingEquipmentEffectValue(weaponEffect!, 0)).toThrow(
      "requires a weapon refinement from 1 to 5"
    )
  })
})
