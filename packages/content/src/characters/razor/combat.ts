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
      activation: "automatic",
      id: "razor.locked_passive.surging_thunder.wolf_spirit.attack_additive_damage",
      label: "魔女的前夜礼·苍雷奔涌 · 雷狼伤害追加雷泽70%攻击力",
      source: { characterId: "Razor", kind: "character" },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["razor.burst.lightning_fang.wolf_spirit.fourth_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.7 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "active",
      condition: { kind: "hexerei_secret_rite" },
      id: "razor.locked_passive.surging_thunder.overflowing_electro_sigil.lightning_strike",
      label: "魔女的前夜礼·苍雷奔涌 · 雷之印溢出时雷狼落雷（冷却已就绪）",
      selectionMode: "optional",
      source: { characterId: "Razor", kind: "character" },
      target: "additionalDamageEvent",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 1.5 },
        element: "electro",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack"
      }
    },
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
      label: "雷牙 / 状态普通攻击四段（C0、无反应）",
      sourceActionId: "razor.burst.lightning_fang.normal.fourth_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected core action is Razor's fourth Physical normal hit while Lightning Fang is active; the Wolf Within strike remains a separate verified action. Surging Thunder adds 70% of Razor's Attack to the wolf strike, while its Hexerei Sigil-overflow lightning is an optional independent 150% Attack event. C1, C2, and C4 remain explicit snapshots; chain timing, Sigil generation, and rotation behavior are not inferred.",
  label: razorDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
