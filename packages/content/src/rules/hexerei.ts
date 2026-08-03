const hexereiCharacterIds: ReadonlySet<string> = new Set([
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
])

/** Returns whether one configured character can contribute to Hexerei: Secret Rite. */
export function isHexereiCharacter(characterId: string): boolean {
  return hexereiCharacterIds.has(characterId)
}

/** Resolves the composition-only Hexerei: Secret Rite team state. */
export function hasHexereiSecretRite(characterIds: readonly string[]): boolean {
  return characterIds.filter(isHexereiCharacter).length >= 2
}
