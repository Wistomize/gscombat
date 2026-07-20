import type {
  DamageAction,
  DamageFilter,
  ExpectedDamageInput,
  ExpectedDamageResult,
  Modifier,
  TraceEntry
} from "./domain.js"

/** Evaluate one direct-damage action and return expected damage with an ordered trace. */
export function evaluateExpectedDamage(input: ExpectedDamageInput): ExpectedDamageResult {
  const relevantModifiers = input.modifiers.filter((modifier) => modifierMatchesAction(modifier, input.action))
  const attackPercent = sumModifierValues(relevantModifiers, "attack_percent")
  const flatAttack = sumModifierValues(relevantModifiers, "attack_flat")
  const attackBeforeModifiers = input.stats.baseAttack * (1 + input.stats.attackPercent) + input.stats.flatAttack
  const attack =
    input.stats.baseAttack * (1 + input.stats.attackPercent + attackPercent) + input.stats.flatAttack + flatAttack
  const talentMultiplier = input.action.multiplier + sumModifierValues(relevantModifiers, "talent_multiplier_bonus")
  const baseDamage = attack * talentMultiplier
  const totalDamageBonus = input.stats.damageBonus + sumModifierValues(relevantModifiers, "damage_bonus")
  const nonCritBeforeMitigation = baseDamage * (1 + totalDamageBonus)
  const critRate = input.action.canCrit ? clamp(input.stats.critRate, 0, 1) : 0
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
    createTraceEntry("attack", "resolved_stats", attackBeforeModifiers, attack),
    createTraceEntry("talent", "action_multiplier", attack, baseDamage),
    createTraceEntry("damage_bonus", "applicable_damage_bonus", baseDamage, nonCritBeforeMitigation),
    createTraceEntry("crit", "expected_crit", nonCritBeforeMitigation, expectedBeforeMitigation),
    createTraceEntry("defense", "enemy_defense", expectedBeforeMitigation, expectedBeforeMitigation * defenseMultiplier),
    createTraceEntry(
      "resistance",
      "enemy_resistance",
      expectedBeforeMitigation * defenseMultiplier,
      expectedDamage
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
    return true
  }
  if (modifier.kind === "resistance_reduction") {
    return modifier.element === action.tags.element
  }
  return filterMatchesAction(modifier.filter, action)
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

function calculateDefenseMultiplier(
  attackerLevel: number,
  enemyLevel: number,
  defenseReduction: number,
  defenseIgnore: number
): number {
  const attackerTerm = attackerLevel + 100
  const enemyTerm = (enemyLevel + 100) * (1 - clamp(defenseReduction, 0, 1)) * (1 - defenseIgnore)
  return attackerTerm / (attackerTerm + enemyTerm)
}

function calculateResistanceMultiplier(resistance: number): number {
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
  after: number
): TraceEntry {
  return { after, before, source, stage }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
