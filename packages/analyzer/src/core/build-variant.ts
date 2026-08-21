import type { Element } from "@gscombat/calculator"
import type { CombatActionMetadata } from "@gscombat/content"
import { validateCharacterBuild, type CharacterBuild, type TravelerElement } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

const travelerOwnerElementSegment: Readonly<Record<TravelerElement, string>> = {
  anemo: "Anemo",
  cryo: "Cryo",
  dendro: "Dendro",
  electro: "Electro",
  geo: "Geo",
  hydro: "Hydro",
  pyro: "Pyro"
}

const supportedElements: ReadonlySet<Element> = new Set([
  "anemo",
  "cryo",
  "dendro",
  "electro",
  "geo",
  "hydro",
  "physical",
  "pyro"
])

function assertValidCharacterBuild(build: CharacterBuild): void {
  const validationErrors = validateCharacterBuild(build)
  if (validationErrors.length > 0) {
    throw new Error(`Invalid character build ${build.buildId}: ${validationErrors.join("; ")}`)
  }
}

/** Lists the gender-specific talent-table owners for one Traveler element. */
export function getTravelerTalentParameterOwnerIds(element: TravelerElement): readonly [string, string] {
  const elementSegment = travelerOwnerElementSegment[element]
  return [`Traveler${elementSegment}F`, `Traveler${elementSegment}M`]
}

function resolveTravelerTalentParameterOwnerId(build: CharacterBuild): string {
  const variant = build.variant
  if (!variant) {
    throw new Error("Traveler builds must declare an element and gender variant before resolving talent parameters")
  }
  const [femaleOwnerId, maleOwnerId] = getTravelerTalentParameterOwnerIds(variant.element)
  return variant.gender === "female" ? femaleOwnerId : maleOwnerId
}

/** Resolves the immutable talent-table owner selected by a build and optional content override. */
export function resolveTalentParameterOwnerId(action: CombatActionMetadata, build: CharacterBuild): string {
  assertValidCharacterBuild(build)
  assertTravelerElementEligibility(action, build)
  if (build.characterId !== "Traveler") return action.talentParameterOwnerId ?? build.characterId

  const variantOwnerId = resolveTravelerTalentParameterOwnerId(build)
  if (action.talentParameterOwnerId && action.talentParameterOwnerId !== variantOwnerId) {
    throw new Error(
      `Action ${action.id} owner ${action.talentParameterOwnerId} does not match the selected Traveler variant`
    )
  }
  return variantOwnerId
}

function assertTravelerElementEligibility(action: CombatActionMetadata, build: CharacterBuild): void {
  const travelerElement = action.travelerElement
  if (travelerElement === undefined) return
  if (action.characterId !== "Traveler") {
    throw new Error(`Action ${action.id} can only declare travelerElement when it belongs to Traveler`)
  }
  if (action.talentParameterOwnerId !== undefined) {
    throw new Error(`Traveler element action ${action.id} cannot declare a fixed talent parameter owner`)
  }
  if (build.characterId !== "Traveler") {
    throw new Error(`Action ${action.id} requires Traveler ${travelerElement}, not ${build.characterId}`)
  }
  if (build.variant?.element !== travelerElement) {
    throw new Error(`Action ${action.id} requires Traveler ${travelerElement}, not ${build.variant?.element}`)
  }
}

/** Resolves a build's active elemental identity without replacing its canonical character stat owner. */
export function resolveBuildElement(build: CharacterBuild, gameData: GameDataRepository): Element | null {
  assertValidCharacterBuild(build)
  if (build.characterId === "Traveler") {
    if (!build.variant) {
      throw new Error("Traveler builds must declare an element and gender variant before resolving their element")
    }
    return build.variant.element
  }
  if (build.variant) throw new Error("Only Traveler builds may declare a character variant")

  const element = gameData.getCharacter(build.characterId)?.element
  if (element === null || element === undefined) return null
  if (!supportedElements.has(element as Element)) {
    throw new Error(`Character ${build.characterId} has unsupported snapshot element ${element}`)
  }
  return element as Element
}

/** Resolves one build's maintained home region, or null when the snapshot does not declare one. */
export function resolveBuildRegion(build: CharacterBuild, gameData: GameDataRepository): string | null {
  assertValidCharacterBuild(build)
  return gameData.getCharacter(build.characterId)?.region ?? null
}

/** Counts configured party members whose maintained home region matches the requested region. */
export function resolveTeamRegionCount(
  builds: readonly CharacterBuild[],
  region: string,
  gameData: GameDataRepository
): number {
  return builds.filter((build) => resolveBuildRegion(build, gameData) === region).length
}

/** Counts party members who either match one region or differ elementally from the primary character. */
export function resolvePrimaryDifferentElementOrRegionPartyCount(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  region: string,
  gameData: GameDataRepository
): number | null {
  const primaryElement = resolveBuildElement(primary, gameData)
  const party = [primary, ...teammates]
  const elements = party.map((build) => resolveBuildElement(build, gameData))
  if (primaryElement === null || elements.some((element) => element === null)) return null
  return party.filter((build, index) =>
    resolveBuildRegion(build, gameData) === region || elements[index] !== primaryElement
  ).length
}

/** Counts distinct configured party elements, or returns null when any member lacks a known element. */
export function resolveTeamUniqueElementCount(
  builds: readonly CharacterBuild[],
  gameData: GameDataRepository
): number | null {
  const elements = builds.map((build) => resolveBuildElement(build, gameData))
  if (elements.some((element) => element === null)) return null
  return new Set(elements).size
}

/** Counts known teammates with an elemental identity different from the configured primary character. */
export function resolvePrimaryDifferentElementTeammateCount(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  gameData: GameDataRepository
): number | null {
  const primaryElement = resolveBuildElement(primary, gameData)
  const teammateElements = teammates.map((build) => resolveBuildElement(build, gameData))
  if (primaryElement === null || teammateElements.some((element) => element === null)) return null
  return teammateElements.filter((element) => element !== primaryElement).length
}

/** Counts known teammates with an elemental identity matching the configured primary character. */
export function resolvePrimarySameElementTeammateCount(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  gameData: GameDataRepository
): number | null {
  const primaryElement = resolveBuildElement(primary, gameData)
  const teammateElements = teammates.map((build) => resolveBuildElement(build, gameData))
  if (primaryElement === null || teammateElements.some((element) => element === null)) return null
  return teammateElements.filter((element) => element === primaryElement).length
}
