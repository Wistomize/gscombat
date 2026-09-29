import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"
import { beyondTheChrysalisCombatActionEffects } from "./effects.js"

export const equipmentCoverage = {
  kind: "weapon", equipmentId: "BeyondTheChrysalis",
  clauses: [
    { id: "weapon.beyond-the-chrysalis.winds", label: "蝶变 · 忠忱之风与叛弃之风",
      effectIds: beyondTheChrysalisCombatActionEffects.map(effect => effect.id),
      source: weaponSource("BeyondTheChrysalis"), status: "implemented" },
    { id: "weapon.beyond-the-chrysalis.energy", label: "蝶变 · 丰获之风恢复元素能量",
      source: weaponSource("BeyondTheChrysalis"), status: "not_applicable",
      reason: "恢复元素能量不改变单次指标的伤害或元素充能效率。" }
  ]
} satisfies EquipmentCoverageEntry
