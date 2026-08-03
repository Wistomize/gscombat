import type { CharacterCombatCoverage } from "../../combat/types.js"

import { aratakiIttoDefinition } from "./definition.js"

export const aratakiIttoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "AratakiItto",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.792318, talentLevel: 1 },
            { expectedCoefficient: 1.56621, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "arataki_itto.normal.auto.first_hit",
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
      characterId: "AratakiItto",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "akaushi-burst-ushi-hit-damage",
          id: "akaushi-burst-ushi-hit",
          snapshotChecks: [
            { expectedCoefficient: 3.072, talentLevel: 1 },
            { expectedCoefficient: 5.5296, talentLevel: 10 }
          ]
        }
      ],
      element: aratakiIttoDefinition.element,
      evaluator: "declared_direct",
      id: "arataki_itto.skill.masatsu_zetsugi_akaushi_burst.ushi_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "akaushi-burst-ushi-hit-damage",
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
      attackKind: "charged",
      characterId: "AratakiItto",
      damageKind: "direct",
      damageParts: [
        {
          id: "arataki-kesagiri-chain",
          scalingTerms: [
            {
              coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.9116, talentLevel: 1 },
                { expectedCoefficient: 1.802, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.576, talentLevel: 1 },
                { expectedCoefficient: 1.0368, talentLevel: 10 }
              ],
              coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.9116, talentLevel: 1 },
                { expectedCoefficient: 1.802, talentLevel: 10 }
              ],
              stat: "defense"
            },
            {
              coefficientParameterId: "superlative-superstrength-defense-damage-increase",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
              stat: "defense"
            }
          ]
        },
        {
          id: "arataki-kesagiri-final",
          scalingTerms: [
            {
              coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.9092, talentLevel: 1 },
                { expectedCoefficient: 3.774, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.576, talentLevel: 1 },
                { expectedCoefficient: 1.0368, talentLevel: 10 }
              ],
              coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.9092, talentLevel: 1 },
                { expectedCoefficient: 3.774, talentLevel: 10 }
              ],
              stat: "defense"
            },
            {
              coefficientParameterId: "superlative-superstrength-defense-damage-increase",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
              stat: "defense"
            }
          ]
        }
      ],
      element: aratakiIttoDefinition.element,
      evaluator: "declared_direct",
      id: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "arataki-kesagiri-chain-attack-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "arataki-kesagiri-final-attack-ratio",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "royal-descent-defense-to-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "superlative-superstrength-defense-damage-increase",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 4,
          id: "arataki-kesagiri-chain-hit-count",
          label: "荒泷乱舞连斩命中次数",
          maximumValue: 4,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "arataki-kesagiri-chain",
            hitCount: { kind: "scenario_parameter", parameterId: "arataki-kesagiri-chain-hit-count" },
            id: "arataki-kesagiri-chain",
            snapshot: "cast"
          },
          {
            at: 1,
            damagePartId: "arataki-kesagiri-final",
            id: "arataki-kesagiri-final",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "AratakiItto",
      element: aratakiIttoDefinition.element,
      id: "arataki_itto.burst.royal_descent.state",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "royal-descent-defense-to-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "arataki_itto.constellation.6.arataki_kesagiri.crit_damage",
      label: "C6 · 荒泷乱舞暴击伤害 +70%",
      source: { characterId: "AratakiItto", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final"],
        attackKinds: ["charged"]
      },
      value: { kind: "fixed", value: 0.7 }
    }
  ],
  characterId: "AratakiItto",
  metrics: [
    {
      actionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      characterId: "AratakiItto",
      id: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      kind: "damage",
      label: "最恶鬼王·一斗轰临！！ / 荒泷乱舞连斩与最后一击",
      sourceActionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "AratakiItto",
      id: "arataki_itto.burst.royal_descent.defense_to_attack",
      kind: "scalar",
      label: "最恶鬼王·一斗轰临！！ / 防御力转攻击力",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "royal-descent-defense-to-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.576, talentLevel: 1 },
          { expectedValue: 1.0368, talentLevel: 10 }
        ]
      },
      scalingStat: "defense",
      semantic: "attack_buff",
      sourceActionId: "arataki_itto.burst.royal_descent.state",
      status: "verified",
      target: "self",
      unit: "attack"
    }
  ],
  detail:
    "One first normal-attack hit and one initial Masatsu Zetsugi: Akaushi Burst Ushi impact are verified as baseline C0 attack-scaling hits. Royal Descent exposes a selected Arataki Kesagiri chain plus final slash with an explicit zero-to-four chain-hit input, alongside its self-only defense-to-attack conversion. At ascension 4+, A4 also adds DEF × passive2[0] (35%) once to every selected chain and final hit. C3/C5 use the shared source-mapped talent levels, and C6's unconditional +70% Crit DMG is applied only to this declared Arataki Kesagiri charged-action metric. External infusions, Ushi's taunt, duration, departure damage, reactions, and other character states remain unmodeled.",
  label: aratakiIttoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
