import type {
  DamageAction,
  DamageFilter,
  DamageScalingTerm,
  ExpectedDamageInput,
  ExpectedDamageResult,
  MultiScalingDamageAction,
  Modifier,
  ScalingStat,
  TraceEntry
} from "./domain.js"
import {
  calculateAdditiveReactionDamage,
  calculateAmplifyingReactionMultiplier,
  getAdditiveReactionBaseMultiplier,
  getReactionBaseDamage,
  getAmplifyingReactionBaseMultiplier
} from "./reaction.js"

/** Evaluate one direct-damage action and return expected damage with an ordered trace. */
export function evaluateExpectedDamage(input: ExpectedDamageInput): ExpectedDamageResult {
  const relevantModifiers = input.modifiers.filter((modifier) => modifierMatchesAction(modifier, input.action))
  const resolvedBaseDamage = resolveBaseDamage(input, relevantModifiers)
  const baseDamage = resolvedBaseDamage.value
  const amplifyingReaction = input.action.amplifyingReaction
  const additiveReaction = input.action.additiveReaction
  if (amplifyingReaction && additiveReaction) {
    throw new Error("A direct-damage action cannot declare both amplifying and additive reactions")
  }
  const amplifyingReactionMultiplier = amplifyingReaction
    ? calculateAmplifyingReactionMultiplier(input.stats.elementalMastery, amplifyingReaction)
    : 1
  const damageAfterAmplifyingReaction = baseDamage * amplifyingReactionMultiplier
  const additiveReactionDamage = additiveReaction
    ? calculateAdditiveReactionDamage(input.stats.level, input.stats.elementalMastery, additiveReaction)
    : 0
  const damageAfterAdditiveReaction = damageAfterAmplifyingReaction + additiveReactionDamage
  const totalDamageBonus = input.stats.damageBonus + sumModifierValues(relevantModifiers, "damage_bonus")
  const nonCritBeforeMitigation = damageAfterAdditiveReaction * (1 + totalDamageBonus)
  const critRate = input.action.canCrit
    ? input.action.critPolicy === "guaranteed"
      ? 1
      : clamp(input.stats.critRate, 0, 1)
    : 0
  const critMultiplier = input.action.canCrit ? 1 + input.stats.critDamage : 1
  const expectedCritMultiplier = 1 + critRate * input.stats.critDamage
  const expectedBeforeMitigation = nonCritBeforeMitigation * expectedCritMultiplier
  const defenseIgnore = clamp(sumModifierValues(relevantModifiers, "defense_ignore"), 0, 1)
  const defenseMultiplier = calculateDefenseMultiplier(
    input.stats.level,
    input.enemy.level,
    input.enemy.defenseReduction,
    defenseIgnore
  )
  const resistanceReduction = sumModifierValues(relevantModifiers, "resistance_reduction")
  const resistanceMultiplier = calculateResistanceMultiplier(input.enemy.resistance - resistanceReduction)
  const finalMultiplier = defenseMultiplier * resistanceMultiplier
  const nonCritDamage = nonCritBeforeMitigation * finalMultiplier
  const critDamage = nonCritBeforeMitigation * critMultiplier * finalMultiplier
  const expectedDamage = expectedBeforeMitigation * finalMultiplier
  const trace: readonly TraceEntry[] = [
    ...resolvedBaseDamage.trace,
    ...(amplifyingReaction
      ? [
          createTraceEntry("amplifying_reaction", amplifyingReaction.kind, baseDamage, damageAfterAmplifyingReaction, {
            baseMultiplier: getAmplifyingReactionBaseMultiplier(amplifyingReaction.kind),
            bonus: amplifyingReaction.bonus,
            elementalMastery: input.stats.elementalMastery,
            kind: "amplifying_reaction",
            multiplier: amplifyingReactionMultiplier,
            reaction: amplifyingReaction.kind
          })
        ]
      : []),
    ...(additiveReaction
      ? [
          createTraceEntry(
            "additive_reaction",
            additiveReaction.kind,
            damageAfterAmplifyingReaction,
            damageAfterAdditiveReaction,
            {
              baseDamage: getReactionBaseDamage(input.stats.level),
              bonus: additiveReaction.bonus,
              elementalMastery: input.stats.elementalMastery,
              kind: "additive_reaction",
              multiplier: getAdditiveReactionBaseMultiplier(additiveReaction.kind),
              reaction: additiveReaction.kind,
              reactionDamage: additiveReactionDamage
            }
          )
        ]
      : []),
    createTraceEntry("damage_bonus", "applicable_damage_bonus", damageAfterAdditiveReaction, nonCritBeforeMitigation, {
      bonus: totalDamageBonus,
      kind: "damage_bonus",
      multiplier: 1 + totalDamageBonus
    }),
    createTraceEntry("crit", "expected_crit", nonCritBeforeMitigation, expectedBeforeMitigation, {
      critDamage: input.stats.critDamage,
      critRate,
      kind: "expected_crit",
      multiplier: expectedCritMultiplier
    }),
    createTraceEntry(
      "defense",
      "enemy_defense",
      expectedBeforeMitigation,
      expectedBeforeMitigation * defenseMultiplier,
      {
        attackerLevel: input.stats.level,
        defenseIgnore,
        defenseReduction: input.enemy.defenseReduction,
        enemyLevel: input.enemy.level,
        kind: "defense",
        multiplier: defenseMultiplier
      }
    ),
    createTraceEntry(
      "resistance",
      "enemy_resistance",
      expectedBeforeMitigation * defenseMultiplier,
      expectedDamage,
      {
        effectiveResistance: input.enemy.resistance - resistanceReduction,
        kind: "resistance",
        multiplier: resistanceMultiplier,
        resistance: input.enemy.resistance,
        resistanceReduction
      }
    )
  ]

  return {
    critDamage,
    expectedDamage,
    nonCritDamage,
    trace
  }
}

