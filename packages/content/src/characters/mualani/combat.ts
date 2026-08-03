import type { CharacterCombatCoverage } from "../../combat/types.js"

import { mualaniDefinition } from "./definition.js"

export const mualaniCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mualani",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.51396, talentLevel: 1 },
            { expectedCoefficient: 0.925128, talentLevel: 10 }
          ]
        }
      ],
      element: mualaniDefinition.element,
      evaluator: "declared_direct",
      id: "mualani.normal.auto.first_hit",
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
      characterId: "Mualani",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "boomsharka-laka-skill-damage",
          id: "boomsharka-laka-tracking-missile",
          snapshotChecks: [
            { expectedCoefficient: 0.584392, talentLevel: 1 },
            { expectedCoefficient: 1.051906, talentLevel: 10 }
          ]
        }
      ],
      element: mualaniDefinition.element,
      evaluator: "declared_direct",
      id: "mualani.burst.boomsharka_laka.tracking_missile",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "boomsharka-laka-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Mualani",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sharkys-bite-base-damage",
          id: "sharkys-surging-bite",
          snapshotChecks: [
            { expectedCoefficient: 0.0868, talentLevel: 1 },
            { expectedCoefficient: 0.15624, talentLevel: 10 }
          ]
        }
      ],
      element: mualaniDefinition.element,
      evaluator: "declared_direct",
      id: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sharkys-bite-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "wave-momentum-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "sharkys-surging-bite-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      scenarioParameters: [
        {
          allowedValues: [3],
          defaultValue: 3,
          id: "wave-momentum-stack-count",
          label: "浪势层数（本指标固定满层）",
          maximumValue: 3,
          minimumValue: 3
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "wave-momentum-stack-count",
              values: [{ multiplier: 5, parameterValue: 3 }]
            },
            damagePartId: "sharkys-surging-bite",
            elementalApplication: { icd: { kind: "none" } },
            id: "sharkys-surging-bite",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "mualani.constellation.1.relaxed_meztli.first_surfshark_bite.hp_additive_damage",
      label: "悠闲的「梅兹特利」… · C1 夜魂加持后的首次巨浪鲨鲨撕咬（生命值上限66%同一命中加算）",
      source: { characterId: "Mualani", kind: "character", minimumSourceConstellation: 1 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.66 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    }
  ],
  characterId: "Mualani",
  metrics: [
    {
      actionId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      characterId: "Mualani",
      id: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      kind: "damage",
      label: "冲浪时光 / 满层鲨鲨撕咬（火底蒸发需火附着）",
      sourceActionId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Boomsharka-laka tracking missile are verified as baseline C0 direct hits. One full three-stack Wave Momentum Sharky's Surging Bite is verified as a single-target Nightsoul-aligned Hydro normal-attack hit that scales from max HP. Its hit event has no ICD and explicitly requires an active target Pyro aura in the selected scenario to resolve as forward Vaporize; without that aura it remains a Hydro hit. It resolves at hit time as 5 times skill[0]: base Bite plus three Wave Momentum bonuses and the Surging Bite bonus. C1 can be selected only for the first Bite after entering Nightsoul's Blessing and adds Max HP × 66% to that same hit, before its common multipliers; it does not create a second damage event and uses the selected full-wave state. The burst models only its single tracking missile as HP-scaling Hydro damage. Other Wave Momentum counts, target-count damage reduction, Shark Missiles, Puffer generation and Nightsoul restoration, full Nightsoul duration, A1/A4, reactions other than the explicitly configured Pyro-aura Vaporize, external infusions, timing outside the selected hit, other constellations, and character states remain unmodeled.",
  label: mualaniDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
