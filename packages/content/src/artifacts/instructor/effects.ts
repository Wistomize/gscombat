import type { CombatActionEffect } from "../../combat/types.js"

export const INSTRUCTOR_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const INSTRUCTOR_FOUR_PIECE_PARTY_ELEMENTAL_MASTERY = 120

/** Typed two-piece and selected reaction-window four-piece contributions of Instructor to a current action. */
export const instructorCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.instructor.2pc.elemental-mastery",
    label: "教官 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "Instructor" },
    target: "elementalMastery",
    value: { kind: "fixed", value: INSTRUCTOR_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
      trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
        kind: "reaction_trigger", recipient: "source", provider: "source"
      } }, explanation: "装备者自身与队伍具备合法反应条件，默认前台触发后退场保留120全队精通"
    },
    id: "artifact.instructor.4pc.after-reaction.party-elemental-mastery",
    label: "教官 · 四件套（装备者触发元素反应后）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "Instructor", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "fixed", value: INSTRUCTOR_FOUR_PIECE_PARTY_ELEMENTAL_MASTERY }
  }
]
