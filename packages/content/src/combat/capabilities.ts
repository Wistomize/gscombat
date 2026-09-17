import type { TravelerElement } from "@gscombat/contracts"
import type { CombatActionEffect, CombatDirectSpecialReactionConfig } from "./types.js"
import type { CharacterDefinition } from "../types.js"

/** Presence is a property of a scenario or a preparation, never a saved build. */
export type CombatFieldPresence = "on_field" | "off_field" | "any"

/** Only maintained capabilities consumed by effects belong here; possession is not a trigger history. */
export interface CombatCapability {
  readonly id: string
  readonly label: string
  readonly kind: "hp_loss" | "healing" | "shield" | "bond_of_life_change" | "damage_taken" | "damage_hit" | "reaction_conversion" | "special_reaction_damage" | "plunge_access" | "skill_cast" | "skill_reset"
  readonly skillCast?: {
    readonly cooldownParameterIndex: number
    readonly initialUses?: number
    /** Preparation-only casts such as entering a stance do not themselves count as E hits. */
    readonly nonDamagingInitialUses?: number
    readonly castsPerUse?: number
    readonly cooldownMultiplier?: number
  }
  /** Bounded kit evidence, not an estimated frame interval or enemy-count multiplier. */
  readonly skillHitOpportunities?: {
    readonly withinSeconds: number
    readonly count: number
    readonly minimumSeparationSeconds: number
  }
  readonly specialReactions?: readonly CombatDirectSpecialReactionConfig["kind"][]
  readonly requiredTeamReaction?: "stellar" | "stellar_swirl" | "stellar_superconduct"
  readonly requiredReactionFamily?: "any"
  readonly requiredReactionCounterpartElements?: readonly TravelerElement[]
  readonly minimumEnemyCount?: number
  /** Actual hit categories, not the talent page containing their multipliers. */
  readonly hitKinds?: readonly ("normal" | "charged" | "plunge" | "skill" | "burst")[]
  readonly elements?: readonly TravelerElement[]
  readonly recipient: "self" | "on_field" | "party"
  readonly sourceFieldPresence: CombatFieldPresence
  readonly minimumSourceAscension?: number
  readonly minimumSourceConstellation?: number
  readonly requiredActiveEffectIds?: readonly string[]
  readonly travelerElement?: TravelerElement
  /** Sustained describes the kit mechanism, not a simulated count of ticks. */
  readonly sustained: boolean
}

/** Query the affected build separately from the provider; another member's self-only ability cannot qualify it. */
export interface CombatCapabilityRequirement {
  readonly kind: CombatCapability["kind"] | "reaction_trigger"
  /** Composition-qualified reaction preparation, not the selected metric's damage formula. */
  readonly reactionFamily?: "any" | "swirl" | "bloom" | "bloom_family" | "burning" | "crystallize" | "ordinary_crystallize" | "superconduct" | "lunar" | "stellar" | "stellar_swirl" | "stellar_superconduct"
  readonly specialReactions?: CombatCapability["specialReactions"]
  readonly distinctHitKinds?: { readonly minimum: number; readonly maximum?: number }
  readonly opportunityWindow?: { readonly seconds: number; readonly minimum: number; readonly maximum?: number; readonly measure: "casts" | "hits" }
  readonly counterpartElements?: readonly TravelerElement[]
  readonly reactionElements?: readonly TravelerElement[]
  readonly recipient: "source" | "recipient"
  readonly provider?: "source" | "party"
  readonly sustained?: boolean
  readonly present?: boolean
  /** At least one requested category must be supplied by the same qualified capability. */
  readonly hitKinds?: CombatCapability["hitKinds"]
  readonly elements?: readonly TravelerElement[]
}

/** Declares kit-owned hit evidence; callers explicitly choose categories and sustained availability. */
export function declareHitCapability(
  id: string, label: string, hitKinds: NonNullable<CombatCapability["hitKinds"]>,
  elements: readonly TravelerElement[], sustained = false, sourceFieldPresence: CombatFieldPresence = "any"
): CombatCapability {
  return { id, label, kind: "damage_hit", recipient: "self", hitKinds, elements, sustained, sourceFieldPresence }
}

/** References the pinned skill cooldown rather than persisting derived ten-second stack counts. */
export function declareSkillCastCapability(
  id: string, cooldownParameterIndex: number, options: Omit<NonNullable<CombatCapability["skillCast"]>, "cooldownParameterIndex"> = {}
): CombatCapability {
  return { id: `${id}.kit.skill-cast`, label: "元素战技冷却/充能/连段施放准备", kind: "skill_cast", recipient: "self",
    sourceFieldPresence: "any", sustained: false, skillCast: { cooldownParameterIndex, ...options } }
}

