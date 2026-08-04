import { calculateDefenseMultiplier, calculateResistanceMultiplier } from "./evaluate.js"
import type {
  DamageScalingTerm,
  Element,
  EnemyStats,
  ScalingStat,
  SpecialReactionTraceFormula,
  SpecialReactionTraceStage
} from "./domain.js"
import {
  calculateAdditiveReactionDamage,
  calculateAmplifyingReactionMultiplier,
  getAdditiveReactionBaseMultiplier,
  getAmplifyingReactionBaseMultiplier,
  getReactionBaseDamage,
  isAdditiveReaction,
  isAmplifyingReaction,
  type AdditiveReaction,
  type AmplifyingReaction
} from "./reaction.js"

export type { AdditiveReaction, AmplifyingReaction } from "./reaction.js"

export type { ScalingStat } from "./domain.js"

export type TransformativeReaction =
  | "bloom"
  | "burning"
  | "burgeon"
  | "electro_charged"
  | "hyperbloom"
  | "overload"
  | "shatter"
  | "superconduct"
  | "swirl"

export type RotationReaction = AmplifyingReaction | AdditiveReaction | TransformativeReaction

/** Identifies a kind of damage event which can receive a temporary elemental override. */
export type RotationElementOverrideTarget = "normal_attack"

/** An element that can replace physical damage for a temporary elemental override. */
export type RotationElementOverrideElement = Exclude<Element, "physical">

/** The elemental aura families supported by the static single-target aura model. */
export type AuraElement = "cryo" | "hydro" | "pyro" | "quicken"

export interface RotationStats {
  readonly attack: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  /** Optional element-specific bonus added to damageBonus for the event's final damage element. */
  readonly damageBonusByElement?: Readonly<Partial<Record<Element, number>>>
  readonly defense: number
  readonly elementalMastery: number
  readonly hp: number
  readonly level: number
}

/** A flat change to already-resolved combat stats while an effect window is active. */
export interface RotationStatModifier {
  readonly attack?: number
  readonly critDamage?: number
  readonly critRate?: number
  readonly damageBonus?: number
  readonly defense?: number
  readonly elementalMastery?: number
  readonly hp?: number
}

/** A time-bounded team or character effect that applies to matching damage events. */
export interface RotationEffectWindow {
  readonly end: number
  readonly id: string
  readonly ownerId?: string
  readonly start: number
  readonly stats: RotationStatModifier
}

/** Replaces matching event damage with an element for a non-empty action-relative time window. */
export interface RotationElementOverrideWindow {
  readonly element: RotationElementOverrideElement
  readonly end: number
  readonly id: string
  readonly ownerId?: string
  readonly start: number
  readonly target: RotationElementOverrideTarget
}

/** The standard 2.5-second, one-zero-zero elemental-application cadence for one source group. */
export interface StandardElementalApplicationIcd {
  readonly groupId: string
  readonly kind: "standard"
}

/** An elemental application that is intentionally exempt from ICD throttling. */
export interface NoElementalApplicationIcd {
  readonly kind: "none"
}

export type ElementalApplicationIcd = NoElementalApplicationIcd | StandardElementalApplicationIcd

/** Selects whether an elemental application is always attempted or only while an elemental override is active. */
export type ElementalApplicationActivation = "always" | "while_element_overridden"

/** Declares that a hit applies its own element under an explicit ICD policy. */
export interface RotationElementalApplication {
  readonly activation?: ElementalApplicationActivation
  readonly icd: ElementalApplicationIcd
  readonly reactionBonus?: number
}

/** A static, non-consuming elemental aura on the single analyzed target. */
export interface SustainedAuraWindow {
  readonly element: AuraElement
  readonly end: number
  readonly id: string
  readonly start: number
}

/** The observable result of an event-level elemental application attempt. */
export interface RotationElementalApplicationResult {
  readonly applied: boolean
  readonly auraElement?: AuraElement
  readonly auraId?: string
  readonly reaction?: RotationReaction
}

/** Enemy values for rotation calculations, with an optional per-element resistance override. */
export interface RotationEnemyStats extends EnemyStats {
  readonly resistances?: Readonly<Partial<Record<Element, number>>>
}

/** A legacy one-stat rotation scaling declaration. */
export interface SingleDamageScaling {
  readonly coefficient: number
  readonly flatDamage?: number
  readonly stat: ScalingStat
  readonly terms?: never
}

