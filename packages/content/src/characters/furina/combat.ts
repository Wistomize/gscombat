import type { CharacterCombatCoverage } from "../../combat/types.js"

import { furinaDefinition } from "./definition.js"

export const furinaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Furina",
      element: furinaDefinition.element,
      id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "fanfare-point-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 300,
          id: "fanfare-points",
          label: "当前气氛值（C0：0–300点）",
          maximumValue: 300,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Furina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.483862, talentLevel: 1 },
            { expectedCoefficient: 0.956471, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "furina.normal.auto.first_hit",
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
      characterId: "Furina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "mademoiselle-crabaletta-damage",
          id: "mademoiselle-crabaletta",
          snapshotChecks: [
            { expectedCoefficient: 0.08288, talentLevel: 1 },
            { expectedCoefficient: 0.149184, talentLevel: 10 }
          ]
        }
      ],
      element: furinaDefinition.element,
      evaluator: "declared_direct",
      id: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-salon-member-damage-bonus-per-1000-max-hp",
          kind: "source_stat",
          maximumValueParameterId: "a4-maximum-salon-member-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.007, talentLevel: 1 }],
          sourceStat: "hp",
          target: "damageBonus",
          valueMultiplier: 0.001
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "mademoiselle-crabaletta-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-salon-member-damage-bonus-per-1000-max-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-maximum-salon-member-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "hp",
      scenarioParameters: [
        {
          defaultValue: 4,
          id: "hp-consumption-participant-count",
          label: "本次攻击成功消耗生命值的队伍角色数",
          maximumValue: 4,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "hp-consumption-participant-count",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.1, parameterValue: 1 },
                { multiplier: 1.2, parameterValue: 2 },
                { multiplier: 1.3, parameterValue: 3 },
                { multiplier: 1.4, parameterValue: 4 }
              ]
            },
            damagePartId: "mademoiselle-crabaletta",
            id: "mademoiselle-crabaletta",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "furina.burst.let-the-people-rejoice.maximum-fanfare.damage-bonus",
      label: "万众狂欢 · 满气氛值全伤害加成",
      source: { characterId: "Furina", kind: "character" },
      target: "damageBonus",
      value: {
        constellationMultiplierBonuses: [{ minimumSourceConstellation: 1, value: 100 }],
        kind: "talent_parameter",
        multiplier: 300,
        parameter: {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      }
    }
  ],
  characterId: "Furina",
  metrics: [
    {
      actionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      characterId: "Furina",
      id: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      kind: "damage",
      label: "孤心沙龙 / 谢贝蕾妲小姐单次命中（荒性）",
      sourceActionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Furina",
      id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      kind: "scalar",
      label: "万众狂欢 / 气氛值全伤害加成（C0、手填0–300点）",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.0007, talentLevel: 1 },
          { expectedValue: 0.0025, talentLevel: 10 }
        ]
      },
      ratioScenarioParameter: { parameterId: "fanfare-points" },
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "One first normal-attack hit is verified as a baseline C0 attack-scaling Physical hit. One Ousia Mademoiselle Crabaletta hit is verified as a Hydro hit that scales from Furina's max HP and reads stats at hit time. Its selected 0–4 successful HP-consumption participants apply the documented 100–140% member-attack multiplier, defaulting to four. At ascension 4+, A4's min(HP / 1000 × 0.7%, 28%) Salon-member damage bonus is included. The selected source-owned support metric calculates Let the People Rejoice's all-damage bonus for one friendly recipient as the explicitly hand-filled current Fanfare point count × burst[4]; C3 adds three Burst levels. This first slice is deliberately C0 and accepts 0–300 points, so C1's starting points and higher cap are excluded rather than silently treated as C0. The Ousia initial bubble, Gentilhomme Usher, Surintendante Chevalmarin, Pneuma's Singer of Many Waters, member cadence, actual HP drain and participant eligibility, Burst healing bonus, reactions, external infusions, Arkhe switching, other passives, C1/C2/C4/C6, and rotation behavior remain unmodeled.",
  label: furinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
