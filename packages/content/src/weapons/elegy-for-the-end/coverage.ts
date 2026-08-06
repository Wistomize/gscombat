import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.elegy-for-the-end.self-elemental-mastery"],
      id: "weapon.elegy-for-the-end.self-elemental-mastery",
      label: "终末嗟叹之诗 · 不羁的千风（自身元素精通）",
      source: weaponSource("ElegyForTheEnd"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
        "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery"
      ],
      id: "weapon.elegy-for-the-end.four-sigil-team-buff",
      label: "终末嗟叹之诗 · 千年的大乐章·别离之歌",
      source: weaponSource("ElegyForTheEnd"),
      status: "implemented"
    }
  ],
  equipmentId: "ElegyForTheEnd",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