/** Multiple base scaling contributions evaluated as one hit before shared damage multipliers. */
export interface MultiDamageScaling {
  readonly coefficient?: never
  /** Flat base damage added after every resolved scaling term and before shared multipliers. */
  readonly flatDamage?: number
  readonly stat?: never
  readonly terms: readonly [DamageScalingTerm, ...DamageScalingTerm[]]
}

export type DamageScaling = SingleDamageScaling | MultiDamageScaling

export interface ReactionConfig {
  readonly bonus: number
  /** Required only for transformative reactions whose damage element cannot be inferred from the reaction kind. */
  readonly damageElement?: Element
  /** Adds once per transformative reaction hit after its reaction multiplier, before resistance. */
  readonly flatDamageAddition?: number
  readonly kind: RotationReaction
}

export interface RotationDamageEvent {
  /** Added only when an event-level aura resolves to Vaporize or Melt. */
  readonly amplifyingReactionBonus?: number
  readonly canCrit: boolean
  /** Overrides normal crit-rate expectation when an independent event is guaranteed to crit by its trigger. */
  readonly critPolicy?: "guaranteed"
  readonly defenseIgnore?: number
  readonly elementalApplication?: RotationElementalApplication
  readonly element: Element
  readonly elementOverrideTarget?: RotationElementOverrideTarget
  readonly hitCount?: number
  readonly id: string
  readonly ownerId: string
  readonly reaction?: ReactionConfig
  readonly resistanceReduction?: number
  readonly scaling: DamageScaling
  readonly statSnapshotTime?: number
  readonly stats: RotationStats
  readonly time: number
}

export interface RotationInput {
  readonly duration: number
  readonly enemy: RotationEnemyStats
  readonly effects?: readonly RotationEffectWindow[]
  readonly elementOverrides?: readonly RotationElementOverrideWindow[]
  readonly events: readonly RotationDamageEvent[]
  readonly sustainedAuras?: readonly SustainedAuraWindow[]
}

export type RotationTraceEntry =
  | {
      readonly after: number
      readonly before: number
      readonly coefficient: number
      readonly kind: "scaling"
      readonly stat: ScalingStat
      readonly value: number
    }
  | {
      readonly after: number
      readonly before: number
      readonly kind: "scaling_terms"
      readonly terms: readonly (DamageScalingTerm & { readonly contribution: number; readonly value: number })[]
    }
  | {
      readonly after: number
      readonly baseMultiplier: number
      readonly before: number
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "amplifying_reaction"
      readonly multiplier: number
      readonly reaction: AmplifyingReaction
    }
  | {
      readonly after: number
      readonly baseDamage: number
      readonly before: number
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "additive_reaction"
      readonly multiplier: number
      readonly reaction: AdditiveReaction
      readonly reactionDamage: number
    }
  | {
      readonly after: number
      readonly before: number
      readonly bonus: number
      readonly kind: "damage_bonus"
      readonly multiplier: number
    }
  | {
      readonly after: number
      readonly before: number
      readonly critDamage: number
      readonly critRate: number
      readonly kind: "expected_crit"
      readonly multiplier: number
    }
  | {
      readonly after: number
      readonly attackerLevel: number
      readonly before: number
      readonly defenseIgnore: number
      readonly defenseReduction: number
      readonly enemyLevel: number
      readonly kind: "defense"
      readonly multiplier: number
    }
  | {
      readonly after: number
      /** Enemy resistance before event-level resistance reduction. */
      readonly baseResistance: number
      readonly before: number
      readonly element: Element
      /**
       * The resolved resistance after event-level reduction, retained alongside the legacy resistance field for clarity.
       */
      readonly effectiveResistance: number
      readonly kind: "resistance"
      readonly multiplier: number
      /** Legacy field whose value remains the resolved effective resistance. */
      readonly resistance: number
      readonly resistanceReduction: number
    }
  | {
      readonly after: number
      /** Single-hit damage after all ordinary mitigation, before the event's hit count is applied. */
      readonly before: number
      readonly hitCount: number
      readonly kind: "hit_count"
    }
  | {
      readonly after: number
      /** Level-scaled reaction base damage before the reaction multiplier and elemental-mastery formula. */
      readonly baseDamage: number
      readonly before: number
      readonly bonus: number
      readonly elementalMastery: number
      /** Additive reaction base damage after the level/EM/reaction-bonus calculation. */
      readonly flatDamageAddition: number
      /**
       * Number of reaction hits included in after.
       * after = (baseDamage × multiplier × (1 + 16 × EM / (EM + 2000) + bonus) + flatDamageAddition) × hitCount.
       */
      readonly hitCount: number
      readonly kind: "transformative_reaction"
      readonly multiplier: number
      readonly reaction: TransformativeReaction
    }
  | {
      readonly after: number
      readonly before: number
      readonly formula: SpecialReactionTraceFormula
      readonly kind: "special_reaction"
      readonly stage: SpecialReactionTraceStage
    }

