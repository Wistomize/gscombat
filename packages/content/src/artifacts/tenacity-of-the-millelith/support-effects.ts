import { TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"
import { tenacityPreparation } from "./effects.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const tenacityOfTheMillelithRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    activation: "active",
    lifecycle: tenacityPreparation,
    id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength",
    label: "千岩牢固 · 四件套（持续战技命中默认准备；单次命中可手选）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "TenacityOfTheMillelith" },
    target: "shieldStrength",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH }
  }
]
