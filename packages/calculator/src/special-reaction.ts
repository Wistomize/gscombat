import { calculateResistanceMultiplier } from "./evaluate.js"
import { getReactionBaseDamage } from "./reaction.js"
import type {
  ExpectedDamageResult,
  SpecialReactionKind,
  SpecialReactionTraceFormula,
  SpecialReactionTraceStage,
  TraceEntry
} from "./domain.js"

/** Moon-reaction damage kinds whose direct character actions use the independent Moon formula. */
export type LunarReactionKind = "lunar_bloom" | "lunar_charged" | "lunar_crystallize"

/** Moon-reaction kinds which also create a participant-aggregated reaction damage instance. */
export type LunarParticipantReactionKind = Exclude<LunarReactionKind, "lunar_bloom">

/** The currently known stellar reaction damage family. It is separate from Moon reactions. */
export type StellarReactionKind = "stellar_superconduct"

/** A direct character action that is explicitly treated as Moon or stellar reaction damage. */
export type DirectSpecialReactionKind = SpecialReactionKind

/** One user-selected direct Moon-reaction damage action. */
export interface DirectLunarReactionDamageInput extends DirectSpecialReactionDamageInputBase {
  readonly kind: LunarReactionKind
  readonly storedElementalApplications?: never
}

/** One user-selected direct Stellar-Superconduct damage action. */
export interface DirectStellarSuperconductDamageInput extends DirectSpecialReactionDamageInputBase {
  /**
   * The manually selected number of elemental applications frozen by the current four-second
   * 极星辉域 window. It is deliberately not inferred from a rotation or skill timeline.
   */
  readonly storedElementalApplications: number
  readonly kind: "stellar_superconduct"
}

/** Input for a character action explicitly treated as special-reaction damage. */
export type DirectSpecialReactionDamageInput =
  | DirectLunarReactionDamageInput
  | DirectStellarSuperconductDamageInput

/** Per-character inputs for one manually declared participant in a reaction Moon instance. */
export interface LunarReactionParticipantInput {
  /** Additive ratio in Moon's independent base-damage-bonus stage. */
  readonly baseDamageBonus?: number
  /** Character level, which supplies the level-scaled reaction base damage. */
  readonly level: number
  /** Additive damage that is applied after the reaction bonus stage. */
  readonly flatDamageAddition?: number
  /** Additive ratio in the Moon reaction-damage-bonus stage. */
  readonly reactionDamageBonus?: number
  /** Additive ratio in the final Moon ascension stage. */
  readonly ascensionBonus?: number
  readonly critDamage: number
  readonly critRate: number
  readonly elementalMastery: number
  readonly enemyResistance: number
  readonly participantId: string
  readonly resistanceReduction?: number
}

/** Manually declared current contributors to one reaction Lunar-Charged or Lunar-Crystallize hit. */
export interface LunarReactionExpectedDamageInput {
  readonly kind: LunarParticipantReactionKind
  /**
   * Contributors whose source elemental applications remain in the current selected reaction
   * snapshot. The caller owns this snapshot; the calculator never infers it from timing.
   */
  readonly participants: readonly LunarReactionParticipantInput[]
}

/** One typed, ordered special-reaction formula stage for the result UI. */
export interface SpecialReactionTraceEntry extends Omit<TraceEntry, "formula" | "stage"> {
  readonly formula: SpecialReactionTraceFormula
  readonly stage: SpecialReactionTraceStage
}

export type { SpecialReactionTraceFormula, SpecialReactionTraceStage } from "./domain.js"

/** The crit, non-crit, expected-damage, and formula trace for one special-reaction damage source. */
export interface SpecialReactionDamageResult extends ExpectedDamageResult {
  readonly kind: DirectSpecialReactionKind
  readonly reactionCoefficient: number
  readonly trace: readonly SpecialReactionTraceEntry[]
}

/** One participant's independent reaction Moon damage before party aggregation. */
export interface LunarReactionParticipantDamageResult {
  readonly critRate: number
  readonly damage: SpecialReactionDamageResult
  readonly participantId: string
}