export interface RotationEventResult {
  readonly appliedEffectIds: readonly string[]
  readonly critDamage: number
  readonly elementalApplication?: RotationElementalApplicationResult
  readonly element: Element
  readonly elementOverride?: RotationElementOverrideResult
  readonly expectedDamage: number
  readonly hitCount: number
  readonly id: string
  readonly nonCritDamage: number
  readonly ownerId: string
  readonly statSnapshotTime: number
  readonly time: number
  readonly trace: readonly RotationTraceEntry[]
}

/** Records the source and resulting element when an event receives an elemental override. */
export interface RotationElementOverrideResult {
  readonly baseElement: Element
  readonly element: RotationElementOverrideElement
  readonly id: string
}

export interface RotationResult {
  readonly dpr: number
  readonly dps: number
  readonly duration: number
  readonly events: readonly RotationEventResult[]
}

const transformativeReactionMultiplier: Readonly<Record<TransformativeReaction, number>> = {
  bloom: 2,
  burning: 0.25,
  burgeon: 3,
  electro_charged: 2.4,
  hyperbloom: 3,
  overload: 4,
  shatter: 3,
  superconduct: 1.5,
  swirl: 1.2
}

const transformativeReactionDamageElement: Readonly<Partial<Record<TransformativeReaction, Element>>> = {
  bloom: "dendro",
  burning: "pyro",
  burgeon: "dendro",
  electro_charged: "electro",
  hyperbloom: "dendro",
  overload: "pyro",
  shatter: "physical",
  superconduct: "cryo"
}

const standardIcdInterval = 2.5
const standardIcdSkippedHitCount = 2
const supportedAuraElements: ReadonlySet<AuraElement> = new Set(["cryo", "hydro", "pyro", "quicken"])
const supportedElementOverrideElements: ReadonlySet<RotationElementOverrideElement> = new Set([
  "anemo",
  "cryo",
  "dendro",
  "electro",
  "geo",
  "hydro",
  "pyro"
])

interface StandardIcdState {
  readonly lastApplicationTime: number
  readonly skippedHitCount: number
}

type StandardIcdStates = Map<string, Map<string, StandardIcdState>>

type SwirlDamageElement = "cryo" | "electro" | "hydro" | "pyro"

const supportedSwirlDamageElements: ReadonlySet<SwirlDamageElement> = new Set(["cryo", "electro", "hydro", "pyro"])

