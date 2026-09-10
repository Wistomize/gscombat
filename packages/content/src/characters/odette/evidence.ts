import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** C1 extra hits reviewed separately from the talent-scaled Coda ending hit. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "odette.skill.adagio_coda_at_dawn.final_hit.stellar_superconduct",
    damagePartId: "c1-additional-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Odette/index.tsx",
      upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [{
      explanation: "C1 constellation1[3] supplies a separate 300% Attack Stellar-Conduct hit, unlocked at C1.",
      fixedCoefficient: 3,
      minimumSourceConstellation: 1,
      stat: "attack",
      symbol: "constellation1.stellarconduct_dmg"
    }]
  },
  {
    actionId: "odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl",
    damagePartId: "c1-additional-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Odette/index.tsx",
      upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [{
      explanation: "C1 constellation1[4] supplies a separate 450% Attack Stellar-Swirl hit, unlocked at C1.",
      fixedCoefficient: 4.5,
      minimumSourceConstellation: 1,
      stat: "attack",
      symbol: "constellation1.stellarswirl_dmg"
    }]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
