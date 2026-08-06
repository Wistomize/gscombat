import {
  getCharacterBurstEnergyCost,
  listCharacterTalentLevelConstellationBonuses,
  type CombatActionEffect,
  type CombatActionEffectComputedScalar,
  type CombatActionEffectScalar,
  type CombatActionStatEffect
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"

import type {
  AppliedCombatActionEffect,
  ResolveCombatActionEffectCandidatesInput,
  ResolvedAdditionalDamageEvent,
  ResolvedFinalHpSourcedDamageBonus,
  ResolvedMatchedActionAdditiveDamageTerm
} from "./types.js"

export function resolveEffectValue(
  effect: CombatActionStatEffect,
  input: ResolveCombatActionEffectCandidatesInput,
  energyRecharge: number,
  source: CharacterBuild
): number {
  if (effect.value.kind === "fixed" || effect.value.kind === "refinement_table") {
    return resolveEffectScalar(effect.value, source)
  }
  if (effect.value.kind === "talent_parameter") {
    if (effect.source.kind !== "character") {
      throw new Error(`Talent-parameter effect ${effect.id} must use a character source`)
    }
    const parameter = resolveComputedEffectScalar(
      { kind: "talent_parameter", parameter: effect.value.parameter },
      effect.id,
      input,
      source
    )
    const constellationMultiplier = (effect.value.constellationMultiplierBonuses ?? [])
      .filter((bonus) => source.constellation >= bonus.minimumSourceConstellation)
      .reduce((total, bonus) => total + bonus.value, 0)
    return parameter * ((effect.value.multiplier ?? 1) + constellationMultiplier)
  }
  if (effect.value.kind === "final_hp") {
    const multiplier = resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    if (
      effect.target === "finalHpToFlatAttack" ||
      effect.target === "finalHpToElementalMastery" ||
      effect.target === "finalHpToDamageBonus" ||
      effect.target === "finalHpToOwnElementDamageBonus"
    ) return multiplier
    const finalHp = input.sourceFinalHpByBuildId?.get(source.buildId)
    if (finalHp === undefined) {
      throw new Error(`Source final-HP conversion ${effect.id} requires final HP for ${source.buildId}`)
    }
    const value = Math.max(finalHp + (effect.value.offset ?? 0), 0) * multiplier
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined ? value : Math.min(value, resolveEffectScalar(maximumValue, source))
  }
  if (effect.value.kind === "final_elemental_mastery") {
    const multiplier = resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    if (effect.target === "finalElementalMasteryToFlatAttack") return multiplier
    const finalElementalMastery = input.sourceFinalElementalMasteryByBuildId?.get(source.buildId)
    if (finalElementalMastery === undefined) {
      throw new Error(`Source final-elemental-mastery conversion ${effect.id} requires elemental mastery for ${source.buildId}`)
    }
    const value = Math.max(finalElementalMastery + (effect.value.offset ?? 0), 0) * multiplier
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_final_defense") {
    const finalDefense = input.sourceFinalDefenseByBuildId?.get(source.buildId)
    if (finalDefense === undefined) {
      throw new Error(`Source final-defense conversion ${effect.id} requires defense for ${source.buildId}`)
    }
    const value = Math.max(finalDefense + (effect.value.offset ?? 0), 0) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_final_attack") {
    const finalAttack = input.sourceFinalAttackByBuildId?.get(source.buildId)
    if (finalAttack === undefined) {
      throw new Error(`Source final-attack conversion ${effect.id} requires attack for ${source.buildId}`)
    }
    const value = Math.max(finalAttack + (effect.value.offset ?? 0), 0) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_base_attack") {
    const gameData = input.gameData
    if (!gameData) throw new Error(`Source base-attack effect ${effect.id} requires game data`)
    const characterAttack = gameData.getCharacterStat(source.characterId, "atk", source.level, source.ascension)
    const weaponAttack = gameData.getWeaponStat(
      source.weapon.weaponId,
      "atk",
      source.weapon.level,
      source.weapon.ascension
    )
    if (characterAttack === undefined || weaponAttack === undefined) {
      throw new Error(`Source base-attack effect ${effect.id} is missing base attack for ${source.buildId}`)
    }
    return (characterAttack + weaponAttack) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
  }
  if (effect.value.kind === "source_stat") {
    const value = (energyRecharge + (effect.value.offset ?? 0)) * resolveEffectScalar(effect.value.multiplier, source)
    const minimumValue = effect.value.minimumValue
    const maximumValue = effect.value.maximumValue
    const lowerBoundedValue = minimumValue === undefined ? value : Math.max(value, resolveEffectScalar(minimumValue, source))
    return maximumValue === undefined
      ? lowerBoundedValue
      : Math.min(lowerBoundedValue, resolveEffectScalar(maximumValue, source))
  }
  const teamBurstEnergyCost = resolveTeamBurstEnergyCost(input.primary, input.teammates, effect.id)
  const value = teamBurstEnergyCost * resolveEffectScalar(effect.value.multiplier, source)
  const maximumValue = effect.value.maximumValue
  return maximumValue === undefined ? value : Math.min(value, resolveEffectScalar(maximumValue, source))
}

export function resolveFinalHpMaximumValue(effect: CombatActionEffect, source: CharacterBuild): number | undefined {
  if (
    (effect.target !== "finalHpToDamageBonus" && effect.target !== "finalHpToOwnElementDamageBonus") ||
    effect.value.kind !== "final_hp"
  ) {
    return undefined
  }
  const maximumValue = effect.value.maximumValue
  return maximumValue === undefined ? undefined : resolveEffectScalar(maximumValue, source)
}

export function listFinalHpSourcedDamageBonuses(
  effects: readonly AppliedCombatActionEffect[],
  target: "finalHpToDamageBonus" | "finalHpToOwnElementDamageBonus"
): readonly ResolvedFinalHpSourcedDamageBonus[] {
  return effects.flatMap((effect) => {
    if (effect.target !== target) return []
    if (effect.finalHpMaximumValue === undefined) return [{ multiplier: effect.value }]
    return [{ maximumValue: effect.finalHpMaximumValue, multiplier: effect.value }]
  })
}

export function resolveAdditionalDamageEvent(
  effect: Extract<CombatActionEffect, { readonly target: "additionalDamageEvent" }>,
  source: CharacterBuild,
  input: ResolveCombatActionEffectCandidatesInput
): ResolvedAdditionalDamageEvent {
  const event = effect.value
  const expectedTriggerProbability =
    typeof event.expectedTriggerProbability === "number"
      ? event.expectedTriggerProbability
      : resolveEffectScalar(event.expectedTriggerProbability, source)
  if (
    !Number.isFinite(expectedTriggerProbability) ||
    expectedTriggerProbability < 0 ||
    expectedTriggerProbability > 1
  ) {
    throw new Error(`Additional damage event ${effect.id} must use a probability from zero to one`)
  }
  const recipientMultiplier = event.recipientFinalAttackFlatDamageMultiplier
  const sourceMultiplier = event.sourceFinalAttackFlatDamageMultiplier
  const recipientFinalAttack = input.sourceFinalAttackByBuildId?.get(input.primary.buildId)
  const sourceFinalAttack = input.sourceFinalAttackByBuildId?.get(source.buildId)
  if (recipientMultiplier !== undefined && recipientFinalAttack === undefined) {
    throw new Error(`Additional damage event ${effect.id} requires the recipient's final attack`)
  }
  if (sourceMultiplier !== undefined && sourceFinalAttack === undefined) {
    throw new Error(`Additional damage event ${effect.id} requires the source's final attack`)
  }
  const flatDamage =
    (recipientFinalAttack ?? 0) *
      (recipientMultiplier === undefined ? 0 : resolveComputedEffectScalar(recipientMultiplier, effect.id, input, source)) +
    (sourceFinalAttack ?? 0) *
      (sourceMultiplier === undefined ? 0 : resolveComputedEffectScalar(sourceMultiplier, effect.id, input, source))
  const usesRecipientNativeElement = event.element === "recipient_native"
  const element = usesRecipientNativeElement ? input.primaryElement : event.element
  if (element === undefined || (usesRecipientNativeElement && element === "physical")) {
    throw new Error(`Additional damage event ${effect.id} requires the recipient's native elemental identity`)
  }
  return {
    canCrit: event.canCrit,
    ...(event.critPolicy === undefined ? {} : { critPolicy: event.critPolicy }),
    coefficient: resolveEffectScalar(event.coefficient, source),
    element,
    expectedTriggerProbability,
    ...(flatDamage === 0 ? {} : { flatDamage }),
    id: effect.id,
    label: effect.label,
    reactionPolicy: event.reactionPolicy,
    scalingStat: event.scalingStat,
    sourceId: source.buildId
  }
}

export function resolveMatchedActionAdditiveDamageTerm(
  effect: Extract<CombatActionEffect, { readonly target: "matchedActionAdditiveDamageTerm" }>,
  source: CharacterBuild
): ResolvedMatchedActionAdditiveDamageTerm {
  return {
    coefficient: resolveEffectScalar(effect.value.coefficient, source),
    id: effect.id,
    label: effect.label,
    scalingStat: effect.value.scalingStat,
    sourceId: source.buildId
  }
}

export function resolveExpectedAdditionalDamageEventCoefficient(
  event: ResolvedAdditionalDamageEvent | undefined,
  effectId: string
): number {
  if (!event) throw new Error(`Missing resolved additional damage event ${effectId}`)
  return (event.coefficient + (event.flatDamage ?? 0)) * event.expectedTriggerProbability
}

export function resolveMatchedActionAdditiveDamageTermCoefficient(
  term: ResolvedMatchedActionAdditiveDamageTerm | undefined,
  effectId: string
): number {
  if (!term) throw new Error(`Missing resolved same-hit additive damage term ${effectId}`)
  return term.coefficient
}

function resolveEffectScalar(value: CombatActionEffectScalar, primary: CharacterBuild): number {
  if (value.kind === "fixed") return value.value
  const index = Math.min(Math.max(primary.weapon.refinement, 1), value.values.length) - 1
  return value.values[index] ?? 0
}

function resolveComputedEffectScalar(
  value: CombatActionEffectComputedScalar,
  effectId: string,
  input: ResolveCombatActionEffectCandidatesInput,
  source: CharacterBuild
): number {
  if (value.kind !== "talent_parameter") return resolveEffectScalar(value, source)
  const gameData = input.gameData
  if (!gameData) throw new Error(`Talent-parameter effect ${effectId} requires game data`)
  const reference = value.parameter
  const configuredLevel = reference.talentSlot === "passive"
    ? 1
    : reference.talentSlot === "normal"
      ? source.talents.normal
      : reference.talentSlot === "skill"
        ? source.talents.skill
        : source.talents.burst
  const travelerElement = source.variant?.kind === "traveler" ? source.variant.element : undefined
  const talentBonus = listCharacterTalentLevelConstellationBonuses(source.characterId, travelerElement)
    .filter((bonus) => bonus.talentSlot === reference.talentSlot)
    .filter((bonus) => source.constellation >= bonus.minimumSourceConstellation)
    .reduce((total, bonus) => total + bonus.value, 0)
  const talentLevel = Math.min(configuredLevel + talentBonus, 15)
  const parameter = gameData.getCharacterSkillParameter(
    source.characterId,
    reference.groupId,
    reference.parameterIndex,
    talentLevel
  )
  if (parameter === undefined) {
    throw new Error(`Missing talent parameter ${reference.id} for ${source.characterId} at level ${talentLevel}`)
  }
  return parameter * (value.multiplier ?? 1)
}

function resolveTeamBurstEnergyCost(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  effectId: string
): number {
  const party = [primary, ...teammates]
  if (party.length !== 4) {
    throw new Error(`Effect ${effectId} requires a fully configured four-character party`)
  }
  return party.reduce((total, build) => {
    const burstEnergyCost = getCharacterBurstEnergyCost(build)
    if (burstEnergyCost === undefined) {
      throw new Error(`Burst energy cost for ${build.characterId} is not maintained`)
    }
    return total + burstEnergyCost
  }, 0)
}