/** Evaluates an ordered rotation into DPR, DPS, and an explainable trace for every damage event. */
export function evaluateRotation(input: RotationInput): RotationResult {
  if (!Number.isFinite(input.duration) || input.duration <= 0) {
    throw new Error("Rotation duration must be a positive finite number")
  }

  const effects = input.effects ?? []
  effects.forEach((effect) => validateEffectWindow(effect, input.duration))
  const elementOverrides = input.elementOverrides ?? []
  elementOverrides.forEach((override) => validateElementOverrideWindow(override, input.duration))
  validateNoOverlappingElementOverrides(elementOverrides)
  const sustainedAuras = input.sustainedAuras ?? []
  sustainedAuras.forEach((aura) => validateSustainedAuraWindow(aura, input.duration))
  validateNoOverlappingSustainedAuras(sustainedAuras)
  const standardIcdStates: StandardIcdStates = new Map()

  let previousTime = -1
  const events = input.events.map((event) => {
    if (!Number.isFinite(event.time) || event.time < 0 || event.time > input.duration) {
      throw new Error(`Event ${event.id} must occur within the declared rotation duration`)
    }
    if (event.time < previousTime) throw new Error("Rotation events must be ordered by time")
    previousTime = event.time
    const statSnapshotTime = event.statSnapshotTime ?? event.time
    if (!Number.isFinite(statSnapshotTime) || statSnapshotTime < 0 || statSnapshotTime > input.duration) {
      throw new Error(`Event ${event.id} must snapshot stats within the declared rotation duration`)
    }
    if (statSnapshotTime > event.time) {
      throw new Error(`Event ${event.id} cannot snapshot stats after its damage event`)
    }
    validateElementOverrideEvent(event)
    validateAmplifyingReactionBonus(event)
    const elementOverride = resolveRotationElementOverride(event, elementOverrides)
    const resolvedEvent = {
      ...event,
      ...(elementOverride ? { element: elementOverride.element } : {})
    }
    validateElementalApplicationEvent(resolvedEvent)
    const activeEffects = effects.filter((effect) => effectAppliesToEvent(effect, event, statSnapshotTime))
    const elementalApplication = resolveElementalApplication(
      resolvedEvent,
      sustainedAuras,
      standardIcdStates,
      elementOverride !== undefined
    )
    const result = evaluateRotationEvent(
      {
        ...resolvedEvent,
        ...(elementalApplication?.reaction ? { reaction: elementalApplication.reaction } : {}),
        stats: resolveElementDamageBonus(
          applyStatModifiers(event.stats, activeEffects.map((effect) => effect.stats)),
          resolvedEvent.element
        )
      },
      input.enemy
    )
    return {
      ...result,
      appliedEffectIds: activeEffects.map((effect) => effect.id),
      ...(elementalApplication ? { elementalApplication: elementalApplication.outcome } : {}),
      ...(elementOverride
        ? {
            elementOverride: {
              baseElement: event.element,
              element: elementOverride.element,
              id: elementOverride.id
            }
          }
        : {}),
      statSnapshotTime
    }
  })
  const dpr = events.reduce((total, event) => total + event.expectedDamage, 0)
  return { dpr, dps: dpr / input.duration, duration: input.duration, events }
}

/** Resolves the unique elemental override affecting one event at its hit time. */
export function resolveRotationElementOverride(
  event: Pick<RotationDamageEvent, "elementOverrideTarget" | "ownerId" | "time">,
  overrides: readonly RotationElementOverrideWindow[]
): RotationElementOverrideWindow | undefined {
  return overrides.find(
    (override) =>
      override.target === event.elementOverrideTarget &&
      override.start <= event.time &&
      event.time < override.end &&
      (override.ownerId === undefined || override.ownerId === event.ownerId)
  )
}

function validateElementOverrideWindow(override: RotationElementOverrideWindow, duration: number): void {
  if (override.target !== "normal_attack") {
    throw new Error(`Element override ${override.id} must target normal_attack`)
  }
  const element = (override as { readonly element: string }).element
  if (element === "physical") {
    throw new Error(`Element override ${override.id} must use a non-physical element`)
  }
  if (!isSupportedElementOverrideElement(element)) {
    throw new Error(`Element override ${override.id} uses unsupported element ${element}`)
  }
  if (
    !Number.isFinite(override.start) ||
    !Number.isFinite(override.end) ||
    override.start < 0 ||
    override.end > duration ||
    override.start >= override.end
  ) {
    throw new Error(`Element override ${override.id} must be a non-empty window within the declared rotation duration`)
  }
}

function isSupportedElementOverrideElement(element: string): element is RotationElementOverrideElement {
  return supportedElementOverrideElements.has(element as RotationElementOverrideElement)
}

function validateElementOverrideEvent(event: RotationDamageEvent): void {
  const target = (event as { readonly elementOverrideTarget?: unknown }).elementOverrideTarget
  if (target === undefined || target === "normal_attack") return
  throw new Error(`Event ${event.id} must target normal_attack for an elemental override`)
}

function validateNoOverlappingElementOverrides(overrides: readonly RotationElementOverrideWindow[]): void {
  for (let index = 0; index < overrides.length; index += 1) {
    const override = overrides[index]!
    for (let otherIndex = index + 1; otherIndex < overrides.length; otherIndex += 1) {
      const other = overrides[otherIndex]!
      const overlapsInTime = override.start < other.end && other.start < override.end
      const overlapsInOwner =
        override.ownerId === undefined || other.ownerId === undefined || override.ownerId === other.ownerId
      if (override.target === other.target && overlapsInTime && overlapsInOwner) {
        throw new Error(`Element override windows ${override.id} and ${other.id} cannot overlap for the same target owner`)
      }
    }
  }
}

function resolveElementDamageBonus(stats: RotationStats, element: Element): RotationStats {
  return {
    ...stats,
    damageBonus: stats.damageBonus + (stats.damageBonusByElement?.[element] ?? 0)
  }
}

