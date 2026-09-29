import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { breezeborneRefrainCombatActionEffects } from "./effects.js"

/** Pinned 7.1 weapon clauses consumed by the shared effect evaluator. */
export const equipmentCoverage = {
  kind: "weapon", equipmentId: "BreezeborneRefrain",
  clauses: [{ id: "weapon.breezeborne-refrain.stat-effects", label: "柔风游弦 · 属性和伤害加成",
    effectIds: breezeborneRefrainCombatActionEffects.map(effect => effect.id),
    source: weaponSource("BreezeborneRefrain"), status: "implemented" }]
} satisfies EquipmentCoverageEntry
