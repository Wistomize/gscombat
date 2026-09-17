import { RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const retracingBolideRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "artifact.retracing-bolide.2pc.shield-strength",
    label: "逆飞的流星 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "RetracingBolide" },
    target: "shieldStrength",
    value: { kind: "fixed", value: RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH }
  }
]