function validateElementalApplicationEvent(event: RotationDamageEvent): void {
  if (!event.elementalApplication) return
  if (event.reaction) {
    throw new Error("An elemental application event cannot declare a legacy reaction")
  }
  const activation = (event.elementalApplication as { readonly activation?: unknown }).activation
  if (activation !== undefined && activation !== "always" && activation !== "while_element_overridden") {
    throw new Error(`Elemental application for event ${event.id} must use a supported activation`)
  }
  if (event.elementalApplication.icd.kind === "standard" && event.elementalApplication.icd.groupId.trim() === "") {
    throw new Error("A standard elemental application must declare a non-empty ICD group")
  }
  if (
    event.elementalApplication.reactionBonus !== undefined &&
    !Number.isFinite(event.elementalApplication.reactionBonus)
  ) {
    throw new Error("An elemental application reaction bonus must be finite")
  }
  if ((event.hitCount ?? 1) !== 1) {
    throw new Error("Elemental application events must represent exactly one hit")
  }
}

function validateAmplifyingReactionBonus(event: RotationDamageEvent): void {
  if (event.amplifyingReactionBonus !== undefined && !Number.isFinite(event.amplifyingReactionBonus)) {
    throw new Error(`Amplifying reaction bonus for event ${event.id} must be finite`)
  }
}

function resolveElementalApplication(
  event: RotationDamageEvent,
  sustainedAuras: readonly SustainedAuraWindow[],
  standardIcdStates: StandardIcdStates,
  hasElementOverride: boolean
): { readonly outcome: RotationElementalApplicationResult; readonly reaction?: ReactionConfig } | undefined {
  if (!event.elementalApplication) return undefined
  if (event.elementalApplication.activation === "while_element_overridden" && !hasElementOverride) {
    return { outcome: { applied: false } }
  }

  const aura = sustainedAuras.find((candidate) => candidate.start <= event.time && event.time < candidate.end)
  const applied = shouldApplyElementalApplication(event, standardIcdStates)
  const reaction = applied && aura ? getSustainedAuraReaction(event.element, aura.element) : undefined
  const reactionBonus =
    (event.elementalApplication.reactionBonus ?? 0) +
    (reaction && isAmplifyingReaction(reaction) ? (event.amplifyingReactionBonus ?? 0) : 0)
  return {
    outcome: {
      applied,
      ...(aura ? { auraElement: aura.element, auraId: aura.id } : {}),
      ...(reaction ? { reaction } : {})
    },
    ...(reaction ? { reaction: { bonus: reactionBonus, kind: reaction } } : {})
  }
}

function shouldApplyElementalApplication(event: RotationDamageEvent, states: StandardIcdStates): boolean {
  const icd = event.elementalApplication!.icd
  if (icd.kind === "none") return true

  const { groupId } = icd
  const ownerStates = states.get(event.ownerId) ?? new Map<string, StandardIcdState>()
  const currentState = ownerStates.get(groupId)

  if (
    !currentState ||
    event.time - currentState.lastApplicationTime >= standardIcdInterval ||
    currentState.skippedHitCount >= standardIcdSkippedHitCount
  ) {
    ownerStates.set(groupId, { lastApplicationTime: event.time, skippedHitCount: 0 })
    states.set(event.ownerId, ownerStates)
    return true
  }

  ownerStates.set(groupId, { ...currentState, skippedHitCount: currentState.skippedHitCount + 1 })
  return false
}

/** Resolves the reaction kind for one elemental hit against a maintained single-target aura. */
export function getSustainedAuraReaction(triggeringElement: Element, auraElement: AuraElement): RotationReaction | undefined {
  if (triggeringElement === "pyro" && auraElement === "hydro") return "vaporize_reverse"
  if (triggeringElement === "hydro" && auraElement === "pyro") return "vaporize_forward"
  if (triggeringElement === "pyro" && auraElement === "cryo") return "melt_forward"
  if (triggeringElement === "cryo" && auraElement === "pyro") return "melt_reverse"
  if (triggeringElement === "dendro" && auraElement === "quicken") return "spread"
  if (triggeringElement === "electro" && auraElement === "quicken") return "aggravate"
  if (isMaintainedNonReactivePair(triggeringElement, auraElement)) return undefined
  throw new Error(
    `Elemental application ${triggeringElement} on sustained ${auraElement} aura requires an unimplemented reaction`
  )
}

