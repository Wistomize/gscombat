import type { CharacterCombatCoverage } from "../../combat/types.js"

import { razorDefinition } from "./definition.js"

export const razorCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Razor",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "claw-and-thunder-point-press-damage",
          id: "claw-and-thunder-point-press",
          snapshotChecks: [
            { expectedCoefficient: 1.992, talentLevel: 1 },
            { expectedCoefficient: 3.5856, talentLevel: 10 }
          ]
        }
      ],
      element: razorDefinition.element,
      evaluator: "declared_direct",
      id: "razor.skill.claw_and_thunder.point_press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "claw-and-thunder-point-press-damage",
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
      characterId: "Razor",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lightning-fang-initial-hit-damage",
          id: "lightning-fang-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.6, talentLevel: 1 },
            { expectedCoefficient: 2.88, talentLevel: 10 }
          ]
        }
      ],
      element: razorDefinition.element,
      evaluator: "declared_direct",
      id: "razor.burst.lightning_fang.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "lightning-fang-initial-hit-damage",
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
      characterId: "Razor",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.9592, talentLevel: 1 },
            { expectedCoefficient: 1.7113, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "razor.normal.auto.first_hit",
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
      characterId: "Razor",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-fourth-hit-damage",
          id: "lightning-fang-normal-attack-fourth-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.36048, talentLevel: 1 },
            { expectedCoefficient: 2.42722, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "razor.burst.lightning_fang.normal.fourth_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-fourth-hit-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Razor",
      damageKind: "direct",
      damageParts: [
        {
          id: "lightning-fang-wolf-spirit-fourth-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "lightning-fang-wolf-spirit-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.24, talentLevel: 1 },
                { expectedCoefficient: 0.432, talentLevel: 10 }
              ],
              coefficientParameterId: "normal-attack-fourth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.36048, talentLevel: 1 },
                { expectedCoefficient: 2.42722, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: razorDefinition.element,
      evaluator: "declared_direct",
      id: "razor.burst.lightning_fang.wolf_spirit.fourth_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-fourth-hit-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "lightning-fang-wolf-spirit-damage-multiplier",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Razor",
  actionEffects: [
    {
      activation: "active",
      id: "razor.constellation.1.wolf_instinct.elemental_orb_or_particle.damage_bonus",
      label: "狼性 · C1 获取元素晶球或元素微粒后伤害提高（10%，8秒）",
      source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "razor.constellation.2.suppression.low_hp_target.crit_rate",
      label: "压制 · C2 攻击生命值低于30%的敌人（暴击率提高10%）",
      source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "razor.constellation.4.claw_and_thunder_press.enemy_defense_reduction",
      label: "目标减防已生效：利爪与苍雷点按命中后 · C4 防御力降低（15%，7秒；不作用于触发命中）",
      source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  metrics: [
    {
      actionId: "razor.burst.lightning_fang.normal.fourth_hit",
      characterId: "Razor",
      id: "razor.burst.lightning_fang.normal.fourth_hit",
      kind: "damage",
      label: "雷牙 / 状态普通攻击四段（C0、无预设反应）",
      sourceActionId: "razor.burst.lightning_fang.normal.fourth_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Claw and Thunder point-press hit, Lightning Fang's initial hit, and one uninfused normal first hit remain verified baseline C0 actions. The selected core action is exactly Razor's fourth normal hit while Lightning Fang is already active: Attack × auto[3], kept as Physical damage. The pinned 6.7 snapshot gives auto[3] as 136.048% Attack at Normal Talent Level 1 and 242.722% at Level 10. One same-hit Wolf Within companion strike is separately verified, but not selected: Attack × auto[3] × burst[1], where burst[1] is 24% at Burst Level 1 and 43.2% at Level 10. C1 can be selected as an explicit self current-action snapshot after Razor obtains an Elemental Orb or Particle: all of Razor's damage gains 10% damage bonus. At C2, a separately selected current-action snapshot means the target is already below 30% HP: Razor's attacks gain 10% Crit Rate. At C4, the separately selected target-debuff snapshot means Claw and Thunder's point-press already hit the target: Defense is reduced by 15% for 7 seconds, never for that triggering point-press hit. The selected metric does not aggregate the Physical normal hit with its separate Electro companion strike, infer a normal-attack chain, observe target HP, or preset a target aura or reaction. Lightning Fang duration, attack speed and resistance changes, Electro Sigils, passives, other constellations, external buffs, timing, and rotation behavior remain excluded.",
  label: razorDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
