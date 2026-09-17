import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { alhaithamDefinition } from "./definition.js"

export const alhaithamCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("alhaitham", 10),
    ...declareWeaponHitCapabilities(alhaithamDefinition),
    declareHitCapability("alhaitham.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["dendro"]),
    { ...declareHitCapability("alhaitham.kit.sustained_skill_hits", "琢光镜仅当前台存在时持续战技命中", ["skill"], ["dendro"], true, "on_field"), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 } },
  ],
  actions: [
    {
      characterId: "Alhaitham",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.495257, talentLevel: 1 },
            { expectedCoefficient: 0.978996, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "alhaitham.normal.auto.first_hit",
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
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "normal-attack-first-hit",
            elementalApplication: {
              activation: "while_element_overridden",
              icd: { groupId: "alhaitham.normal", kind: "standard" }
            },
            elementOverrideTarget: "normal_attack",
            id: "normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Alhaitham",
      damageKind: "direct",
      damageParts: [
        {
          id: "chisel-light-mirror-projection-attack",
          scalingTerms: [
            {
              coefficientParameterId:
                "chisel-light-mirror-projection-attack-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.672, talentLevel: 1 },
                { expectedCoefficient: 1.2096, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId:
                "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.344, talentLevel: 1 },
                { expectedCoefficient: 2.4192, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: "dendro",
      evaluator: "declared_direct",
      id: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 谜林道破",
          maximumValueParameterId: "a4-maximum-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.001, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "chisel-light-mirror-projection-attack-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-damage-bonus-per-elemental-mastery",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-maximum-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "alhaitham.constellation.2.debate.max_stacks.elemental_mastery",
      label: "辩章 · C2 琢光镜产生效果叠满4层（元素精通提高200点）",
      source: { characterId: "Alhaitham", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "alhaitham.constellation.4.elucidation.burst_generated_three_mirrors.dendro_damage_bonus",
      label: "义贯 · C4 施放元素爆发产生3枚琢光镜（草元素伤害加成30%）",
      source: { characterId: "Alhaitham", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["dendro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "active",
      id: "alhaitham.constellation.6.structuration.excess_mirror.crit_rate",
      label: "正理 · C6 琢光镜已达上限时再次产生琢光镜（暴击率提升10%）",
      source: { characterId: "Alhaitham", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "alhaitham.constellation.6.structuration.excess_mirror.crit_damage",
      label: "正理 · C6 琢光镜已达上限时再次产生琢光镜（暴击伤害提升70%）",
      source: { characterId: "Alhaitham", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.7 }
    }
  ],
  characterId: "Alhaitham",
  detail:
    "One first normal-attack hit is verified as a baseline attack-scaling Physical hit. It can receive a maintained external melee normal-attack infusion, such as Chongyun's field; Alhaitham's self infusion and A1 remain unmodeled. A second verified action models one three-mirror Chisel-Light Mirror Projection Attack under Quicken Spread as declared direct Dendro skill damage scaling on attack and elemental mastery. At ascension 4+, its capped Elemental-Mastery-derived projection damage bonus is included. A maximum-reachable C2 snapshot includes all four Debate stacks for 200 Elemental Mastery, and C4 includes the 30% Dendro damage bonus reached when the Burst generates three mirrors. At C6, the explicit excess-mirror snapshot adds 10% Crit Rate and 70% Crit DMG for six seconds after another mirror is generated while already at three mirrors. Full 1/2/3-mirror totals, duration extension, timing, ICD, and other states remain unmodeled.",
  label: alhaithamDefinition.name,
  metrics: [
    {
      actionId:
        "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      id: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      sourceActionId:
        "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      characterId: "Alhaitham",
      kind: "damage",
      label: "殊境·显象缚结 / 琢光镜投影攻击 · 蔓激化",
      status: "verified",
      target: "enemy"
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
