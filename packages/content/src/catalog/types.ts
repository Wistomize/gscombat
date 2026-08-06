/** Weapon categories exposed by the browser-safe character and equipment catalog. */
export type CatalogWeaponType = "bow" | "catalyst" | "claymore" | "polearm" | "sword"

/** Browser-safe official presentation owned by one character definition. */
export interface CharacterCatalogPresentation {
  readonly characterId: string
  readonly label: string
  readonly primaryActionLabels?: Readonly<Record<string, string>>
  readonly weaponType: CatalogWeaponType
}
