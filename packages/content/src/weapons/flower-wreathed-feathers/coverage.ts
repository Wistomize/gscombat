import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.flower-wreathed-feathers.aimed-shot.1-stack.charged-damage-bonus",
        "weapon.flower-wreathed-feathers.aimed-shot.2-stack.charged-damage-bonus",
        "weapon.flower-wreathed-feathers.aimed-shot.3-stack.charged-damage-bonus",
        "weapon.flower-wreathed-feathers.aimed-shot.4-stack.charged-damage-bonus",
        "weapon.flower-wreathed-feathers.aimed-shot.5-stack.charged-damage-bonus",
        "weapon.flower-wreathed-feathers.aimed-shot.6-stack.charged-damage-bonus"
      ],
      id: "weapon.flower-wreathed-feathers.aimed-shot.charged-damage-bonus",
      label: "缀花之翎 · 瞄准蓄力层数对应的重击伤害",
      source: weaponSource("FlowerWreathedFeathers"),
      status: "implemented"
    },
    {
      id: "weapon.flower-wreathed-feathers.glide-stamina-consumption",
      label: "缀花之翎 · 滑翔体力消耗降低",
      reason: "滑翔体力消耗不改变一个已选核心动作的单次伤害。",
      source: weaponSource("FlowerWreathedFeathers"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FlowerWreathedFeathers",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
