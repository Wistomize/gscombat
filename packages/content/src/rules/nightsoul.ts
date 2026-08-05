import type { CharacterBuild } from "@gscombat/contracts"

export const nightsoulBlessingCharacterIds: ReadonlySet<string> = new Set([
  "Chasca",
  "Citlali",
  "Iansan",
  "Ifa",
  "Kachina",
  "Kinich",
  "Mavuika",
  "Mualani",
  "Ororon",
  "Varesa",
  "Xilonen"
])

export const nightsoulBurstCharacterIds: ReadonlySet<string> = new Set(nightsoulBlessingCharacterIds)

/** Returns whether the configured character variant can enter Nightsoul's Blessing. */
export function canEnterNightsoulBlessing(build: Pick<CharacterBuild, "characterId" | "variant">): boolean {
  if (nightsoulBlessingCharacterIds.has(build.characterId)) return true
  return build.characterId === "Traveler" && build.variant?.kind === "traveler" && build.variant.element === "pyro"
}

/** Returns whether the character contributes to the party's Nightsoul Burst cooldown tier. */
export function isNightsoulBurstCharacter(characterId: string): boolean {
  return nightsoulBurstCharacterIds.has(characterId)
}

/** Resolves the shared Nightsoul Burst cooldown from the number of Natlan party members. */
export function resolveNightsoulBurstCooldown(characterCount: number): number | null {
  if (characterCount >= 3) return 9
  if (characterCount === 2) return 12
  if (characterCount === 1) return 18
  return null
}

/** Resolves the maximum number of Nightsoul Burst triggers that can overlap inside one effect window. */
export function resolveMaximumNightsoulBurstTriggers(
  builds: readonly Pick<CharacterBuild, "ascension" | "characterId">[],
  windowSeconds?: number
): number {
  const characterCount = builds.filter((build) => isNightsoulBurstCharacter(build.characterId)).length
  const cooldown = resolveNightsoulBurstCooldown(characterCount)
  if (cooldown === null) return 0
  if (windowSeconds === undefined) return 1
  const sharedTriggers = Math.floor(windowSeconds / cooldown) + 1
  const hasXilonenIndependentTrigger = builds.some(
    (build) => build.characterId === "Xilonen" && build.ascension >= 4
  )
  const xilonenTriggers = hasXilonenIndependentTrigger ? Math.floor(windowSeconds / 14) + 1 : 0
  return sharedTriggers + xilonenTriggers
}
