import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-dockhands-assistant.mariners-resolve.3-mark.elemental-mastery"
      ],
      id: "weapon.the-dockhands-assistant.mariners-resolve.elemental-mastery",
      label: "船坞长剑 · 消耗坚忍标记后的元素精通",
      source: {
        kind: "weapon",
        weaponId: "TheDockhandsAssistant"
      },
      status: "implemented"
    },
    {
      id: "weapon.the-dockhands-assistant.mariners-resolve.energy-restoration",
      label: "船坞长剑 · 消耗坚忍标记后的能量恢复",
      reason: "能量恢复只改变后续循环资源，不改变当前核心动作的一次期望数值。",
      source: {
        kind: "weapon",
        weaponId: "TheDockhandsAssistant"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "TheDockhandsAssistant",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
