import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { wintersHeavyHeartCombatActionEffects } from "./effects.js"

/** Pinned 7.1 weapon clauses consumed by the shared effect evaluator. */
export const equipmentCoverage = {
  kind: "weapon", equipmentId: "WintersHeavyHeart",
  clauses: [{ id: "weapon.winters-heavy-heart.stat-effects", label: "凝雪沉心 · 属性和伤害加成",
    effectIds: wintersHeavyHeartCombatActionEffects.map(effect => effect.id),
    source: weaponSource("WintersHeavyHeart"), status: "implemented" }]
} satisfies EquipmentCoverageEntry
