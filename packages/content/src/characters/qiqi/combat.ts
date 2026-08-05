import type { CharacterCombatCoverage } from "../../combat/types.js"

import { qiqiDefinition } from "./definition.js"

export const qiqiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "adeptus-art-preserver-of-fortune-initial-hit-damage",
          id: "adeptus-art-preserver-of-fortune-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.848, talentLevel: 1 },
            { expectedCoefficient: 5.1264, talentLevel: 10 }
          ]
        }
      ],
      element: qiqiDefinition.element,
      evaluator: "declared_direct",
      id: "qiqi.burst.adeptus_art_preserver_of_fortune.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "adeptus-art-preserver-of-fortune-initial-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "herald-of-frost-initial-hit-damage",
          id: "herald-of-frost-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.96, talentLevel: 1 },
            { expectedCoefficient: 1.728, talentLevel: 10 }
          ]
        }
      ],
      element: qiqiDefinition.element,
      evaluator: "declared_direct",
      id: "qiqi.skill.adeptus_art_herald_of_frost.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "herald-of-frost-initial-hit-damage",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Qiqi",
      element: qiqiDefinition.element,
      id: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-percentage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.37754, talentLevel: 1 },
            { expectedCoefficient: 0.7463, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "qiqi.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "qiqi.locked_passive.superconduct_damage_bonus",
      label: "七宝奉真 · 辉映·星超导（超导反应伤害提高50%）",
      source: { characterId: "Qiqi", kind: "character" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["superconduct"] },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "qiqi.locked_passive.stellar_superconduct_damage_bonus",
      label: "七宝奉真 · 辉映·星超导（星超导反应伤害提高50%）",
      source: { characterId: "Qiqi", kind: "character" },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "qiqi.constellation.2.radiance.attack_percent",
      label: "冰寒蚀骨 · C2 辉映·星超导（七七攻击力提高50%）",
      source: { characterId: "Qiqi", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct"]
      },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "qiqi.constellation.6.profound_mystery.stellar_superconduct_base_damage",
      label: "起死回骸 · C6 洞玄（本次星超导基础伤害增加七七攻击力的600%）",
      source: { characterId: "Qiqi", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionBaseDamageFlat",
      targetFilter: {
        recipientSourceRelation: "not_source",
        specialReactionKinds: ["stellar_superconduct"]
      },
      value: {
        kind: "source_final_attack",
        multiplier: { kind: "fixed", value: 6 },
        sourceAttackSnapshotEffectIds: ["qiqi.constellation.2.radiance.attack_percent"]
      }
    }
  ],
  characterId: "Qiqi",
  metrics: [
    {
      characterId: "Qiqi",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 450.5507, talentLevel: 1 },
          { expectedValue: 991.2866, talentLevel: 10 }
        ]
      },
      id: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "仙法·寒病鬼差 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-percentage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.696, talentLevel: 1 },
          { expectedValue: 1.2528, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "当前场上受治疗角色处于寒病鬼差的持续跟随范围内" }
      ],
      scalingStat: "attack",
      sourceActionId: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Adeptus Art: Preserver of Fortune's initial hit and one initial Herald of Frost skill hit are verified as baseline attack-scaling Cryo hits. Their raw parameter bindings are locked to the pinned 6.7 Genshin Optimizer localization encoding: Preserver of Fortune Skill DMG is burst[2] (2.848 at talent level one and 5.1264 at level ten), while Herald of Frost Skill DMG is skill[7] (0.96 and 1.728). The selected support metric verifies one Herald of Frost continuous-regeneration tick as Qiqi's ATK times skill[2] plus skill[3], then Qiqi's Healing Bonus and the selected active recipient's Incoming Healing Bonus; skill[2] is 0.696 and skill[3] is 450.5507 at talent level one, rising to 1.2528 and 991.2866 at level ten. Under Radiance: Stellar-Conduct, Seven Curios of the Faithful grants the party 50% Superconduct and Stellar-Superconduct reaction damage, C2 grants Qiqi 50% Attack, and the first eligible non-Qiqi Stellar-Superconduct hit after C6 Burst receives a Shenhe-style base-damage addition equal to 600% of Qiqi's final Attack. It excludes stack ordering beyond the selected first eligible hit, Normal/Charged-Attack party healing, follow-up attack timing, Energy restoration, revival, elemental infusions, and rotation behavior.",
  label: qiqiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