/** One concrete set of independently rolled participant crit outcomes. */
export interface LunarReactionCriticalOutcome {
  readonly criticalParticipantIds: readonly string[]
  readonly participantDamages: readonly { readonly damage: number; readonly participantId: string }[]
  readonly probability: number
  readonly rankedParticipantIds: readonly string[]
  readonly weightedDamage: number
}

/** Expected aggregate reaction Moon damage after all participant-critical outcomes are considered. */
export interface LunarReactionExpectedDamageResult {
  readonly expectedContributions: readonly { readonly expectedDamage: number; readonly participantId: string }[]
  readonly expectedDamage: number
  readonly kind: LunarParticipantReactionKind
  readonly outcomes: readonly LunarReactionCriticalOutcome[]
  readonly participants: readonly LunarReactionParticipantDamageResult[]
}

interface DirectSpecialReactionDamageInputBase {
  /** Scaling-stat value times the explicitly selected character action's multiplier. */
  readonly baseDamage: number
  /** Additive ratio in the special-reaction base-damage-bonus stage. */
  readonly baseDamageBonus?: number
  /** Multiplicative special-reaction big-power stage. */
  readonly bigPowerMultiplier?: number
  /** Additive direct special-reaction feather damage after the big-power stage. */
  readonly flatDamageAddition?: number
  /** Additive ratio in the special-reaction reaction-damage-bonus stage. */
  readonly reactionDamageBonus?: number
  /** Additive ratio in the final special-reaction ascension stage. */
  readonly ascensionBonus?: number
  readonly critDamage: number
  readonly critRate: number
  readonly elementalMastery: number
  readonly enemyResistance: number
  readonly resistanceReduction?: number
}

interface ResolvedSpecialReactionDamageInput {
  readonly ascensionBonus: number
  readonly baseDamage: number
  readonly baseDamageBonus: number
  readonly bigPowerMultiplier?: number
  readonly critDamage: number
  readonly critRate: number
  readonly elementalMastery: number
  readonly enemyResistance: number
  readonly flatDamageAddition: number
  readonly kind: DirectSpecialReactionKind
  readonly mode: "direct" | "reaction_lunar"
  readonly reactionCoefficient: number
  readonly reactionDamageBonus: number
  readonly resistanceReduction: number
  readonly storedElementalApplications?: number
}

const lunarBaseCoefficientByKind: Readonly<Record<LunarReactionKind, number>> = {
  lunar_bloom: 1,
  lunar_charged: 3,
  lunar_crystallize: 1.6
}

const lunarParticipantContributionWeights = [0.6, 0.3, 0.05, 0.05] as const

/** Returns the fixed Moon base coefficient for a direct or reaction Moon damage kind. */
export function getLunarReactionBaseCoefficient(kind: LunarReactionKind): number {
  return lunarBaseCoefficientByKind[kind]
}

/**
 * Returns the Stellar-Superconduct base coefficient for a manually selected elemental-application
 * count. Counts above 12 use the game's coefficient cap instead of requiring timing inference.
 */
export function getStellarSuperconductBaseCoefficient(storedElementalApplications: number): number {
  if (!Number.isInteger(storedElementalApplications) || storedElementalApplications < 0) {
    throw new Error("Stellar-Superconduct stored elemental applications must be a non-negative integer")
  }
  if (storedElementalApplications === 0) return 1
  if (storedElementalApplications <= 12) return 1.4 + storedElementalApplications * 0.05
  return 2
}

/**
 * Evaluates one character action explicitly treated as Lunar-Charged, Lunar-Bloom,
 * Lunar-Crystallize, or Stellar-Superconduct damage.
 */
