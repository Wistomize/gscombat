import type { Element } from "@gscombat/calculator"

export interface CharacterDefinition {
  readonly element: Exclude<Element, "physical">
  readonly id: string
  readonly name: string
}

export interface PlaystyleDefinition {
  readonly dataStatus: "illustrative" | "verified"
  readonly id: string
  readonly memberIds: readonly string[]
  readonly primaryActionId: string
  readonly version: string
}
