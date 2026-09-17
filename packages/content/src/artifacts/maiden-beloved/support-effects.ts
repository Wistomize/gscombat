import { TWO_PIECE_HEALING_BONUS, type HealingEquipmentEffect } from "../../rules/equipment/healing/types.js"

/** Entity-owned healing contributions; qualification is resolved by the shared lifecycle evaluator. */
export const maidenBelovedHealingEquipmentEffects: readonly HealingEquipmentEffect[] = [
  {
    id: "artifact.maiden-beloved.2pc.healing-bonus",
    label: "被怜爱的少女 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "MaidenBeloved" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  }
]

import { MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const maidenBelovedRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
      trigger: { event: "skill_cast", sourceFieldPresence: "on_field" },
      explanation: "默认已施放战技或爆发，退场保留全队20%受治疗加成；不要求命中或治疗能力"
    },
    id: "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus",
    label: "被怜爱的少女 · 四件套（默认施放战技或爆发后，全队受治疗加成）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "MaidenBeloved" },
    target: "incomingHealingBonus",
    value: { kind: "fixed", value: MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS }
  }
]
