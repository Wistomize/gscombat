import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.xiphos-moonlight.after-10s.self.source-em-to-energy-recharge"],
      id: "weapon.xiphos-moonlight.holder.em-sourced-energy-recharge",
      label: "西福斯的月光 · 持有者元素精通转元素充能效率",
      source: weaponSource("XiphosMoonlight"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.xiphos-moonlight.after-10s.other-party.source-em-to-energy-recharge"
      ],
      id: "weapon.xiphos-moonlight.other-party.em-sourced-energy-recharge",
      label: "西福斯的月光 · 其他队友的元素精通转元素充能效率",
      source: weaponSource("XiphosMoonlight"),
      status: "implemented"
    }
  ],
  equipmentId: "XiphosMoonlight",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
