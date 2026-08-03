import type { CharacterCombatCoverage } from "../../combat/types.js"

import { mavuikaDefinition } from "./definition.js"

export const mavuikaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.80035, talentLevel: 1 },
            { expectedCoefficient: 1.582088, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "mavuika.normal.auto.first_hit",
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
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "the-named-moment-skill-damage",
          id: "the-named-moment-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.744, talentLevel: 1 },
            { expectedCoefficient: 1.3392, talentLevel: 10 }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.skill.the_named_moment.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "the-named-moment-skill-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          id: "sunfell-slice",
          scalingTerms: [
            {
              coefficientParameterId: "sunfell-slice-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 4.448, talentLevel: 1 },
                { expectedCoefficient: 8.0064, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "fighting-spirit",
              coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
              snapshotChecks: [
                { expectedCoefficient: 0.016, talentLevel: 1 },
                { expectedCoefficient: 0.0288, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          kind: "flat",
          minimumSourceAscension: 4,
          scenarioParameterMultiplier: {
            base: 0,
            parameterId: "fighting-spirit",
            perParameterValue: 1
          },
          snapshotChecks: [{ expectedCoefficient: 0.0001, talentLevel: 1 }],
          target: "damageBonus",
          valueMultiplier: 20
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sunfell-slice-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "sunfell-slice-damage-increase-per-fighting-spirit",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 200,
          id: "fighting-spirit",
          label: "战意（手填整数，100 至 200；默认满战意）",
          maximumValue: 200,
          minimumValue: 100
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          id: "sunfell-slice",
          scalingTerms: [
            {
              coefficientParameterId: "sunfell-slice-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 4.448, talentLevel: 1 },
                { expectedCoefficient: 8.0064, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "fighting-spirit",
              coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
              snapshotChecks: [
                { expectedCoefficient: 0.016, talentLevel: 1 },
                { expectedCoefficient: 0.0288, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          kind: "flat",
          minimumSourceAscension: 4,
          scenarioParameterMultiplier: {
            base: 0,
            parameterId: "fighting-spirit",
            perParameterValue: 1
          },
          snapshotChecks: [{ expectedCoefficient: 0.0001, talentLevel: 1 }],
          target: "damageBonus",
          valueMultiplier: 20
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sunfell-slice-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "sunfell-slice-damage-increase-per-fighting-spirit",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 200,
          id: "fighting-spirit",
          label: "战意（手填整数，100 至 200；默认满战意）",
          maximumValue: 200,
          minimumValue: 100
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "mavuika.constellation.1.the-nights-lord.earned_fighting_spirit.attack_percent",
      label: "夜主的授记 · C1 已获得战意（攻击力提高40%，8秒）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Mavuika",
  metrics: [
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      characterId: "Mavuika",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      kind: "damage",
      label: "死生之炉 / 日灼一击·水底蒸发",
      sourceActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      characterId: "Mavuika",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      kind: "damage",
      label: "死生之炉 / 日灼一击·冰底融化",
      sourceActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One uninfused first normal hit and The Named Moment's initial hit remain verified raw actions. The selected core hit is one Hour of Burning Skies Sunfell Slice: Attack × (burst[0] + Fighting Spirit × burst[2]). Fighting Spirit is an action-owned manual integer input from 100 through 200 and defaults to the full 200. At full Fighting Spirit, the pinned 6.7 snapshot resolves to 764.8% Attack at Burst Level 1 and 1376.64% at Level 10. The Fighting Spirit term is added to base damage before the shared damage multipliers, not treated as a damage-bonus percentage. At Ascension 4 or above, the initial Sunfell Slice also includes A4's 0.002 × Fighting Spirit Damage Bonus: 40% at the default full 200 Fighting Spirit. C1 can be selected only as a manual current snapshot after Fighting Spirit was gained and during its eight-second window; it adds 40% Attack without inferring its gain, duration, or the C1 Nightsoul-cap and gain-efficiency clauses. Its post-cast decay is deliberately excluded because this metric is one initial hit, not a timed burst window. Hydro-aura Vaporize and Cryo-aura Melt are mutually exclusive alternatives for this exact one hit, not a sequence. Nightsoul generation, the post-burst Flamestrider state and attacks, A1, other constellations, external effects, timing, and all other character states remain excluded.",
  label: mavuikaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
