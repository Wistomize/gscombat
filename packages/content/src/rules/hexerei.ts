export const HEXEREI_CHARACTER_IDS = [
  "Albedo",
  "Durin",
  "Fischl",
  "Klee",
  "Lohen",
  "Mona",
  "Nicole",
  "Prune",
  "Razor",
  "Sucrose",
  "Varka",
  "Venti"
] as const

/** Maintainer-owned audit classification for every current Hexerei locked passive. */
export const HEXEREI_SECRET_RITE_MECHANISM_COVERAGE = [
  { characterId: "Albedo", impact: "current_action" },
  { characterId: "Durin", impact: "current_action" },
  { characterId: "Fischl", impact: "current_action" },
  { characterId: "Klee", impact: "current_action" },
  { characterId: "Lohen", impact: "current_action" },
  { characterId: "Mona", impact: "current_action" },
  { characterId: "Nicole", impact: "current_action" },
  { characterId: "Prune", impact: "current_action" },
  { characterId: "Razor", impact: "current_action" },
  { characterId: "Sucrose", impact: "current_action" },
  { characterId: "Varka", impact: "timing_only" },
  { characterId: "Venti", impact: "current_action" }
] as const

const hexereiCharacterIds: ReadonlySet<string> = new Set(HEXEREI_CHARACTER_IDS)

/** Returns whether one configured character can contribute to Hexerei: Secret Rite. */
export function isHexereiCharacter(characterId: string): boolean {
  return hexereiCharacterIds.has(characterId)
}

/** Resolves the composition-only Hexerei: Secret Rite team state. */
export function hasHexereiSecretRite(characterIds: readonly string[]): boolean {
  return characterIds.filter(isHexereiCharacter).length >= 2
}
