import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { hymnOfTheMaelstromCombatActionEffects } from "./effects.js"

export const equipmentCoverage = {
  kind: "weapon", equipmentId: "HymnOfTheMaelstrom",
  clauses: [
    { id: "weapon.hymn-of-the-maelstrom.mead", label: "漩流颂歌 · 生命值和前台攻击力",
      effectIds: hymnOfTheMaelstromCombatActionEffects.map(effect => effect.id),
      source: weaponSource("HymnOfTheMaelstrom"), status: "implemented" },
    { id: "weapon.hymn-of-the-maelstrom.healing-bonus", label: "漩流颂歌 · 治疗加成",
      effectIds: ["weapon.hymn-of-the-maelstrom.healing-bonus"], source: weaponSource("HymnOfTheMaelstrom"), status: "implemented" }
  ]
} satisfies EquipmentCoverageEntry