export function calculateDirectSpecialReactionDamage(
  input: DirectSpecialReactionDamageInput
): SpecialReactionDamageResult {
  const baseDamage = requireNonNegativeFinite("Special-reaction base damage", input.baseDamage)
  const elementalMastery = requireNonNegativeFinite("Special-reaction elemental mastery", input.elementalMastery)
  const bigPowerMultiplier = requireNonNegativeFinite(
    "Special-reaction big-power multiplier",
    input.bigPowerMultiplier ?? 1
  )
  const reactionCoefficient = resolveDirectReactionCoefficient(input)

  return calculateSpecialReactionDamage({
    ascensionBonus: requireFinite("Special-reaction ascension bonus", input.ascensionBonus ?? 0),
    baseDamage,
    baseDamageBonus: requireFinite("Special-reaction base damage bonus", input.baseDamageBonus ?? 0),
    bigPowerMultiplier,
    critDamage: requireNonNegativeFinite("Special-reaction crit damage", input.critDamage),
    critRate: requireFinite("Special-reaction crit rate", input.critRate),
    elementalMastery,
    enemyResistance: requireFinite("Special-reaction enemy resistance", input.enemyResistance),
    flatDamageAddition: requireFinite("Special-reaction flat damage addition", input.flatDamageAddition ?? 0),
    kind: input.kind,
    mode: "direct",
    reactionCoefficient,
    reactionDamageBonus: requireFinite("Special-reaction reaction damage bonus", input.reactionDamageBonus ?? 0),
    resistanceReduction: requireFinite("Special-reaction resistance reduction", input.resistanceReduction ?? 0),
    ...(input.kind === "stellar_superconduct"
      ? { storedElementalApplications: input.storedElementalApplications }
      : {})
  })
}

/** Calculates one participant's independent Lunar-Charged or Lunar-Crystallize reaction damage. */
export function calculateLunarReactionParticipantDamage(
  kind: LunarParticipantReactionKind,
  input: LunarReactionParticipantInput
): SpecialReactionDamageResult {
  assertLunarParticipantReactionKind(kind)
  assertCharacterLevel(input.level)

  return calculateSpecialReactionDamage({
    ascensionBonus: requireFinite("Lunar reaction ascension bonus", input.ascensionBonus ?? 0),
    baseDamage: getReactionBaseDamage(input.level),
    baseDamageBonus: requireFinite("Lunar reaction base damage bonus", input.baseDamageBonus ?? 0),
    critDamage: requireNonNegativeFinite("Lunar reaction crit damage", input.critDamage),
    critRate: requireFinite("Lunar reaction crit rate", input.critRate),
    elementalMastery: requireNonNegativeFinite("Lunar reaction elemental mastery", input.elementalMastery),
    enemyResistance: requireFinite("Lunar reaction enemy resistance", input.enemyResistance),
    flatDamageAddition: requireFinite("Lunar reaction flat damage addition", input.flatDamageAddition ?? 0),
    kind,
    mode: "reaction_lunar",
    reactionCoefficient: getLunarReactionBaseCoefficient(kind),
    reactionDamageBonus: requireFinite("Lunar reaction damage bonus", input.reactionDamageBonus ?? 0),
    resistanceReduction: requireFinite("Lunar reaction resistance reduction", input.resistanceReduction ?? 0)
  })
}

/**
 * Evaluates a manually declared set of current reaction Moon contributors without inferring aura,
 * elemental application timing, or a full rotation. Crit outcomes are enumerated before ranking,
 * because a critical hit can change which participant receives each fixed contribution weight.
 */
export function calculateLunarReactionExpectedDamage(
  input: LunarReactionExpectedDamageInput
): LunarReactionExpectedDamageResult {
  assertLunarParticipantReactionKind(input.kind)
  if (input.participants.length === 0 || input.participants.length > lunarParticipantContributionWeights.length) {
    throw new Error("A reaction Moon damage instance requires between one and four manual participants")
  }

  const participantIds = new Set(input.participants.map((participant) => participant.participantId))
  if (participantIds.size !== input.participants.length || participantIds.has("")) {
    throw new Error("Each reaction Moon participant must have one unique non-empty participant ID")
  }

  const participants = input.participants.map((participant) => ({
    critRate: clamp(participant.critRate, 0, 1),
    damage: calculateLunarReactionParticipantDamage(input.kind, participant),
    participantId: participant.participantId
  }))
  const expectedContributionByParticipantId = new Map(participants.map((participant) => [participant.participantId, 0]))
  const outcomes: LunarReactionCriticalOutcome[] = []
  let expectedDamage = 0
  const outcomeCount = 2 ** participants.length

  for (let outcomeMask = 0; outcomeMask < outcomeCount; outcomeMask += 1) {
    const outcome = calculateLunarReactionCriticalOutcome(participants, outcomeMask)
    outcomes.push(outcome)
    expectedDamage += outcome.probability * outcome.weightedDamage
    for (const [rank, participantId] of outcome.rankedParticipantIds.entries()) {
      const damage = outcome.participantDamages.find((participant) => participant.participantId === participantId)?.damage ?? 0
      const weightedContribution = outcome.probability * (lunarParticipantContributionWeights[rank] ?? 0) * damage
      expectedContributionByParticipantId.set(
        participantId,
        (expectedContributionByParticipantId.get(participantId) ?? 0) + weightedContribution
      )
    }
  }

  return {
    expectedContributions: participants.map((participant) => ({
      expectedDamage: expectedContributionByParticipantId.get(participant.participantId) ?? 0,
      participantId: participant.participantId
    })),
    expectedDamage,
    kind: input.kind,
    outcomes,
    participants
  }
}

