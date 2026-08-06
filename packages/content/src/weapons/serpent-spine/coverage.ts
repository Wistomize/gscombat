import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.serpent-spine.wavesplitter.1-stack.damage-bonus",
        "weapon.serpent-spine.wavesplitter.2-stack.damage-bonus",
        "weapon.serpent-spine.wavesplitter.3-stack.damage-bonus",
        "weapon.serpent-spine.wavesplitter.4-stack.damage-bonus",
        "weapon.serpent-spine.wavesplitter.5-stack.damage-bonus"
      ],
      id: "weapon.serpent-spine.wavesplitter.damage-bonus",
      label: "螭骨剑 · 破浪层数对应的全伤害",
      source: weaponSource("SerpentSpine"),
      status: "implemented"
    },
    {
      id: "weapon.serpent-spine.wavesplitter.incoming-damage-increase",
      label: "螭骨剑 · 破浪层数对应的承伤增加",
      reason: "承伤增加不进入角色对敌核心动作伤害公式。",
      source: weaponSource("SerpentSpine"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SerpentSpine",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
