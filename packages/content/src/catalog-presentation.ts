/**
 * Browser-safe Simplified Chinese presentation metadata generated from character-owned definitions.
 *
 * Combat coverage decides which actions are selectable; this module remains a stable facade for API and browser
 * consumers that must not access the game-data repository at runtime.
 */
export const characterCatalogPresentationVersion = "6.7.1"

export type { CatalogWeaponType, CharacterCatalogPresentation } from "./catalog/types.js"
export { characterCatalogPresentation } from "./registry/character-catalog.generated.js"
