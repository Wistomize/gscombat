import type { Element } from "@gscombat/calculator"

import type { CharacterCatalogPresentation } from "./catalog/types.js"

export interface CharacterDefinition {
  readonly catalog: CharacterCatalogPresentation
  readonly catalogOrder: number
  readonly element: Exclude<Element, "physical">
  readonly id: string
  readonly name: string
}
