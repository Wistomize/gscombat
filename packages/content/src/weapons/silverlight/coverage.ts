import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { silverlightCombatActionEffects } from "./effects.js"

/** Pinned 7.1 weapon clauses consumed by the shared effect evaluator. */
export const equipmentCoverage = {
  kind: "weapon", equipmentId: "Silverlight",
  clauses: [{ id: "weapon.silverlight.stat-effects", label: "银釭 · 属性和伤害加成",
    effectIds: silverlightCombatActionEffects.map(effect => effect.id),
    source: weaponSource("Silverlight"), status: "implemented" }]
} satisfies EquipmentCoverageEntry
