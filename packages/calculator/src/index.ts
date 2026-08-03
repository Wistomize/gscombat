export type {
  AttackFlatModifier,
  AttackPercentModifier,
  CombatStats,
  DamageAction,
  DamageBonusModifier,
  DamageFilter,
  DamageScalingTerm,
  DamageStage,
  DamageTags,
  DefenseIgnoreModifier,
  Element,
  EnemyStats,
  ExpectedDamageInput,
  ExpectedDamageResult,
  Modifier,
  MultiScalingDamageAction,
  ResistanceReductionModifier,
  SingleScalingDamageAction,
  SpecialReactionKind,
  SpecialReactionTraceFormula,
  SpecialReactionTraceStage,
  TalentMultiplierModifier,
  TraceEntry
} from "./domain.js"
export { evaluateExpectedDamage } from "./evaluate.js"
export {
  calculateAdditiveReactionDamage,
  calculateAmplifyingReactionMultiplier,
  getAdditiveReactionBaseMultiplier,
  getAmplifyingReactionBaseMultiplier,
  getReactionBaseDamage,
  isAdditiveReaction,
  isAmplifyingReaction
} from "./reaction.js"
export type {
  AdditiveReaction,
  AdditiveReactionConfig,
  AmplifyingReaction,
  AmplifyingReactionConfig
} from "./reaction.js"
export {
  calculateDirectSpecialReactionDamage,
  calculateLunarReactionExpectedDamage,
  calculateLunarReactionParticipantDamage,
  getLunarReactionBaseCoefficient,
  getStellarSuperconductBaseCoefficient
} from "./special-reaction.js"
export type {
  DirectLunarReactionDamageInput,
  DirectSpecialReactionDamageInput,
  DirectSpecialReactionKind,
  DirectStellarSuperconductDamageInput,
  LunarParticipantReactionKind,
  LunarReactionCriticalOutcome,
  LunarReactionExpectedDamageInput,
  LunarReactionExpectedDamageResult,
  LunarReactionKind,
  LunarReactionParticipantDamageResult,
  LunarReactionParticipantInput,
  SpecialReactionDamageResult,
  SpecialReactionTraceEntry,
  StellarReactionKind
} from "./special-reaction.js"
export {
  evaluateRotation,
  getSustainedAuraReaction,
  resolveRotationElementOverride,
  type AuraElement,
  type DamageScaling,
  type ElementalApplicationActivation,
  type ElementalApplicationIcd,
  type NoElementalApplicationIcd,
  type ReactionConfig,
  type RotationDamageEvent,
  type RotationElementalApplication,
  type RotationElementalApplicationResult,
  type RotationElementOverrideElement,
  type RotationElementOverrideResult,
  type RotationElementOverrideTarget,
  type RotationElementOverrideWindow,
  type RotationEffectWindow,
  type RotationEventResult,
  type RotationEnemyStats,
  type RotationInput,
  type RotationReaction,
  type RotationResult,
  type RotationStatModifier,
  type RotationStats,
  type RotationTraceEntry,
  type ScalingStat,
  type StandardElementalApplicationIcd,
  type SustainedAuraWindow,
  type TransformativeReaction
} from "./rotation.js"