function modifierMatchesAction(modifier: Modifier, action: DamageAction): boolean {
  if (modifier.kind === "attack_flat" || modifier.kind === "attack_percent") {
    return getDamageScalingTerms(action).some((term) => term.stat === "attack")
  }
  if (modifier.kind === "resistance_reduction") {
    return modifier.element === action.tags.element
  }
  return filterMatchesAction(modifier.filter, action)
}

function resolveBaseDamage(
  input: ExpectedDamageInput,
  relevantModifiers: readonly Modifier[]
): { readonly trace: readonly TraceEntry[]; readonly value: number } {
  const scaled = hasMultipleScalingTerms(input.action)
    ? resolveMultipleScalingTerms(input, relevantModifiers)
    : resolveSingleScalingBaseDamage(input, relevantModifiers)
  const flatDamageAddition = sumModifierValues(relevantModifiers, "base_damage_flat")
  if (flatDamageAddition === 0) return scaled
  return {
    trace: [
      ...scaled.trace,
      createTraceEntry("flat_damage_addition", "external_base_damage_flat", scaled.value, scaled.value + flatDamageAddition, {
        flatDamageAddition,
        kind: "direct_flat_damage_addition"
      })
    ],
    value: scaled.value + flatDamageAddition
  }
}

function resolveSingleScalingBaseDamage(
  input: ExpectedDamageInput,
  relevantModifiers: readonly Modifier[]
): { readonly trace: readonly TraceEntry[]; readonly value: number } {
  if (input.action.multiplier === undefined) throw new Error("Single-scaling damage action is missing its multiplier")
  const scaling = resolveScalingValue(input, relevantModifiers)
  const talentMultiplier = input.action.multiplier + sumModifierValues(relevantModifiers, "talent_multiplier_bonus")
  const value = scaling.value * talentMultiplier
  return {
    trace: [
      scaling.trace,
      createTraceEntry("talent", "action_multiplier", scaling.value, value, {
        kind: "talent",
        multiplier: talentMultiplier
      })
    ],
    value
  }
}

function resolveMultipleScalingTerms(
  input: ExpectedDamageInput,
  relevantModifiers: readonly Modifier[]
): { readonly trace: readonly TraceEntry[]; readonly value: number } {
  const talentMultiplierBonus = sumModifierValues(relevantModifiers, "talent_multiplier_bonus")
  if (talentMultiplierBonus !== 0) {
    throw new Error("Multi-scaling damage actions do not support an undifferentiated talent multiplier bonus")
  }

  const terms = getDamageScalingTerms(input.action)
  const attackScaling = terms.some((term) => term.stat === "attack")
    ? resolveAttackScalingValue(input, relevantModifiers)
    : undefined
  const resolvedTerms = terms.map((term) => {
    const value = term.stat === "attack" ? attackScaling?.value : getNonAttackScalingValue(input, term.stat)
    if (value === undefined) throw new Error("Expected a resolved attack value for an attack scaling term")
    return {
      coefficient: term.coefficient,
      contribution: value * term.coefficient,
      ...(term.label === undefined ? {} : { label: term.label }),
      stat: term.stat,
      value
    }
  })
  const value = resolvedTerms.reduce((total, term) => total + term.contribution, 0)
  return {
    trace: [
      createTraceEntry("scaling", "resolved_terms", 0, value, {
        kind: "scaling_terms",
        terms: resolvedTerms
      })
    ],
    value
  }
}

