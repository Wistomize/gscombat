import { equipmentCombatCapabilities, getCharacterCombatDefinition, type CombatCapability, type CombatCapabilityRequirement } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { getBuildFieldPresence, type FieldContext } from "../core/field-presence.js"

/** A qualified provider and its kit evidence; never a persisted or inferred team-wide flag. */
export interface CombatCapabilityProvider {
  readonly sourceBuildId: string
  readonly recipientBuildId: string
  readonly capability: CombatCapability
}

/** Resolves declared capabilities without evaluating damage or changing the real foreground identity. */
export function findCapabilityProviders(input: {
  readonly builds: readonly CharacterBuild[]
  readonly fieldContext: FieldContext
  readonly activeEffectIds: readonly string[]
  readonly requirement: CombatCapabilityRequirement
  readonly sourceBuildId: string
  readonly recipientBuildId: string
  readonly gameData?: GameDataRepository
  readonly enemyCount?: number
  /** Reaction prerequisites are proven from unconditional application, never from their own gated follow-up. */
  readonly ignoreReactionRequirements?: boolean
}): readonly CombatCapabilityProvider[] {
  if (input.requirement.kind === "reaction_trigger") return findReactionProviders(input)
  const recipientBuildId = input.requirement.recipient === "source" ? input.sourceBuildId : input.recipientBuildId
  const providers = input.builds.flatMap((build) => {
    if (input.requirement.provider === "source" && build.buildId !== input.sourceBuildId) return []
    const capabilities = [
      ...(getCharacterCombatDefinition(build.characterId)?.capabilities ?? []),
      ...equipmentCombatCapabilities.filter((entry) => entry.weaponId === build.weapon.weaponId).map((entry) => entry.capability)
    ]
    return capabilities.flatMap((capability) => {
      if (capability.kind !== input.requirement.kind) return []
      if ((input.enemyCount ?? 1) < (capability.minimumEnemyCount ?? 1)) return []
      if (input.ignoreReactionRequirements && capability.requiredReactionFamily) return []
      if (capability.requiredReactionFamily && findReactionProviders({ ...input, requirement: {
        kind: "reaction_trigger", recipient: "source", provider: "source", reactionFamily: capability.requiredReactionFamily,
        ...(capability.requiredReactionCounterpartElements ? { counterpartElements: capability.requiredReactionCounterpartElements } : {})
      }, ignoreReactionRequirements: true }).length === 0) return []
      if (capability.requiredTeamReaction && findReactionProviders({ ...input, requirement: {
        kind: "reaction_trigger", recipient: "source", provider: "party", reactionFamily: capability.requiredTeamReaction
      } }).length === 0) return []
      if (input.requirement.specialReactions && !input.requirement.specialReactions.some((kind) => capability.specialReactions?.includes(kind))) return []
      if (input.requirement.hitKinds && !input.requirement.hitKinds.some((kind) => capability.hitKinds?.includes(kind))) return []
      if (input.requirement.elements && !input.requirement.elements.some((element) => capability.elements?.includes(element))) return []
      if (input.requirement.sustained !== undefined && capability.sustained !== input.requirement.sustained) return []
      if (build.ascension < (capability.minimumSourceAscension ?? 0)) return []
      if (build.constellation < (capability.minimumSourceConstellation ?? 0)) return []
      if (capability.travelerElement !== undefined &&
        (build.variant?.kind !== "traveler" || build.variant.element !== capability.travelerElement)) return []
      if (capability.requiredActiveEffectIds !== undefined &&
        !capability.requiredActiveEffectIds.every((id) => input.activeEffectIds.includes(id))) return []
      if (capability.sourceFieldPresence !== "any" &&
        getBuildFieldPresence(input.fieldContext, build.buildId) !== capability.sourceFieldPresence) return []
      if (capability.recipient === "self" && recipientBuildId !== build.buildId) return []
      if (capability.recipient === "on_field" && input.fieldContext.onFieldBuildId !== recipientBuildId) return []
      return [{ sourceBuildId: build.buildId, recipientBuildId, capability }]
    })
  })
  const range = input.requirement.distinctHitKinds
  if (range) {
    const kinds = new Set(providers.flatMap((provider) => provider.capability.hitKinds ?? []))
    if (input.requirement.kind === "damage_hit" && findCapabilityProviders({ ...input, requirement: {
      kind: "plunge_access", provider: "party", recipient: input.requirement.recipient
    } }).length > 0) kinds.add("plunge")
    const count = kinds.size
    if (count < range.minimum || (range.maximum !== undefined && count > range.maximum)) return []
  }
  const window = input.requirement.opportunityWindow
  if (window) {
    const count = countSkillOpportunities(input, window.seconds, window.measure)
    if (count < window.minimum || (window.maximum !== undefined && count > window.maximum)) return []
  }
  return providers
}

