import type { CharacterCombatCoverage } from "../../combat/types.js"

import { varesaDefinition } from "./definition.js"

export const varesaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Varesa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.467784, talentLevel: 1 },
            { expectedCoefficient: 0.842011, talentLevel: 10 }
          ]
        }
      ],
      element: varesaDefinition.element,
      evaluator: "declared_direct",
      id: "varesa.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Varesa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "riding-the-night-rainbow-rush-damage",
          id: "riding-the-night-rainbow-tap-rush",
          snapshotChecks: [
            { expectedCoefficient: 0.7448, talentLevel: 1 },
            { expectedCoefficient: 1.34064, talentLevel: 10 }
          ]
        }
      ],
      element: varesaDefinition.element,
      evaluator: "declared_direct",
      id: "varesa.skill.riding_the_night_rainbow.tap_rush",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "riding-the-night-rainbow-rush-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Varesa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "guardian-of-the-sacred-mountain-kick-damage",
          id: "guardian-of-the-sacred-mountain-kick",
          snapshotChecks: [
            { expectedCoefficient: 3.4512, talentLevel: 1 },
            { expectedCoefficient: 6.21216, talentLevel: 10 }
          ]
        }
      ],
      element: varesaDefinition.element,
      evaluator: "declared_direct",
      id: "varesa.burst.guardian_of_the_sacred_mountain.kick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "guardian-of-the-sacred-mountain-kick-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "plunge",
      characterId: "Varesa",
      damageKind: "direct",
      damageParts: [
        {
          id: "fiery-passion-high-plunge-with-follow-up-strike",
          scalingTerms: [
            {
              coefficientParameterId: "fiery-passion-high-plunge-impact-damage",
              snapshotChecks: [
                { expectedCoefficient: 2.794334, talentLevel: 1 },
                { expectedCoefficient: 5.523683, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "rainbow-upon-the-burning-mountain-fiery-passion-impact-bonus",
              snapshotChecks: [{ expectedCoefficient: 1.8, talentLevel: 1 }],
              stat: "attack"
            }
          ]
        }
      ],
      element: varesaDefinition.element,
      evaluator: "declared_direct",
      id: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "fiery-passion-high-plunge-impact-damage",
          parameterIndex: 15,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive1",
          id: "rainbow-upon-the-burning-mountain-fiery-passion-impact-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "plunge"
    }
  ],
  characterId: "Varesa",
  metrics: [
    {
      actionId: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
      characterId: "Varesa",
      id: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
      kind: "damage",
      label: "炽热激情 / 高空下落冲击 + 燃烧的山丘上的彩虹（C0、无预设反应）",
      sourceActionId: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one non-Fiery Passion tap Riding the Night-Rainbow rush, and Guardian of the Sacred Mountain's kick remain verified baseline C0 attack-scaling Electro hits. The selected core action is exactly one High Plunge impact while Fiery Passion is already active and the A1 Follow-Up Strike from The Rainbow Upon the Burning Mountain is fulfilled: Attack × [auto[15] + passive1[1]]. The pinned 6.7 snapshot gives auto[15] as 279.4334% Attack at Normal Talent Level 1 and 552.3683% at Level 10, and fixed passive1[1] as an additional 180% Attack. The fixed Genshin Optimizer sheet maps auto[15] to Fiery Passion's high plunge impact and applies passive1[1] to the same pre-multiplier. This is one named static precondition, not a state-machine or rotation. It does not preset a target aura or reaction. The burst's target count, Nightsoul restoration, Fiery Passion Flying Kick, Apex Drive, Volcano Kablam, A4, constellations, other Follow-Up Strike variants, timing, external effects, and other character states remain excluded.",
  label: varesaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "normal", value: 3 }
  ]
}
