import type { Modifier } from "@project-b/calculator"

export const illustrativeResolveModifier: Modifier = {
  filter: { talent: "burst" },
  kind: "talent_multiplier_bonus",
  source: "raiden.resolve_illustrative",
  value: 0.4
}
