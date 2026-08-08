import type { CharacterCombatCoverage } from "../../combat/types.js"

import { tighnariDefinition } from "./definition.js"

export const tighnariCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Tighnari",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "vijnana-phala-mine-initial-hit-damage",
          id: "vijnana-phala-mine-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.496, talentLevel: 1 },
            { expectedCoefficient: 2.6928, talentLevel: 10 }
          ]
        }
      ],
      element: tighnariDefinition.element,
      evaluator: "declared_direct",
      id: "tighnari.skill.vijnana_phala_mine.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "vijnana-phala-mine-initial-hit-damage",
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
      characterId: "Tighnari",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "fashioners-tanglevine-shaft-primary-shaft-damage",
          id: "fashioners-tanglevine-shaft-primary-shaft",
          snapshotChecks: [
            { expectedCoefficient: 0.5562, talentLevel: 1 },
            { expectedCoefficient: 1.00116, talentLevel: 10 }
          ]
        }
      ],
      element: tighnariDefinition.element,
      evaluator: "declared_direct",
      id: "tighnari.burst.fashioners_tanglevine_shaft.primary_shaft",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 诸叶辨通",
          maximumValueParameterId: "a4-maximum-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0006, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "fashioners-tanglevine-shaft-primary-shaft-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
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
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "charged",
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Tighnari",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "wreath-arrow-damage",
          id: "wreath-arrow",
          snapshotChecks: [
            { expectedCoefficient: 0.872, talentLevel: 1 },
            { expectedCoefficient: 1.5696, talentLevel: 10 }
          ]
        }
      ],
      element: tighnariDefinition.element,
      evaluator: "declared_direct",
      id: "tighnari.normal.wreath_arrow.single_hit.spread",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 诸叶辨通",
          maximumValueParameterId: "a4-maximum-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0006, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "wreath-arrow-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
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
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "tighnari.constellation.1.wreath_arrow.crit_rate",
      label: "C1 · 藏蕴花矢暴击率 +15%",
      source: { characterId: "Tighnari", kind: "character", minimumSourceConstellation: 1 },
      target: "critRate",
      targetFilter: {
        actionIds: ["tighnari.normal.wreath_arrow.single_hit.spread"],
        attackKinds: ["charged"]
      },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      id: "tighnari.constellation.2.known_by_the_stem.dendro_field.damage_bonus",
      label: "由茎干剖析来缘 · C2 识蕴领域内存在敌人或残留期间（提纳里草元素伤害提高20%）",
      source: { characterId: "Tighnari", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["dendro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Tighnari",
  metrics: [
    {
      actionId: "tighnari.burst.fashioners_tanglevine_shaft.primary_shaft",
      characterId: "Tighnari",
      id: "tighnari.burst.fashioners_tanglevine_shaft.primary_shaft",
      kind: "damage",
      label: "造生缠藤箭 / 初始缠藤箭单次命中（C0、无反应）",
      sourceActionId: "tighnari.burst.fashioners_tanglevine_shaft.primary_shaft",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "tighnari.normal.wreath_arrow.single_hit.spread",
      characterId: "Tighnari",
      id: "tighnari.normal.wreath_arrow.single_hit.spread",
      kind: "damage",
      label: "藏蕴破障 / 藏蕴花矢单次命中 · 蔓激化",
      sourceActionId: "tighnari.normal.wreath_arrow.single_hit.spread",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The first selected metric is one Fashioner's Tanglevine Shaft primary shaft with no preset reaction. One Wreath Arrow hit is the second selected metric and assumes Quicken for Spread. At ascension 4+, A4's min(Elemental Mastery × 0.06%, 60%) damage bonus is included for both selected hits. C1's unconditional +15% Wreath Arrow Crit Rate and C3/C5 shared talent levels are modeled. C2 can be selected after the user confirms an enemy remains in the Vijnana-Phala Mine field, or its six-second residual bonus remains active, and adds 20% Dendro Damage Bonus only to Tighnari; it does not infer field targeting or time. The initial Vijnana-Phala Mine hit remains separately verified as a baseline attack-scaling Dendro hit. The four Clusterbloom Arrows, subsequent mines, other primary shafts, all secondary shafts, A1, C4 buff, C6, other reactions, timing, and other passives remain unmodeled.",
  label: tighnariDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
