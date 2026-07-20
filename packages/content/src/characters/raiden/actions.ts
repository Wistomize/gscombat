import type { DamageAction } from "@project-b/calculator"

export const raidenBurstInitialSlash: DamageAction = {
  canCrit: true,
  multiplier: 2,
  tags: {
    actionId: "raiden.burst.initial_slash",
    element: "electro",
    ownerId: "raiden",
    talent: "burst"
  }
}
