import { describe, expect, it } from "vitest"

import {
  MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS,
  GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT,
  listRecipientEquipmentEffects,
  RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH,
  resolveRecipientEquipmentEffectValue,
  TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH,
  TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS
} from "./effects.js"

describe("recipient-owned equipment effects", () => {
  it("exposes artifact and weapon bonuses for the build receiving the metric", () => {
    expect(listRecipientEquipmentEffects()).toEqual([
      {
        id: "artifact.retracing-bolide.2pc.shield-strength",
        label: "逆飞的流星 · 二件套",
        source: { kind: "artifact_set", minimumPieces: 2, setId: "RetracingBolide" },
        target: "shieldStrength",
        value: { kind: "fixed", value: RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH }
      },
      {
        id: "artifact.traveling-doctor.2pc.incoming-healing-bonus",
        label: "游医 · 二件套（受到的治疗效果）",
        source: { kind: "artifact_set", minimumPieces: 2, setId: "TravelingDoctor" },
        target: "incomingHealingBonus",
        value: { kind: "fixed", value: TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS }
      },
      {
        activation: "active",
        id: "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus",
        label: "被怜爱的少女 · 四件套（已手填元素战技或元素爆发后10秒的队伍受治疗效果）",
        source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "MaidenBeloved" },
        target: "incomingHealingBonus",
        value: { kind: "fixed", value: MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS }
      },
      {
        activation: "active",
        id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength",
        label: "千岩牢固 · 四件套（已手填元素战技命中后3秒的队伍护盾强效）",
        source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "TenacityOfTheMillelith" },
        target: "shieldStrength",
        value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH }
      },
      {
        id: "weapon.memory-of-dust.shield-strength",
        label: "尘世之锁 · 护盾强效",
        source: { kind: "weapon", weaponId: "MemoryOfDust" },
        target: "shieldStrength",
        value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
      },
      {
        id: "weapon.summit-shaper.shield-strength",
        label: "斫峰之刃 · 护盾强效",
        source: { kind: "weapon", weaponId: "SummitShaper" },
        target: "shieldStrength",
        value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
      },
      {
        id: "weapon.the-unforged.shield-strength",
        label: "无工之剑 · 护盾强效",
        source: { kind: "weapon", weaponId: "TheUnforged" },
        target: "shieldStrength",
        value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
      },
      {
        id: "weapon.vortex-vanquisher.shield-strength",
        label: "贯虹之槊 · 护盾强效",
        source: { kind: "weapon", weaponId: "VortexVanquisher" },
        target: "shieldStrength",
        value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
      }
    ])
  })

  it("resolves fixed and refinement-indexed recipient bonuses", () => {
    const effects = listRecipientEquipmentEffects()
    const artifactEffect = effects.find((effect) => effect.id === "artifact.retracing-bolide.2pc.shield-strength")
    const weaponEffects = effects.filter((effect) => effect.source.kind === "weapon")

    expect(artifactEffect).toBeDefined()
    expect(resolveRecipientEquipmentEffectValue(artifactEffect!, 5)).toBe(
      RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH
    )
    expect(GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT).toEqual([0.2, 0.25, 0.3, 0.35, 0.4])
    for (const weaponEffect of weaponEffects) {
      const resolvedValues = [1, 2, 3, 4, 5].map((refinement) =>
        resolveRecipientEquipmentEffectValue(weaponEffect, refinement)
      )
      expect(resolvedValues).toEqual([0.2, 0.25, 0.3, 0.35, 0.4])
    }
    expect(() => resolveRecipientEquipmentEffectValue(weaponEffects[0]!, 0)).toThrow(
      "requires a weapon refinement from 1 to 5"
    )
  })
})