function isMaintainedNonReactivePair(triggeringElement: Element, auraElement: AuraElement): boolean {
  return (
    (auraElement !== "quicken" && triggeringElement === auraElement) ||
    (triggeringElement === "dendro" && auraElement === "cryo")
  )
}

function evaluateRotationEvent(event: RotationDamageEvent, enemy: RotationEnemyStats): RotationEventResult {
  const hitCount = event.hitCount ?? 1
  if (!Number.isInteger(hitCount) || hitCount < 1) throw new Error(`Event ${event.id} must have at least one hit`)

  if (event.reaction && isTransformativeReaction(event.reaction.kind)) {
    return evaluateTransformativeEvent(event, enemy, hitCount)
  }

  const trace: RotationTraceEntry[] = []
  let damage = resolveRotationScalingDamage(event.scaling, event.stats, trace)

  if (event.reaction && isAmplifyingReaction(event.reaction.kind)) {
    const baseMultiplier = getAmplifyingReactionBaseMultiplier(event.reaction.kind)
    const multiplier = calculateAmplifyingReactionMultiplier(event.stats.elementalMastery, {
      bonus: event.reaction.bonus,
      kind: event.reaction.kind
    })
    const before = damage
    damage *= multiplier
    trace.push({
      after: damage,
      baseMultiplier,
      before,
      bonus: event.reaction.bonus,
      elementalMastery: event.stats.elementalMastery,
      kind: "amplifying_reaction",
      multiplier,
      reaction: event.reaction.kind
    })
  }

  if (event.reaction && isAdditiveReaction(event.reaction.kind)) {
    const baseDamage = getReactionBaseDamage(event.stats.level)
    const multiplier = getAdditiveReactionBaseMultiplier(event.reaction.kind)
    const reactionDamage = calculateAdditiveReactionDamage(event.stats.level, event.stats.elementalMastery, {
      bonus: event.reaction.bonus,
      kind: event.reaction.kind
    })
    const before = damage
    damage += reactionDamage
    trace.push({
      after: damage,
      baseDamage,
      before,
      bonus: event.reaction.bonus,
      elementalMastery: event.stats.elementalMastery,
      kind: "additive_reaction",
      multiplier,
      reaction: event.reaction.kind,
      reactionDamage
    })
  }

  const damageBonusMultiplier = 1 + event.stats.damageBonus
  const damageBeforeBonus = damage
  damage *= damageBonusMultiplier
  trace.push({
    after: damage,
    before: damageBeforeBonus,
    bonus: event.stats.damageBonus,
    kind: "damage_bonus",
    multiplier: damageBonusMultiplier
  })

  const critRate = event.canCrit
    ? event.critPolicy === "guaranteed"
      ? 1
      : clamp(event.stats.critRate, 0, 1)
    : 0
  const expectedCritMultiplier = event.canCrit ? 1 + critRate * event.stats.critDamage : 1
  const critBeforeMitigation = damage * (event.canCrit ? 1 + event.stats.critDamage : 1)
  const expectedBeforeMitigation = damage * expectedCritMultiplier
  trace.push({
    after: expectedBeforeMitigation,
    before: damage,
    critDamage: event.canCrit ? event.stats.critDamage : 0,
    critRate,
    kind: "expected_crit",
    multiplier: expectedCritMultiplier
  })

  const defenseMultiplier = calculateDefenseMultiplier(
    event.stats.level,
    enemy.level,
    enemy.defenseReduction,
    event.defenseIgnore ?? 0
  )
  const defenseBefore = expectedBeforeMitigation
  const afterDefense = defenseBefore * defenseMultiplier
  trace.push({
    after: afterDefense,
    attackerLevel: event.stats.level,
    before: defenseBefore,
    defenseIgnore: event.defenseIgnore ?? 0,
    defenseReduction: enemy.defenseReduction,
    enemyLevel: enemy.level,
    kind: "defense",
    multiplier: defenseMultiplier
  })

  const baseResistance = getElementResistance(enemy, event.element)
  const resistanceReduction = event.resistanceReduction ?? 0
  const effectiveResistance = baseResistance - resistanceReduction
  const resistanceMultiplier = calculateResistanceMultiplier(effectiveResistance)
  const singleHitDamage = afterDefense * resistanceMultiplier
  const expectedDamage = singleHitDamage * hitCount
  trace.push({
    after: singleHitDamage,
    baseResistance,
    before: afterDefense,
    element: event.element,
    effectiveResistance,
    kind: "resistance",
    multiplier: resistanceMultiplier,
    resistance: effectiveResistance,
    resistanceReduction
  })
  if (hitCount > 1) {
    trace.push({ after: expectedDamage, before: singleHitDamage, hitCount, kind: "hit_count" })
  }

  return {
    appliedEffectIds: [],
    critDamage: critBeforeMitigation * defenseMultiplier * resistanceMultiplier * hitCount,
    element: event.element,
    expectedDamage,
    hitCount,
    id: event.id,
    nonCritDamage: damage * defenseMultiplier * resistanceMultiplier * hitCount,
    ownerId: event.ownerId,
    statSnapshotTime: event.statSnapshotTime ?? event.time,
    time: event.time,
    trace
  }
}

