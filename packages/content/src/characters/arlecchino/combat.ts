import type { CharacterCombatCoverage } from "../../combat/types.js"

import { arlecchinoDefinition } from "./definition.js"

export const arlecchinoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Arlecchino",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "balemoon-rising-aoe-damage",
          id: "balemoon-rising-aoe",
          snapshotChecks: [
            { expectedCoefficient: 3.704, talentLevel: 1 },
            { expectedCoefficient: 6.6672, talentLevel: 10 }
          ]
        }
      ],
      element: arlecchinoDefinition.element,
      evaluator: "declared_direct",
      id: "arlecchino.burst.balemoon_rising.aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "balemoon-rising-aoe-damage",
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
      characterId: "Arlecchino",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "all-is-ash-spike-damage",
          id: "all-is-ash-spike",
          snapshotChecks: [
            { expectedCoefficient: 0.1484, talentLevel: 1 },
            { expectedCoefficient: 0.26712, talentLevel: 10 }
          ]
        }
      ],
      element: arlecchinoDefinition.element,
      evaluator: "declared_direct",
      id: "arlecchino.skill.all_is_ash.spike",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "all-is-ash-spike-damage",
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
      characterId: "Arlecchino",
      damageKind: "direct",
      damageParts: [
        {
          id: "masque-of-the-red-death-normal-attack-first-hit-at-full-bond",
          scalingTerms: [
            {
              coefficientParameterId: "masque-of-the-red-death-normal-attack-first-hit",
              snapshotChecks: [
                { expectedCoefficient: 0.475004, talentLevel: 1 },
                { expectedCoefficient: 0.938961, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "masque-of-the-red-death-normal-attack-bond-life-increase",
              coefficientMultiplierScenarioParameterId: "bond-of-life-percent",
              coefficientMultiplierScenarioParameterScale: 0.01,
              snapshotChecks: [
                { expectedCoefficient: 1.204, talentLevel: 1 },
                { expectedCoefficient: 2.38, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: arlecchinoDefinition.element,
      evaluator: "declared_direct",
      id: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
      intrinsicEffects: [
        {
          coefficientParameterId: "the-balemoon-alone-shall-know-pyro-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 唯有厄月知晓",
          snapshotChecks: [{ expectedCoefficient: 0.4, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "masque-of-the-red-death-normal-attack-first-hit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "masque-of-the-red-death-normal-attack-bond-life-increase",
          parameterIndex: 11,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive3",
          id: "the-balemoon-alone-shall-know-pyro-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 100,
          id: "bond-of-life-percent",
          label: "命中前生命之契（生命值上限百分比）",
          maximumValue: 200,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Arlecchino",
      damageKind: "direct",
      damageParts: [
        {
          id: "masque-of-the-red-death-normal-attack-first-hit-at-full-bond",
          scalingTerms: [
            {
              coefficientParameterId: "masque-of-the-red-death-normal-attack-first-hit",
              snapshotChecks: [
                { expectedCoefficient: 0.475004, talentLevel: 1 },
                { expectedCoefficient: 0.938961, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "masque-of-the-red-death-normal-attack-bond-life-increase",
              coefficientMultiplierScenarioParameterId: "bond-of-life-percent",
              coefficientMultiplierScenarioParameterScale: 0.01,
              snapshotChecks: [
                { expectedCoefficient: 1.204, talentLevel: 1 },
                { expectedCoefficient: 2.38, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: arlecchinoDefinition.element,
      evaluator: "declared_direct",
      id: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt",
      intrinsicEffects: [
        {
          coefficientParameterId: "the-balemoon-alone-shall-know-pyro-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 唯有厄月知晓",
          snapshotChecks: [{ expectedCoefficient: 0.4, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "masque-of-the-red-death-normal-attack-first-hit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "masque-of-the-red-death-normal-attack-bond-life-increase",
          parameterIndex: 11,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive3",
          id: "the-balemoon-alone-shall-know-pyro-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 100,
          id: "bond-of-life-percent",
          label: "命中前生命之契（生命值上限百分比）",
          maximumValue: 200,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  characterId: "Arlecchino",
  metrics: [
    {
      actionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
      characterId: "Arlecchino",
      id: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
      kind: "damage",
      label: "赤月之形 / 第一段普攻（生命之契100%）·水底蒸发",
      sourceActionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt",
      characterId: "Arlecchino",
      id: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt",
      kind: "damage",
      label: "赤月之形 / 第一段普攻（生命之契100%）·冰底融化",
      sourceActionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Balemoon Rising AoE hit and one All Is Ash Spike remain verified baseline C0 Pyro actions. The selected core hit is one first normal-attack hit while Masque of the Red Death is active: Attack × (auto[0] + auto[11] × pre-hit Bond of Life ratio). The pinned 6.7 sheet defines the second term as the normal-attack increase coefficient times Attack times the current Bond of Life ratio. The scenario defaults to 100%, while typed equipment effects such as Crimson Moon's Semblance may raise the bounded action-state value. The innate 40% Pyro bonus is included. No reaction, Hydro-aura Vaporize, and Cryo-aura Melt are mutually exclusive alternatives for this exact one hit, not a sequence. Bond consumption, charged and plunging attacks, timing, and rotation behavior remain excluded.",
  label: arlecchinoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