/** Bounded preparation opportunities, not combat timeline simulation or extra damage events. */
function countSkillOpportunities(
  input: Parameters<typeof findCapabilityProviders>[0], seconds: number, measure: "casts" | "hits"
): number {
  const source = input.builds.find((build) => build.buildId === input.sourceBuildId)
  if (!source || !input.gameData) return 0
  const query = (kind: CombatCapability["kind"]) => findCapabilityProviders({ ...input,
    requirement: { kind, provider: "source", recipient: "source", ...(kind === "damage_hit" ? { hitKinds: ["skill"] as const } : {}) }
  })
  const hits = query("damage_hit")
  if (measure === "hits" && hits.length === 0) return 0
  const owner = source.variant?.kind === "traveler"
    ? `Traveler${source.variant.element[0]!.toUpperCase()}${source.variant.element.slice(1)}${source.variant.gender === "female" ? "F" : "M"}`
    : source.characterId
  const counts = query("skill_cast").map(({ capability }) => {
    const profile = capability.skillCast
    if (!profile) return 0
    const rawCooldown = input.gameData!.getCharacterSkillParameter(owner, "skill", profile.cooldownParameterIndex, 1)
    if (rawCooldown === undefined || rawCooldown <= 0) return 0
    const cooldown = rawCooldown * (profile.cooldownMultiplier ?? 1)
    const reset = hits.length > 0 && query("skill_reset").length > 0 ? 1 : 0
    // An opportunity exactly at the window end cannot retain the first stack.
    const casts = ((profile.initialUses ?? 1) + Math.max(0, Math.ceil(seconds / cooldown) - 1) + reset) * (profile.castsPerUse ?? 1)
    return measure === "hits" ? Math.max(0, casts - (profile.nonDamagingInitialUses ?? 0)) : casts
  })
  const separatedHits = measure === "hits" ? hits.map(({ capability }) => {
    const proof = capability.skillHitOpportunities
    return proof && proof.withinSeconds <= seconds && proof.minimumSeparationSeconds >= 0.3 ? proof.count : 0
  }) : []
  return Math.max(measure === "hits" && hits.length > 0 ? 1 : 0, ...counts, ...separatedHits)
}

/** Checks application-capable source kits, rather than treating a direct special-damage metric as a trigger. */
function findReactionProviders(input: Parameters<typeof findCapabilityProviders>[0]): readonly CombatCapabilityProvider[] {
  const hits = input.builds.flatMap((build) => findCapabilityProviders({
    ...input, sourceBuildId: build.buildId, recipientBuildId: build.buildId,
    requirement: { kind: "damage_hit", provider: "source", recipient: "source" }
  }))
  const family = input.requirement.reactionFamily ?? "any"
  const hydroCrystalConverted = family === "ordinary_crystallize" && findCapabilityProviders({ ...input,
    requirement: { kind: "reaction_conversion", provider: "party", recipient: "source", specialReactions: ["lunar_crystallize"] }
  }).length > 0
  if (family === "lunar" || family === "stellar" || family === "stellar_swirl" || family === "stellar_superconduct") {
    const converters = findCapabilityProviders({ ...input, requirement: {
      kind: "reaction_conversion", provider: "party", recipient: "source"
    } })
    const conversions = new Set(converters.flatMap((provider) => provider.capability.specialReactions ?? []))
    const candidates = family === "lunar" ? ["lunar_charged", "lunar_bloom", "lunar_crystallize"] as const
      : family === "stellar" ? ["stellar_swirl", "stellar_superconduct"] as const : [family]
    return candidates.flatMap((kind) => {
      if (!conversions.has(kind)) return []
      const pairs = kind === "lunar_charged" ? [["hydro", "electro"], ["electro", "hydro"]] as const
        : kind === "lunar_bloom" ? [["dendro", "hydro"], ["hydro", "dendro"]] as const
        : kind === "lunar_crystallize" ? [["geo", "hydro"], ["hydro", "geo"]] as const
        : kind === "stellar_superconduct" ? [["cryo", "electro"], ["electro", "cryo"]] as const
        : [["anemo", "cryo"]] as const
      return hits.filter((provider) => (input.requirement.provider !== "source" || provider.sourceBuildId === input.sourceBuildId) &&
        pairs.some(([element, counterpart]) => provider.capability.elements?.includes(element) &&
          hits.some((other) => other.sourceBuildId !== provider.sourceBuildId && other.capability.elements?.includes(counterpart))))
    })
  }
  const availableElements = new Set(hits.flatMap((provider) => provider.capability.elements ?? []))
  const sourceIds = input.requirement.provider === "source" ? [input.sourceBuildId] : input.builds.map((build) => build.buildId)
  return hits.filter((provider) => sourceIds.includes(provider.sourceBuildId) &&
    provider.capability.elements?.some((element) => {
      if (input.requirement.elements && !input.requirement.elements.includes(element)) return false
      if (family === "bloom_family" && (element === "electro" || element === "pyro")) {
        return availableElements.has("hydro") && availableElements.has("dendro")
      }
      return hits.some((other) => other.sourceBuildId !== provider.sourceBuildId &&
        other.capability.elements?.some((counterpart) =>
          !(hydroCrystalConverted && counterpart === "hydro") &&
          (!input.requirement.reactionElements || input.requirement.reactionElements.includes(element) || input.requirement.reactionElements.includes(counterpart)) &&
          (!input.requirement.counterpartElements || input.requirement.counterpartElements.includes(counterpart)) &&
          canPrepareReaction(element, counterpart, family)))
    }))
}

/** Element-pair eligibility only: no enemy aura, trigger counts or frame-window simulation is inferred. */
function canPrepareReaction(
  element: NonNullable<CombatCapability["elements"]>[number],
  counterpart: NonNullable<CombatCapability["elements"]>[number],
  family: NonNullable<CombatCapabilityRequirement["reactionFamily"]>
): boolean {
  const swirlable = ["pyro", "hydro", "electro", "cryo"]
  const pair = [element, counterpart].sort().join("+")
  if (family === "swirl") return element === "anemo" && swirlable.includes(counterpart)
  if (family === "crystallize" || family === "ordinary_crystallize") return element === "geo" && swirlable.includes(counterpart)
  if (family === "bloom" || family === "bloom_family") return pair === "dendro+hydro"
  if (family === "burning") return pair === "dendro+pyro"
  if (family === "superconduct") return pair === "cryo+electro"
  if (element === "anemo" || element === "geo") return swirlable.includes(counterpart)
  return ["cryo+electro", "cryo+hydro", "cryo+pyro", "electro+hydro", "electro+pyro",
    "hydro+pyro", "dendro+hydro", "dendro+pyro", "dendro+electro"].includes(pair)
}
