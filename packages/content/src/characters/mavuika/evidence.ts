import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
    damagePartId: "sunfell-slice",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Mavuika/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sunfell-slice-base-damage",
        explanation: "The pinned sheet maps burst[0] skillDmg to the base Attack term of the Sunfell Slice.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 4.448, talentLevel: 1 },
          { expectedCoefficient: 8.0064, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "skillDmg",
        talentSlot: "burst"
      },
      {
        coefficientMultiplierScenarioParameterId: "fighting-spirit",
        coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
        explanation: "The pinned sunfell_dmgInc expression multiplies burst[2] by selected Fighting Spirit and Attack, then adds it to the same Sunfell Slice base damage.",
        groupId: "burst",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 0.016, talentLevel: 1 },
          { expectedCoefficient: 0.0288, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "sunfell_dmgInc",
        talentSlot: "burst"
      }
    ]
  },
  {
    actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
    damagePartId: "sunfell-slice",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Mavuika/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sunfell-slice-base-damage",
        explanation: "The pinned sheet maps burst[0] skillDmg to the base Attack term of the Sunfell Slice.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 4.448, talentLevel: 1 },
          { expectedCoefficient: 8.0064, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "skillDmg",
        talentSlot: "burst"
      },
      {
        coefficientMultiplierScenarioParameterId: "fighting-spirit",
        coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
        explanation: "The pinned sunfell_dmgInc expression multiplies burst[2] by selected Fighting Spirit and Attack, then adds it to the same Sunfell Slice base damage.",
        groupId: "burst",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 0.016, talentLevel: 1 },
          { expectedCoefficient: 0.0288, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "sunfell_dmgInc",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
