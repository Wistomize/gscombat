import type { CombatActionEffect } from "../../combat/types.js"

export const DESERT_PAVILION_CHRONICLE_ANEMO_DAMAGE_BONUS = 0.15
export const DESERT_PAVILION_CHRONICLE_WEAPON_DAMAGE_BONUS = 0.4

/** Typed two-piece and selected charged-hit window contributions of Desert Pavilion Chronicle. */
export const desertPavilionChronicleCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.desert-pavilion-chronicle.2pc.anemo-damage-bonus",
    label: "沙上楼阁史话 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "DesertPavilionChronicle" },
    target: "damageBonus",
    targetFilter: { elements: ["anemo"] },
    value: { kind: "fixed", value: DESERT_PAVILION_CHRONICLE_ANEMO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
      trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
        kind: "damage_hit", provider: "source", recipient: "source", hitKinds: ["charged"]
      } }, explanation: "前台装备者具备合法重击命中能力，默认已准备四件套；退场清除"
    },
    id: "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus",
    label: "沙上楼阁史话 · 四件套（重击命中后15秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "DesertPavilionChronicle" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: { kind: "fixed", value: DESERT_PAVILION_CHRONICLE_WEAPON_DAMAGE_BONUS }
  }
]