function resolveRotationScalingDamage(
  scaling: DamageScaling,
  stats: RotationStats,
  trace: RotationTraceEntry[]
): number {
  if (hasMultipleDamageScalingTerms(scaling)) {
    const terms = scaling.terms.map((term) => {
      const value = getScalingValue(stats, term.stat)
      return {
        coefficient: term.coefficient,
        contribution: value * term.coefficient,
        ...(term.label === undefined ? {} : { label: term.label }),
        stat: term.stat,
        value
      }
    })
    const flatDamage = scaling.flatDamage ?? 0
    const damage = terms.reduce((total, term) => total + term.contribution, 0) + flatDamage
    trace.push({
      after: damage,
      before: 0,
      ...(flatDamage === 0 ? {} : { flatDamage }),
      kind: "scaling_terms",
      terms
    })
    return damage
  }

  const value = getScalingValue(stats, scaling.stat)
  const flatDamage = scaling.flatDamage ?? 0
  const damage = value * scaling.coefficient + flatDamage
  trace.push({
    after: damage,
    before: 0,
    coefficient: scaling.coefficient,
    ...(flatDamage === 0 ? {} : { flatDamage }),
    kind: "scaling",
    stat: scaling.stat,
    value
  })
  return damage
}

function evaluateTransformativeEvent(
  event: RotationDamageEvent,
  enemy: RotationEnemyStats,
  hitCount: number
): RotationEventResult {
  const reaction = event.reaction
  if (!reaction || !isTransformativeReaction(reaction.kind)) throw new Error("Expected a transformative reaction")
  const multiplier = transformativeReactionMultiplier[reaction.kind]
  const damageElement = getTransformativeReactionDamageElement(reaction)
  const baseDamage = getReactionBaseDamage(event.stats.level)
  const reactionDamage =
    baseDamage *
    multiplier *
    (1 + transformativeReactionBonus(event.stats.elementalMastery, reaction.bonus))
  const flatDamageAddition = reaction.flatDamageAddition ?? 0
  const beforeResistance = (reactionDamage + flatDamageAddition) * hitCount
  const baseResistance = getElementResistance(enemy, damageElement)
  const resistanceReduction = event.resistanceReduction ?? 0
  const effectiveResistance = baseResistance - resistanceReduction
  const resistanceMultiplier = calculateResistanceMultiplier(effectiveResistance)
  const expectedDamage = beforeResistance * resistanceMultiplier
  return {
    appliedEffectIds: [],
    critDamage: expectedDamage,
    element: event.element,
    expectedDamage,
    hitCount,
    id: event.id,
    nonCritDamage: expectedDamage,
    ownerId: event.ownerId,
    statSnapshotTime: event.statSnapshotTime ?? event.time,
    time: event.time,
    trace: [
      {
        after: beforeResistance,
        baseDamage,
        before: 0,
        bonus: reaction.bonus,
        elementalMastery: event.stats.elementalMastery,
        flatDamageAddition,
        hitCount,
        kind: "transformative_reaction",
        multiplier,
        reaction: reaction.kind
      },
      {
        after: expectedDamage,
        baseResistance,
        before: beforeResistance,
        element: damageElement,
        effectiveResistance,
        kind: "resistance",
        multiplier: resistanceMultiplier,
        resistance: effectiveResistance,
        resistanceReduction
      }
    ]
  }
}

function validateEffectWindow(effect: RotationEffectWindow, duration: number): void {
  if (!Number.isFinite(effect.start) || !Number.isFinite(effect.end)) {
    throw new Error(`Effect ${effect.id} must have finite start and end times`)
  }
  if (effect.start < 0 || effect.end > duration || effect.start >= effect.end) {
    throw new Error(`Effect ${effect.id} must be a non-empty window within the declared rotation duration`)
  }
}