/** Equipment-owned capabilities share the same qualification model as character kits. */
export interface CombatEquipmentCapability {
  readonly weaponId: string
  readonly capability: CombatCapability
}

/** Intrinsic weapon attacks, without assuming an infusion or a plunge-enabling scenario. */
export function declareWeaponHitCapabilities(character: CharacterDefinition): readonly CombatCapability[] {
  const type = character.catalog.weaponType
  return [
    declareHitCapability(`${character.id}.weapon.normal-hit`, "固有武器普攻命中能力", ["normal"],
      type === "catalyst" ? [character.element] : []),
    declareHitCapability(`${character.id}.weapon.charged-hit`, "固有武器重击命中能力", ["charged"],
      type === "catalyst" || type === "bow" ? [character.element] : [])
  ]
}

/** A bounded static preparation: original durations are evidence, not a new timer or event log. */
export type CombatEffectLifecycle =
  | { readonly kind: "constant" }
  | { readonly kind: "any_of"; readonly alternatives: readonly CombatEffectLifecycle[] }
  | {
      readonly kind: "conditional"
      readonly trigger: {
        readonly event: "none" | "skill_cast" | "burst_cast" | "capability"
        readonly sourceFieldPresence: CombatFieldPresence
        readonly capability?: CombatCapabilityRequirement
      }
      readonly preparation: "qualified" | "selected" | "qualified_or_selected"
      /** For a selectable default: only an applicable capability permits automatic preparation. */
      readonly defaultCapability?: CombatCapabilityRequirement
      /** Explicit alternatives (including zero) suppress this automatic default, scoped to the wearer. */
      readonly manualAlternatives?: readonly string[]
      readonly retention: "retain_on_exit" | "clear_on_exit" | "while_applicable"
      readonly applicability?: {
        readonly sourceFieldPresence?: CombatFieldPresence
        readonly recipientFieldPresence?: CombatFieldPresence
        /** Static composition requirement, not a claim that the enemy has an aura. */
        readonly teamElements?: readonly TravelerElement[]
        readonly energyResource?: "elemental" | "special"
        readonly targetFrozen?: true
        readonly sourceHomework?: true
        readonly hexereiSecretRite?: boolean
        readonly elementRelationship?: { readonly element: TravelerElement; readonly includeOnField: boolean }
      }
      readonly explanation: string
    }
  | { readonly kind: "excluded"; readonly reason: string }

/** Declares a reviewed current-foreground rule, without a switch-out grace-period approximation. */
export function whileSourceOnField(explanation: string): CombatEffectLifecycle {
  return {
    kind: "conditional", preparation: "qualified", retention: "while_applicable",
    trigger: { event: "none", sourceFieldPresence: "any" },
    applicability: { sourceFieldPresence: "on_field" }, explanation
  }
}

/** Declares the ordinary skill preparation shared by post-cast buffs; it does not assert a skill hit. */
export function afterSkillUntilExit(explanation: string): CombatEffectLifecycle {
  return {
    kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
    trigger: { event: "skill_cast", sourceFieldPresence: "on_field" }, explanation
  }
}

/** Rejects inconsistent lifecycle declarations when the content registry is loaded. */
export function assertCombatEffectLifecycles(effects: readonly CombatActionEffect[]): void {
  const definitions = new Map(effects.map((effect) => [effect.id, effect]))
  const leaves = (lifecycle: CombatEffectLifecycle | undefined): readonly CombatEffectLifecycle[] =>
    lifecycle?.kind === "any_of" ? lifecycle.alternatives.flatMap(leaves) : lifecycle ? [lifecycle] : []
  for (const effect of effects) {
    for (const lifecycle of leaves(effect.lifecycle)) {
      if (lifecycle.kind !== "conditional") continue
      if ((effect.requiresSourceOnField && lifecycle.applicability?.sourceFieldPresence === "off_field") ||
        (effect.requiresRecipientOnField && lifecycle.applicability?.recipientFieldPresence === "off_field")) {
        throw new Error(`Conflicting field restrictions for ${effect.id}`)
      }
      if (lifecycle.preparation === "qualified_or_selected" && !lifecycle.defaultCapability) {
        throw new Error(`Selectable automatic preparation requires a default capability: ${effect.id}`)
      }
      for (const id of lifecycle.manualAlternatives ?? []) {
        const alternative = definitions.get(id)
        if (!alternative || !effect.exclusivity || alternative.exclusivity?.group !== effect.exclusivity.group ||
          alternative.source.kind !== effect.source.kind || alternative.activation !== "active") {
          throw new Error(`Invalid manual preparation alternative ${id} for ${effect.id}`)
        }
      }
    }
  }
}
