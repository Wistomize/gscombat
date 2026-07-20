import type { ExpectedDamageInput, Modifier } from "@project-b/calculator"

import { illustrativeEmblemBurstModifier } from "../../artifacts/emblem-of-severed-fate/index.js"
import { bennettDefinition, illustrativeBennettBurstModifier } from "../../characters/bennett/index.js"
import {
  illustrativeResolveModifier,
  raidenBurstInitialSlash,
  raidenDefinition
} from "../../characters/raiden/index.js"
import { xianglingDefinition } from "../../characters/xiangling/index.js"
import { xingqiuDefinition } from "../../characters/xingqiu/index.js"
import { pyroResonanceModifier } from "../../rules/elemental-resonances.js"
import type { PlaystyleDefinition } from "../../types.js"

export interface FoundationFixtureOptions {
  readonly additionalAttackPercent?: number
}

export interface FoundationFixture {
  readonly input: ExpectedDamageInput
  readonly metadata: PlaystyleDefinition
}

export const raidenNationalPlaystyle: PlaystyleDefinition = {
  dataStatus: "illustrative",
  id: "raiden-national.initial-slash",
  memberIds: [
    raidenDefinition.id,
    xianglingDefinition.id,
    xingqiuDefinition.id,
    bennettDefinition.id
  ],
  primaryActionId: raidenBurstInitialSlash.tags.actionId,
  version: "foundation-1"
}

const playstyleModifiers: readonly Modifier[] = [
  pyroResonanceModifier,
  illustrativeBennettBurstModifier,
  illustrativeResolveModifier,
  illustrativeEmblemBurstModifier
]

/** Compose the illustrative Raiden National playstyle from reusable content modules. */
export function createRaidenNationalFoundationInput(options: FoundationFixtureOptions = {}): FoundationFixture {
  const additionalAttackPercent = options.additionalAttackPercent ?? 0
  const modifiers: readonly Modifier[] = additionalAttackPercent
    ? [
        ...playstyleModifiers,
        {
          kind: "attack_percent",
          source: "analysis_intervention",
          value: additionalAttackPercent
        }
      ]
    : playstyleModifiers

  return {
    input: {
      action: raidenBurstInitialSlash,
      enemy: {
        defenseReduction: 0,
        level: 90,
        resistance: 0.1
      },
      modifiers,
      stats: {
        attackPercent: 0.5,
        baseAttack: 900,
        critDamage: 1.2,
        critRate: 0.7,
        damageBonus: 0.5,
        flatAttack: 311,
        level: 90
      }
    },
    metadata: raidenNationalPlaystyle
  }
}
