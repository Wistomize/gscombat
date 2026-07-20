export type Element = "anemo" | "cryo" | "dendro" | "electro" | "geo" | "hydro" | "physical" | "pyro"

export interface DamageTags {
  readonly actionId: string
  readonly element: Element
  readonly ownerId: string
  readonly talent: "burst" | "normal" | "plunge" | "skill"
}

export interface DamageAction {
  readonly canCrit: boolean
  readonly multiplier: number
  readonly tags: DamageTags
}

export interface CombatStats {
  readonly attackPercent: number
  readonly baseAttack: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  readonly flatAttack: number
  readonly level: number
}

export interface EnemyStats {
  readonly defenseReduction: number
  readonly level: number
  readonly resistance: number
}

export interface DamageFilter {
  readonly actionId?: string
  readonly element?: Element
  readonly ownerId?: string
  readonly talent?: DamageTags["talent"]
}

interface SourcedModifier {
  readonly source: string
  readonly value: number
}

export interface AttackFlatModifier extends SourcedModifier {
  readonly kind: "attack_flat"
}

export interface AttackPercentModifier extends SourcedModifier {
  readonly kind: "attack_percent"
}

export interface TalentMultiplierModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "talent_multiplier_bonus"
}

export interface DamageBonusModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "damage_bonus"
}

export interface DefenseIgnoreModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "defense_ignore"
}

export interface ResistanceReductionModifier extends SourcedModifier {
  readonly element: Element
  readonly kind: "resistance_reduction"
}

export type Modifier =
  | AttackFlatModifier
  | AttackPercentModifier
  | DamageBonusModifier
  | DefenseIgnoreModifier
  | ResistanceReductionModifier
  | TalentMultiplierModifier

export type DamageStage = "attack" | "talent" | "damage_bonus" | "crit" | "defense" | "resistance"

export interface TraceEntry {
  readonly after: number
  readonly before: number
  readonly source: string
  readonly stage: DamageStage
}

export interface ExpectedDamageInput {
  readonly action: DamageAction
  readonly enemy: EnemyStats
  readonly modifiers: readonly Modifier[]
  readonly stats: CombatStats
}

export interface ExpectedDamageResult {
  readonly critDamage: number
  readonly expectedDamage: number
  readonly nonCritDamage: number
  readonly trace: readonly TraceEntry[]
}
