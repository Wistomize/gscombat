import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for fixed constellation terms used by Yumemizuki Mizuki. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
    damagePartId: "c1-awaiting-stellar-swirl-damage",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/YumemizukiMizuki/index.tsx",
      upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        explanation:
          "The reviewed C1 Radiance branch maps constellation1[4] to one independent Stellar-Swirl event at 400% Elemental Mastery.",
        fixedCoefficient: 4,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "dmgFormulas.constellation1.ssDmg"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
