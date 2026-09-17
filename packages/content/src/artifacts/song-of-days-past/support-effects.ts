import { TWO_PIECE_HEALING_BONUS, type HealingEquipmentEffect } from "../../rules/equipment/healing/types.js"

/** Entity-owned healing contributions; qualification is resolved by the shared lifecycle evaluator. */
export const songOfDaysPastHealingEquipmentEffects: readonly HealingEquipmentEffect[] = [
  {
    id: "artifact.song-of-days-past.2pc.healing-bonus",
    label: "昔时之歌 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "SongOfDaysPast" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  }
]