function calculateSpecialReactionDamage(input: ResolvedSpecialReactionDamageInput): SpecialReactionDamageResult {
  const afterReactionCoefficient = input.baseDamage * input.reactionCoefficient
  const baseDamageBonusMultiplier = 1 + input.baseDamageBonus
  const afterBaseDamageBonus = afterReactionCoefficient * baseDamageBonusMultiplier
  const masteryBonus = (6 * input.elementalMastery) / (input.elementalMastery + 2000)
  const reactionDamageBonusMultiplier = 1 + masteryBonus + input.reactionDamageBonus
  const afterReactionDamageBonus = afterBaseDamageBonus * reactionDamageBonusMultiplier
  const afterBigPower = input.mode === "direct"
    ? afterReactionDamageBonus * (input.bigPowerMultiplier ?? 1)
    : afterReactionDamageBonus
  const beforeCrit = afterBigPower + input.flatDamageAddition
  const critRate = clamp(input.critRate, 0, 1)
  const expectedCritMultiplier = 1 + critRate * input.critDamage
  const expectedBeforeResistance = beforeCrit * expectedCritMultiplier
  const effectiveResistance = input.enemyResistance - input.resistanceReduction
  const resistanceMultiplier = calculateResistanceMultiplier(effectiveResistance)
  const expectedBeforeAscension = expectedBeforeResistance * resistanceMultiplier
  const ascensionMultiplier = 1 + input.ascensionBonus
  const expectedDamage = expectedBeforeAscension * ascensionMultiplier
  const nonCritDamage = beforeCrit * resistanceMultiplier * ascensionMultiplier
  const critDamage = beforeCrit * (1 + input.critDamage) * resistanceMultiplier * ascensionMultiplier
  const trace: SpecialReactionTraceEntry[] = [
    createSpecialReactionTraceEntry("base_damage", "resolved_special_reaction_base", 0, input.baseDamage, {
      kind: "special_reaction_base_damage",
      value: input.baseDamage
    }),
    createSpecialReactionTraceEntry(
      "reaction_coefficient",
      `${input.kind}_base_coefficient`,
      input.baseDamage,
      afterReactionCoefficient,
      {
        kind: "special_reaction_coefficient",
        multiplier: input.reactionCoefficient,
        reactionKind: input.kind,
        ...(input.storedElementalApplications === undefined
          ? {}
          : { storedElementalApplications: input.storedElementalApplications })
      }
    ),
    createSpecialReactionTraceEntry(
      "base_damage_bonus",
      "special_reaction_base_damage_bonus",
      afterReactionCoefficient,
      afterBaseDamageBonus,
      {
        bonus: input.baseDamageBonus,
        kind: "special_reaction_base_damage_bonus",
        multiplier: baseDamageBonusMultiplier
      }
    ),
    createSpecialReactionTraceEntry(
      "reaction_damage_bonus",
      "special_reaction_damage_bonus",
      afterBaseDamageBonus,
      afterReactionDamageBonus,
      {
        bonus: input.reactionDamageBonus,
        elementalMastery: input.elementalMastery,
        kind: "special_reaction_damage_bonus",
        masteryBonus,
        multiplier: reactionDamageBonusMultiplier
      }
    ),
    ...(input.mode === "direct"
      ? [
          createSpecialReactionTraceEntry(
            "big_power",
            "direct_special_reaction_big_power",
            afterReactionDamageBonus,
            afterBigPower,
            { kind: "special_reaction_big_power", multiplier: input.bigPowerMultiplier ?? 1 }
          )
        ]
      : []),
    createSpecialReactionTraceEntry(
      "flat_damage_addition",
      input.mode === "direct" ? "direct_special_reaction_flat_damage" : "reaction_lunar_flat_damage",
      afterBigPower,
      beforeCrit,
      { flatDamageAddition: input.flatDamageAddition, kind: "special_reaction_flat_damage_addition" }
    ),
    createSpecialReactionTraceEntry("crit", "expected_crit", beforeCrit, expectedBeforeResistance, {
      critDamage: input.critDamage,
      critRate,
      kind: "expected_crit",
      multiplier: expectedCritMultiplier
    }),
    createSpecialReactionTraceEntry(
      "resistance",
      "enemy_resistance",
      expectedBeforeResistance,
      expectedBeforeAscension,
      {
        effectiveResistance,
        kind: "resistance",
        multiplier: resistanceMultiplier,
        resistance: input.enemyResistance,
        resistanceReduction: input.resistanceReduction
      }
    ),
    createSpecialReactionTraceEntry(
      "ascension",
      "special_reaction_ascension",
      expectedBeforeAscension,
      expectedDamage,
      {
        ascensionBonus: input.ascensionBonus,
        kind: "special_reaction_ascension",
        multiplier: ascensionMultiplier
      }
    )
  ]

  return {
    critDamage,
    expectedDamage,
    kind: input.kind,
    nonCritDamage,
    reactionCoefficient: input.reactionCoefficient,
    trace
  }
}

