import { TWO_PIECE_HEALING_BONUS, type HealingEquipmentEffect } from "../../rules/equipment/healing/types.js"

/** Entity-owned healing contributions; qualification is resolved by the shared lifecycle evaluator. */
export const oceanHuedClamHealingEquipmentEffects: readonly HealingEquipmentEffect[] = [
  {
    id: "artifact.ocean-hued-clam.2pc.healing-bonus",
    label: "海染砗磲 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "OceanHuedClam" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  }
]
