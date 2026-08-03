import type { SingleScalingDamageAction } from "@gscombat/calculator"

export interface RaidenInitialSlashParameters {
  readonly baseMultiplier: number
  readonly resolveMultiplierPerStack: number
  readonly resolveStacks: number
}

/** Builds the real initial-slash action from versioned talent parameters and scenario resolve stacks. */
export function createRaidenBurstInitialSlash(parameters: RaidenInitialSlashParameters): SingleScalingDamageAction {
  return {
    canCrit: true,
    multiplier: parameters.baseMultiplier + parameters.resolveMultiplierPerStack * parameters.resolveStacks,
    tags: {
      actionId: "raiden.burst.initial_slash",
      element: "electro",
      ownerId: "raiden",
      talent: "burst"
    }
  }
}

export const raidenBurstInitialSlash: SingleScalingDamageAction = {
  canCrit: true,
  multiplier: 2,
  tags: {
    actionId: "raiden.burst.initial_slash",
    element: "electro",
    ownerId: "raiden",
    talent: "burst"
  }
}
