import type { Modifier } from "@project-b/calculator"

export const illustrativeEmblemBurstModifier: Modifier = {
  filter: { talent: "burst" },
  kind: "damage_bonus",
  source: "emblem_of_severed_fate.four_piece_illustrative",
  value: 0.65
}
