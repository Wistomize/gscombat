import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { newBoughCombatActionEffects } from "./effects.js"

/** Pinned 7.1 weapon clauses consumed by the shared effect evaluator. */
export const equipmentCoverage = {
  kind: "weapon", equipmentId: "NewBough",
  clauses: [{ id: "weapon.new-bough.stat-effects", label: "新枝 · 属性和伤害加成",
    effectIds: newBoughCombatActionEffects.map(effect => effect.id),
    source: weaponSource("NewBough"), status: "implemented" }]
} satisfies EquipmentCoverageEntry