function calculateLunarReactionCriticalOutcome(
  participants: readonly LunarReactionParticipantDamageResult[],
  outcomeMask: number
): LunarReactionCriticalOutcome {
  let probability = 1
  const criticalParticipantIds: string[] = []
  const participantDamages = participants.map((participant, index) => {
    const isCritical = (outcomeMask & (1 << index)) !== 0
    probability *= isCritical ? participant.critRate : 1 - participant.critRate
    if (isCritical) criticalParticipantIds.push(participant.participantId)
    return {
      damage: isCritical ? participant.damage.critDamage : participant.damage.nonCritDamage,
      participantId: participant.participantId
    }
  })
  const rankedParticipantDamages = [...participantDamages].sort(
    (left, right) => right.damage - left.damage || left.participantId.localeCompare(right.participantId)
  )
  const weightedDamage = rankedParticipantDamages.reduce(
    (total, participant, rank) => total + participant.damage * (lunarParticipantContributionWeights[rank] ?? 0),
    0
  )

  return {
    criticalParticipantIds,
    participantDamages,
    probability,
    rankedParticipantIds: rankedParticipantDamages.map((participant) => participant.participantId),
    weightedDamage
  }
}

function createSpecialReactionTraceEntry(
  stage: SpecialReactionTraceStage,
  source: string,
  before: number,
  after: number,
  formula: SpecialReactionTraceFormula
): SpecialReactionTraceEntry {
  return { after, before, formula, source, stage }
}

function resolveDirectReactionCoefficient(input: DirectSpecialReactionDamageInput): number {
  if (input.kind === "stellar_superconduct") {
    return getStellarSuperconductBaseCoefficient(input.storedElementalApplications)
  }
  return getLunarReactionBaseCoefficient(input.kind)
}

function assertLunarParticipantReactionKind(kind: string): asserts kind is LunarParticipantReactionKind {
  if (kind !== "lunar_charged" && kind !== "lunar_crystallize") {
    throw new Error("Only Lunar-Charged and Lunar-Crystallize have participant-aggregated reaction damage")
  }
}

function assertCharacterLevel(level: number): void {
  if (!Number.isInteger(level) || level < 1 || level > 90) {
    throw new Error("Reaction Moon participant level must be an integer from 1 through 90")
  }
}

function requireFinite(label: string, value: number): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`)
  return value
}

function requireNonNegativeFinite(label: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative finite number`)
  return value
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
