import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.sunny-morning-sleep-in.after-swirl.elemental-mastery",
        "weapon.sunny-morning-sleep-in.after-skill-hit.elemental-mastery",
        "weapon.sunny-morning-sleep-in.after-burst-hit.elemental-mastery"
      ],
      id: "weapon.sunny-morning-sleep-in.elemental-mastery-windows",
      label: "寝正月初晴 · 三种元素精通窗口",
      source: weaponSource("SunnyMorningSleepIn"),
      status: "implemented"
    }
  ],
  equipmentId: "SunnyMorningSleepIn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
