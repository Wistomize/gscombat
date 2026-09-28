import { equipmentCombatCapabilities, getCharacterCombatDefinition, getCharacterBurstEnergyCost, type CombatCapability, type CombatCapabilityRequirement } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { getBuildFieldPresence, type FieldContext } from "../core/field-presence.js"
import { resolveBuildElement } from "../core/build-variant.js"
import { countArtifactSet } from "../core/artifact-stats.js"

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
  if (input.requirement.recipientOtherThanSource) {
    return input.builds.filter((build) => build.buildId !== input.sourceBuildId).flatMap((build) =>
      findCapabilityProviders({ ...input, recipientBuildId: build.buildId,
        requirement: { ...input.requirement, recipientOtherThanSource: false, recipient: "recipient" } }))
  }
  if (input.requirement.kind === "reaction_trigger") return findReactionProviders(input)
  if (input.requirement.kind === "elemental_normal_hit") {
    const hits = findCapabilityProviders({ ...input, requirement: { ...input.requirement,
      kind: "damage_hit", provider: "source", hitKinds: input.requirement.hitKinds ?? ["normal"],
      elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] } })
    const source = input.builds.find((build) => build.buildId === input.sourceBuildId)
    const melee = source && ["sword", "claymore", "polearm"].includes(
      input.gameData?.getWeapon(source.weapon.weaponId)?.weaponType ?? "")
    return [...hits, ...(melee ? findCapabilityProviders({ ...input,
      requirement: { kind: "normal_attack_infusion", provider: "party", recipient: "source" } }) : [])]
  }
  const recipientBuildId = input.requirement.recipient === "source" ? input.sourceBuildId : input.recipientBuildId
  const recipient = input.builds.find((build) => build.buildId === recipientBuildId)
  const ownKitHealingOnly = recipient !== undefined &&
    getCharacterCombatDefinition(recipient.characterId)?.healingReception === "own_kit_only"
  const providers = input.builds.flatMap((build) => {
    if (input.requirement.provider === "source" && build.buildId !== input.sourceBuildId) return []
    if (input.requirement.excludeSourceProvider && build.buildId === input.sourceBuildId) return []
    const characterCapabilities = getCharacterCombatDefinition(build.characterId)?.capabilities ?? []
    const capabilities = [
      ...characterCapabilities,
      ...equipmentCombatCapabilities.filter((entry) => "weaponId" in entry ? entry.weaponId === build.weapon.weaponId
        : countArtifactSet(build, entry.artifactSetId) >= entry.minimumPieces).map((entry) => entry.capability)
    ]
    return capabilities.flatMap((capability) => {
      if (capability.kind !== input.requirement.kind) return []
      if (capability.requiresParticlePickup && (input.fieldContext.onFieldBuildId !== build.buildId ||
        findCapabilityProviders({ ...input, requirement: { kind: "particle_generation", provider: "party", recipient: "source" } }).length === 0)) return []
      if (capability.kind === "energy_spend" && (getCharacterBurstEnergyCost(build) ?? 0) < 15) return []
      if (capability.kind === "healing" && ownKitHealingOnly &&
        (build.buildId !== recipientBuildId || !characterCapabilities.includes(capability))) return []
      if ((input.enemyCount ?? 1) < (capability.minimumEnemyCount ?? 1)) return []
      if (input.ignoreReactionRequirements && capability.requiredReactionFamily) return []
      if (capability.requiredReactionFamily && findReactionProviders({ ...input, requirement: {
        kind: "reaction_trigger", recipient: "source", provider: "source", reactionFamily: capability.requiredReactionFamily,
        ...(capability.requiredReactionCounterpartElements ? { counterpartElements: capability.requiredReactionCounterpartElements } : {})
      }, ignoreReactionRequirements: true }).length === 0) return []
      if (capability.requiredTeamReaction && findReactionProviders({ ...input, requirement: {
        kind: "reaction_trigger", recipient: "source", provider: "party", reactionFamily: capability.requiredTeamReaction,
        ...(capability.requiredTeamSpecialReactions ? { specialReactions: capability.requiredTeamSpecialReactions } : {})
      } }).length === 0) return []
      if (input.requirement.specialReactions && !input.requirement.specialReactions.some((kind) => capability.specialReactions?.includes(kind))) return []
      if (input.requirement.hitKinds && !input.requirement.hitKinds.some((kind) => capability.hitKinds?.includes(kind))) return []
      if (input.requirement.elements && !input.requirement.elements.some((element) => capability.elements?.includes(element))) return []
      if (input.requirement.sustained !== undefined && capability.sustained !== input.requirement.sustained) return []
      if (build.ascension < (capability.minimumSourceAscension ?? 0)) return []
      if (build.constellation < (capability.minimumSourceConstellation ?? 0)) return []
      if (capability.minimumPartyElementCount) {
        const gate = capability.minimumPartyElementCount
        if (!input.gameData || input.builds.filter((member) =>
          gate.elements.includes(resolveBuildElement(member, input.gameData!) as NonNullable<CombatCapability["elements"]>[number])).length < gate.count) return []
      }
      if (capability.travelerElement !== undefined &&
        (build.variant?.kind !== "traveler" || build.variant.element !== capability.travelerElement)) return []
      if (capability.requiredActiveEffectIds !== undefined &&
        !capability.requiredActiveEffectIds.every((id) => input.activeEffectIds.includes(id))) return []
      if (capability.sourceFieldPresence !== "any" &&
        getBuildFieldPresence(input.fieldContext, build.buildId) !== capability.sourceFieldPresence) return []
      const describesOwnAction = ["damage_hit", "skill_cast", "skill_reset", "special_reaction_damage", "energy_spend"].includes(capability.kind)
      if (!describesOwnAction && capability.recipient === "self" && recipientBuildId !== build.buildId) return []
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
    const count = input.requirement.kind === "energy_spend" ? providers.reduce((sum, { capability, sourceBuildId }) => {
      const profile = capability.energySpend
      if (!profile) return sum
      if ("withinSeconds" in profile) return sum + (profile.withinSeconds <= window.seconds ? profile.count : 0)
      const build = input.builds.find((member) => member.buildId === sourceBuildId)
      if (!build || !input.gameData) return sum
      const cooldown = input.gameData.getCharacterSkillParameter(build.characterId, "burst", profile.burstCooldownParameterIndex, 1)
      return sum + (cooldown && cooldown > 0 ? Math.ceil(window.seconds / cooldown) : 0)
    }, 0) : countSkillOpportunities(input, window)
    if (count < window.minimum || (window.maximum !== undefined && count > window.maximum)) return []
  }
  return providers
}

/** Bounded preparation opportunities, not combat timeline simulation or extra damage events. */
function countSkillOpportunities(
  input: Parameters<typeof findCapabilityProviders>[0], window: NonNullable<CombatCapabilityRequirement["opportunityWindow"]>
): number {
  const { seconds, measure } = window
  const source = input.builds.find((build) => build.buildId === input.sourceBuildId)
  if (!source || !input.gameData) return 0
  const hitKinds = input.requirement.hitKinds ?? ["skill"]
  const query = (kind: CombatCapability["kind"]) => findCapabilityProviders({ ...input,
    requirement: { kind, provider: "source", recipient: "source", ...(kind === "damage_hit" ? { hitKinds } : {}) }
  })
  const hits = query("damage_hit")
  if (measure === "hits" && hits.length === 0) return 0
  const owner = source.variant?.kind === "traveler"
    ? `Traveler${source.variant.element[0]!.toUpperCase()}${source.variant.element.slice(1)}${source.variant.gender === "female" ? "F" : "M"}`
    : source.characterId
  const counts = (measure === "casts" || hitKinds.includes("skill") ? query("skill_cast") : []).map(({ capability }) => {
    const profile = capability.skillCast
    if (!profile) return 0
    const rawCooldown = input.gameData!.getCharacterSkillParameter(owner, "skill", profile.cooldownParameterIndex, 1)
    if (rawCooldown === undefined || rawCooldown <= 0) return 0
    const cooldown = rawCooldown * (profile.cooldownMultiplier ?? 1)
    if (measure === "casts" && window.refreshableMaximum !== undefined && cooldown < seconds) return window.refreshableMaximum
    const reset = hits.length > 0 && query("skill_reset").length > 0 ? 1 : 0
    // An opportunity exactly at the window end cannot retain the first stack.
    const casts = ((profile.initialUses ?? 1) + Math.max(0, Math.ceil(seconds / cooldown) - 1) + reset) * (profile.castsPerUse ?? 1)
    return measure === "hits" ? Math.max(0, casts - (profile.nonDamagingInitialUses ?? 0)) : casts
  })
  const separatedHits = measure === "hits" ? hits.map(({ capability }) => {
    const proof = capability.hitOpportunities ?? (hitKinds.includes("skill") ? capability.skillHitOpportunities : undefined)
    return proof && proof.withinSeconds <= seconds &&
      proof.minimumSeparationSeconds >= (window.minimumSeparationSeconds ?? 0.3) ? proof.count : 0
  }) : []
  const opportunities = Math.max(measure === "hits" && hits.length > 0 ? 1 : 0, ...counts, ...separatedHits)
  // Only a consumer explicitly accepting simultaneous hits may use the configured target count.
  return opportunities * (measure === "hits" && window.minimumSeparationSeconds === 0 ? input.enemyCount ?? 1 : 1)
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
      if (input.requirement.specialReactions && !input.requirement.specialReactions.includes(kind)) return []
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
  if (family === "electro_charged") return pair === "electro+hydro"
  if (family === "swirl") return element === "anemo" && swirlable.includes(counterpart)
  if (family === "crystallize" || family === "ordinary_crystallize") return element === "geo" && swirlable.includes(counterpart)
  if (family === "bloom" || family === "bloom_family") return pair === "dendro+hydro"
  if (family === "burning") return pair === "dendro+pyro"
  if (family === "superconduct") return pair === "cryo+electro"
  if (element === "anemo" || element === "geo") return swirlable.includes(counterpart)
  return ["cryo+electro", "cryo+hydro", "cryo+pyro", "electro+hydro", "electro+pyro",
    "hydro+pyro", "dendro+hydro", "dendro+pyro", "dendro+electro"].includes(pair)
}
