export interface CharacterDefinition {
  readonly element: "electro" | "hydro" | "pyro"
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