function resolveScalingValue(
  input: ExpectedDamageInput,
  relevantModifiers: readonly Modifier[]
): { readonly trace: TraceEntry; readonly value: number } {
  const scalingStat = input.action.scalingStat ?? "attack"
  if (scalingStat === "attack") {
    const attack = resolveAttackScalingValue(input, relevantModifiers)
    return {
      trace: createTraceEntry("attack", "resolved_stats", attack.before, attack.value, {
        attackPercent: attack.attackPercent,
        baseAttack: input.stats.baseAttack,
        flatAttack: attack.flatAttack,
        kind: "attack"
      }),
      value: attack.value
    }
  }

  const value = getNonAttackScalingValue(input, scalingStat)
  return {
    trace: createTraceEntry("scaling", "resolved_stats", 0, value, {
      kind: "scaling",
      stat: scalingStat,
      value
    }),
    value
  }
}

function resolveAttackScalingValue(
  input: ExpectedDamageInput,
  relevantModifiers: readonly Modifier[]
): { readonly attackPercent: number; readonly before: number; readonly flatAttack: number; readonly value: number } {
  const attackPercentModifier = sumModifierValues(relevantModifiers, "attack_percent")
  const flatAttackModifier = sumModifierValues(relevantModifiers, "attack_flat")
  const before = input.stats.baseAttack * (1 + input.stats.attackPercent) + input.stats.flatAttack
  const attackPercent = input.stats.attackPercent + attackPercentModifier
  const flatAttack = input.stats.flatAttack + flatAttackModifier
  const value = input.stats.baseAttack * (1 + attackPercent) + flatAttack
  return { attackPercent, before, flatAttack, value }
}

function getDamageScalingTerms(action: DamageAction): readonly DamageScalingTerm[] {
  if (hasMultipleScalingTerms(action)) return action.scalingTerms
  return [{ coefficient: action.multiplier, stat: action.scalingStat ?? "attack" }]
}

function hasMultipleScalingTerms(action: DamageAction): action is MultiScalingDamageAction {
  return "scalingTerms" in action
}

function getNonAttackScalingValue(input: ExpectedDamageInput, stat: Exclude<ScalingStat, "attack">): number {
  const value = stat === "defense" ? input.stats.defense : stat === "hp" ? input.stats.hp : input.stats.elementalMastery
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expected direct ${stat} scaling requires a finite ${stat} stat`)
  }
  return value
}

function filterMatchesAction(filter: DamageFilter, action: DamageAction): boolean {
  return (
    (filter.actionId === undefined || filter.actionId === action.tags.actionId) &&
    (filter.element === undefined || filter.element === action.tags.element) &&
    (filter.ownerId === undefined || filter.ownerId === action.tags.ownerId) &&
    (filter.talent === undefined || filter.talent === action.tags.talent)
  )
}

function sumModifierValues(modifiers: readonly Modifier[], kind: Modifier["kind"]): number {
  return modifiers.reduce((total, modifier) => total + (modifier.kind === kind ? modifier.value : 0), 0)
}

/** Resolves the enemy defense multiplier for one damaging event. */
export function calculateDefenseMultiplier(
  attackerLevel: number,
  enemyLevel: number,
  defenseReduction: number,
  defenseIgnore: number
): number {
  const attackerTerm = attackerLevel + 100
  const enemyTerm = (enemyLevel + 100) * (1 - clamp(defenseReduction, 0, 1)) * (1 - defenseIgnore)
  return attackerTerm / (attackerTerm + enemyTerm)
}

/** Resolves the element or physical resistance multiplier for one damaging event. */
export function calculateResistanceMultiplier(resistance: number): number {
  if (resistance < 0) {
    return 1 - resistance / 2
  }
  if (resistance < 0.75) {
    return 1 - resistance
  }
  return 1 / (4 * resistance + 1)
}

function createTraceEntry(
  stage: TraceEntry["stage"],
  source: string,
  before: number,
  after: number,
  formula: TraceEntry["formula"]
): TraceEntry {
  return { after, before, formula, source, stage }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
