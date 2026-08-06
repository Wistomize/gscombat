import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.symphonist-of-scents.attack-percent",
        "weapon.symphonist-of-scents.off-field.extra-attack-percent"
      ],
      id: "weapon.symphonist-of-scents.attack-percent",
      label: "香韵奏者 · 攻击力与后台时的额外攻击力",
      source: weaponSource("SymphonistOfScents"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.symphonist-of-scents.sweet-echoes.self.attack-percent",
        "weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent"
      ],
      id: "weapon.symphonist-of-scents.healing-recipient-buff",
      label: "香韵奏者 · 治疗后持有者与受治疗角色的攻击力",
      source: weaponSource("SymphonistOfScents"),
      status: "implemented"
    }
  ],
  equipmentId: "SymphonistOfScents",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
