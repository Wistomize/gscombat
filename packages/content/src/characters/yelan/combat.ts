import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yelanDefinition } from "./definition.js"

export const yelanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lingering-lifeline-damage",
          id: "lingering-lifeline-explosion",
          snapshotChecks: [
            { expectedCoefficient: 0.226136, talentLevel: 1 },
            { expectedCoefficient: 0.407045, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.skill.lingering_lifeline.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lingering-lifeline-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "depth-clarion-dice-initial-hit-damage",
          id: "depth-clarion-dice-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.07308, talentLevel: 1 },
            { expectedCoefficient: 0.131544, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.burst.depth_clarion_dice.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "depth-clarion-dice-initial-hit-damage",
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
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "exquisite-throw-damage",
          id: "exquisite-throw",
          snapshotChecks: [
            { expectedCoefficient: 0.04872, talentLevel: 1 },
            { expectedCoefficient: 0.087696, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.burst.exquisite_throw.single_wave",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "exquisite-throw-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "exquisite-throw",
            hitCount: 3,
            id: "exquisite-throw-wave",
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
      id: "yelan.constellation.4.bait_and_switch.full_stacks.hp_percent",
      label: "诓惑者，接树移花 · C4 满4次络命丝标记爆发后（全队生命上限提高40%，25秒）",
      source: { characterId: "Yelan", kind: "character", minimumSourceConstellation: 4 },
      target: "hpPercent",
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Yelan",
  metrics: [
    {
      actionId: "yelan.skill.lingering_lifeline.explosion",
      characterId: "Yelan",
      id: "yelan.skill.lingering_lifeline.explosion",
      kind: "damage",
      label: "萦络纵命索 / 生命之线爆发（C0、无预设反应）",
      sourceActionId: "yelan.skill.lingering_lifeline.explosion",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yelan.burst.exquisite_throw.single_wave",
      characterId: "Yelan",
      id: "yelan.burst.exquisite_throw.single_wave",
      kind: "damage",
      label: "渊图玲珑骰 / 玄掷玲珑一轮三箭",
      sourceActionId: "yelan.burst.exquisite_throw.single_wave",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The first selected C0 metric is one Lingering Lifeline explosion against one enemy, using max HP × skill[0] with no preset reaction. One Depth-Clarion Dice initial hit is separately verified as a baseline C0 hit. The second selected C0 metric is one Exquisite Throw wave of coordinated attacks, verified as three same-coefficient projectiles evaluated at hit time. C4 is a manual max-four-mark snapshot after four Lifeline marks have exploded and adds 40% Max HP to every party recipient for the following 25 seconds; the model does not infer marked-target count or timing. The full Burst duration, wave trigger cadence, hold duration, A1, A4, C2, C6, passives, reactions, and team timing remain unmodeled.",
  label: yelanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
