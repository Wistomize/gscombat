export type MoonsignLevel = "none" | "nascent_gleam" | "ascendant_gleam"

export const moonsignCharacterIds = new Set([
  "Aino",
  "Columbina",
  "Flins",
  "Illuga",
  "Ineffa",
  "Jahoda",
  "Lauma",
  "Linnea",
  "Nefer",
  "Zibai"
])

/** Returns whether the versioned character roster grants one party Moonsign count. */
export function isMoonsignCharacter(characterId: string): boolean {
  return moonsignCharacterIds.has(characterId)
}

/** Derives the official Moonsign level from the number of Moonsign party members. */
export function resolveMoonsignLevel(characterCount: number): MoonsignLevel {
  if (characterCount >= 2) return "ascendant_gleam"
  if (characterCount === 1) return "nascent_gleam"
  return "none"
}
