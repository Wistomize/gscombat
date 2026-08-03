export interface GameDataSourceManifest {
  readonly dataSha256: string
  readonly dataUrl: string
  readonly gameVersion: string
  readonly schemaVersion: number
  readonly upstreamCommit: string
  readonly upstreamCommittedAt: string
  readonly upstreamLicense: string
  readonly upstreamRepository: string
}

export interface StatCurveSource {
  readonly base: number
  readonly curve: string
  readonly key?: string
}

export interface CharacterSource {
  readonly ascensionBonus?: Readonly<Record<string, readonly number[]>>
  readonly baseStats?: Readonly<Record<string, number>>
  readonly birthday?: {
    readonly day: number
    readonly month: number
  }
  readonly ele?: string
  readonly key?: string
  readonly lvlCurves?: readonly StatCurveSource[]
  readonly rarity: number
  readonly region?: string
  readonly weaponType: string
}

export interface WeaponSource {
  readonly ascensionBonus?: Readonly<Record<string, readonly number[]>>
  readonly lvlCurves?: readonly StatCurveSource[]
  readonly rarity: number
  readonly refinementBonus?: Readonly<Record<string, unknown>>
  readonly weaponType: string
}

export interface ArtifactSetSource {
  readonly rarities: readonly number[]
  readonly setNum: readonly number[]
  readonly slots: readonly string[]
}

export interface GiStatsDocument {
  readonly art: {
    readonly data: Readonly<Record<string, ArtifactSetSource>>
    readonly main: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>>
    readonly sub: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>>
    readonly subRoll: unknown
    readonly subRollCorrection: unknown
  }
  readonly char: {
    readonly data: Readonly<Record<string, CharacterSource>>
    readonly expCurve: Readonly<Record<string, readonly number[]>>
    readonly skillParam: Readonly<Record<string, Readonly<Record<string, unknown>>>>
  }
  readonly material?: unknown
  readonly weapon: {
    readonly data: Readonly<Record<string, WeaponSource>>
    readonly expCurve: Readonly<Record<string, readonly number[]>>
  }
}

export interface GameDataCounts {
  readonly artifactSets: number
  readonly characterSkillParameterGroups: number
  readonly characterSkillParameters: number
  readonly characters: number
  readonly weapons: number
}

export interface CharacterRecord {
  readonly birthdayDay: number | null
  readonly birthdayMonth: number | null
  readonly element: string | null
  readonly id: string
  readonly rarity: number
  readonly region: string | null
  readonly weaponType: string
}

/** Summarizes the normalized numeric parameters for one raw character skill group. */
export interface CharacterSkillParameterGroupSummary {
  readonly maximumTalentLevel: number | null
  readonly minimumTalentLevel: number | null
  readonly parameterCount: number
}

export interface WeaponRecord {
  readonly id: string
  readonly rarity: number
  readonly weaponType: string
}

export interface ArtifactSetRecord {
  readonly id: string
  readonly rarities: readonly number[]
  readonly setBonuses: readonly number[]
  readonly slots: readonly string[]
}
