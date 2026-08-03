import type { CombatActionEffect } from "../../combat/types.js"

export const BALLAD_OF_THE_FJORDS_TEAM_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const

/** Typed automatic team-composition contribution of Ballad of the Fjords to one current action. */
export const balladOfTheFjordsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    condition: { kind: "team_unique_element_count", minimum: 3 },
    id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
    label: "峡湾长歌 · 队伍至少三种元素类型",
    source: { kind: "weapon", weaponId: "BalladOfTheFjords" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: BALLAD_OF_THE_FJORDS_TEAM_ELEMENTAL_MASTERY }
  }
]
