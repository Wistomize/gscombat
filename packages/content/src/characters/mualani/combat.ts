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
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1, windowSeconds: 20 },
      exclusivity: { group: "mualani-wavechasers-exploits-stacks", variant: "1-stack" },
      id: "mualani.passive.natlans_greatest_guide.wavechasers_exploits.one_stack.hp_additive_damage",
      label: "固有天赋 · 纳塔最好的向导（逐浪心得1层，爆瀑飞弹生命值倍率加算15%）",
      source: { characterId: "Mualani", kind: "character", minimumSourceAscension: 4 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["mualani.burst.boomsharka_laka.tracking_missile"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.15 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 2, windowSeconds: 20 },
      exclusivity: { group: "mualani-wavechasers-exploits-stacks", variant: "2-stack" },
      id: "mualani.passive.natlans_greatest_guide.wavechasers_exploits.two_stacks.hp_additive_damage",
      label: "固有天赋 · 纳塔最好的向导（逐浪心得2层，爆瀑飞弹生命值倍率加算30%）",
      source: { characterId: "Mualani", kind: "character", minimumSourceAscension: 4 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["mualani.burst.boomsharka_laka.tracking_missile"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.3 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 3, windowSeconds: 20 },
      exclusivity: { group: "mualani-wavechasers-exploits-stacks", variant: "3-stack" },
      id: "mualani.passive.natlans_greatest_guide.wavechasers_exploits.three_stacks.hp_additive_damage",
      label: "固有天赋 · 纳塔最好的向导（逐浪心得3层，爆瀑飞弹生命值倍率加算45%）",
      source: { characterId: "Mualani", kind: "character", minimumSourceAscension: 4 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["mualani.burst.boomsharka_laka.tracking_missile"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.45 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    },
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
    },
    {
      actionId: "mualani.burst.boomsharka_laka.tracking_missile",
      characterId: "Mualani",
      id: "mualani.burst.boomsharka_laka.tracking_missile",
      kind: "damage",
      label: "爆瀑飞弹 / 飞弹伤害（逐浪心得按队伍最大可达层数）",
      sourceActionId: "mualani.burst.boomsharka_laka.tracking_missile",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One full three-stack Wave Momentum Sharky's Surging Bite is verified as a single-target Nightsoul-aligned Hydro normal-attack hit that scales from max HP. Its hit event has no ICD and resolves as forward Vaporize only with an explicit Pyro aura. C1 adds Max HP × 66% to the first selected Bite after entering Nightsoul's Blessing. Boomsharka-laka's single tracking missile is also a selected HP-scaling Hydro metric; Natlan's Greatest Guide automatically adds 15%/30%/45% Max HP according to the maximum reachable Nightsoul Burst overlap in the configured party. Target-count reduction, Shark Missiles, Puffer recovery, other constellations, and rotation timing remain unmodeled.",
  label: mualaniDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
