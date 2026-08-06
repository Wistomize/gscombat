import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.sturdy-bone.sprint-stamina-consumption",
      label: "弥坚骨 · 冲刺时体力消耗降低",
      reason: "体力消耗只影响位移与循环，不改变当前核心动作的一次期望数值。",
      source: weaponSource("SturdyBone"),
      status: "not_applicable"
    },
    {
      effectIds: ["weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage"],
      id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
      label: "弥坚骨 · 冲刺后的18次普通攻击（7秒内）基于攻击力的附加伤害",
      source: weaponSource("SturdyBone", "primary"),
      status: "implemented"
    }
  ],
  equipmentId: "SturdyBone",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
