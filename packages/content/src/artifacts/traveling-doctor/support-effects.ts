import { TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const travelingDoctorRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "artifact.traveling-doctor.2pc.incoming-healing-bonus",
    label: "游医 · 二件套（受到的治疗效果）",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "TravelingDoctor" },
    target: "incomingHealingBonus",
    value: { kind: "fixed", value: TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS }
  }
]
