import type { CombatActionEffect } from "../../combat/types.js"

export const TENACITY_OF_THE_MILLELITH_TWO_PIECE_HP_PERCENT = 0.2
export const TENACITY_OF_THE_MILLELITH_PARTY_ATTACK_PERCENT = 0.2

/** Typed two-piece and selected team-window four-piece contributions of Tenacity of the Millelith. */
export const tenacityOfTheMillelithCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.tenacity-of-the-millelith.2pc.hp-percent",
    label: "千岩牢固 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "TenacityOfTheMillelith" },
    target: "hpPercent",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_TWO_PIECE_HP_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent",
    label: "千岩牢固 · 四件套（队伍中装备者元素战技命中后3秒内）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "TenacityOfTheMillelith" },
    target: "attackPercent",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_PARTY_ATTACK_PERCENT }
  }
]