function validateSustainedAuraWindow(aura: SustainedAuraWindow, duration: number): void {
  if (!isSupportedAuraElement(aura.element)) {
    throw new Error(`Sustained aura ${aura.id} uses unsupported element ${aura.element}`)
  }
  if (!Number.isFinite(aura.start) || !Number.isFinite(aura.end)) {
    throw new Error(`Sustained aura ${aura.id} must have finite start and end times`)
  }
  if (aura.start < 0 || aura.end > duration || aura.start >= aura.end) {
    throw new Error(`Sustained aura ${aura.id} must be a non-empty window within the declared rotation duration`)
  }
}

function isSupportedAuraElement(element: string): element is AuraElement {
  return supportedAuraElements.has(element as AuraElement)
}

function validateNoOverlappingSustainedAuras(auras: readonly SustainedAuraWindow[]): void {
  for (let index = 0; index < auras.length; index += 1) {
    const aura = auras[index]!
    for (let otherIndex = index + 1; otherIndex < auras.length; otherIndex += 1) {
      const other = auras[otherIndex]!
      if (aura.start < other.end && other.start < aura.end) {
        throw new Error(`Sustained aura windows ${aura.id} and ${other.id} cannot overlap`)
      }
    }
  }
}

function effectAppliesToEvent(effect: RotationEffectWindow, event: RotationDamageEvent, statSnapshotTime: number): boolean {
  return (
    effect.start <= statSnapshotTime &&
    statSnapshotTime < effect.end &&
    (effect.ownerId === undefined || effect.ownerId === event.ownerId)
  )
}

function applyStatModifiers(stats: RotationStats, modifiers: readonly RotationStatModifier[]): RotationStats {
  return modifiers.reduce<RotationStats>(
    (current, modifier) => ({
      attack: current.attack + (modifier.attack ?? 0),
      critDamage: current.critDamage + (modifier.critDamage ?? 0),
      critRate: current.critRate + (modifier.critRate ?? 0),
      damageBonus: current.damageBonus + (modifier.damageBonus ?? 0),
      ...(current.damageBonusByElement ? { damageBonusByElement: current.damageBonusByElement } : {}),
      defense: current.defense + (modifier.defense ?? 0),
      elementalMastery: current.elementalMastery + (modifier.elementalMastery ?? 0),
      hp: current.hp + (modifier.hp ?? 0),
      level: current.level
    }),
    stats
  )
}

function getScalingValue(stats: RotationStats, stat: ScalingStat): number {
  if (stat === "attack") return stats.attack
  if (stat === "defense") return stats.defense
  if (stat === "hp") return stats.hp
  return stats.elementalMastery
}

function hasMultipleDamageScalingTerms(scaling: DamageScaling): scaling is MultiDamageScaling {
  return "terms" in scaling
}

function getElementResistance(enemy: RotationEnemyStats, element: Element): number {
  return enemy.resistances?.[element] ?? enemy.resistance
}

function transformativeReactionBonus(elementalMastery: number, bonus: number): number {
  return (16 * elementalMastery) / (elementalMastery + 2000) + bonus
}

function isTransformativeReaction(reaction: RotationReaction): reaction is TransformativeReaction {
  return reaction in transformativeReactionMultiplier
}

function getTransformativeReactionDamageElement(reaction: ReactionConfig): Element {
  const inferredElement = transformativeReactionDamageElement[reaction.kind as TransformativeReaction]
  if (inferredElement) {
    if (reaction.damageElement !== undefined && reaction.damageElement !== inferredElement) {
      throw new Error(
        `Transformative reaction ${reaction.kind} must use its inferred ${inferredElement} damage element`
      )
    }
    return inferredElement
  }
  if (reaction.kind === "swirl" && reaction.damageElement !== undefined) {
    if (!isSupportedSwirlDamageElement(reaction.damageElement)) {
      throw new Error("Swirl must declare a Cryo, Hydro, Pyro, or Electro damage element")
    }
    return reaction.damageElement
  }
  throw new Error(`Transformative reaction ${reaction.kind} must declare an explicit damage element`)
}

function isSupportedSwirlDamageElement(element: Element): element is SwirlDamageElement {
  return supportedSwirlDamageElements.has(element as SwirlDamageElement)
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
