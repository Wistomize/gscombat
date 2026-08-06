import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.bloodstained-chivalry.2pc.physical-damage-bonus"],
      id: "artifact.bloodstained-chivalry.2pc.physical-damage-bonus",
      label: "染血的骑士道 · 二件套",
      source: artifactSource("BloodstainedChivalry", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus"],
      id: "artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus",
      label: "染血的骑士道 · 四件套（击败敌人后）",
      source: artifactSource("BloodstainedChivalry", 4),
      status: "implemented"
    },
    {
      id: "artifact.bloodstained-chivalry.4pc.after-defeat.charged-stamina",
      label: "染血的骑士道 · 四件套（重击体力消耗）",
      reason: "重击不消耗体力改变后续连续施放能力，不改变当前这一击的期望伤害。",
      source: artifactSource("BloodstainedChivalry", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "BloodstainedChivalry",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
