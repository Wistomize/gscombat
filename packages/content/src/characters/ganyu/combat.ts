import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ganyuDefinition } from "./definition.js"

export const ganyuCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Ganyu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "trail-of-the-qilin-skill-damage",
          id: "trail-of-the-qilin-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.32, talentLevel: 1 },
            { expectedCoefficient: 2.376, talentLevel: 10 }
          ]
        }
      ],
      element: ganyuDefinition.element,
      evaluator: "declared_direct",
      id: "ganyu.skill.trail_of_the_qilin.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "trail-of-the-qilin-skill-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      attackKind: "charged",
      characterId: "Ganyu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "frostflake-arrow-hit-damage",
          id: "frostflake-arrow-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.28, talentLevel: 1 },
            { expectedCoefficient: 2.304, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "frostflake-arrow-bloom-damage",
          id: "frostflake-arrow-bloom",
          snapshotChecks: [
            { expectedCoefficient: 2.176, talentLevel: 1 },
            { expectedCoefficient: 3.9168, talentLevel: 10 }
          ]
        }
      ],
      element: ganyuDefinition.element,
      evaluator: "declared_direct",
      id: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      intrinsicEffects: [
        {
          coefficientParameterId: "a1-undivided-heart-crit-rate-bonus",
          kind: "flat",
          label: "固有天赋 · 唯此一心",
          minimumSourceAscension: 1,
          snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
          target: "critRate"
        },
        {
          coefficientParameterId: "a4-harmony-between-heaven-and-earth-cryo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 天地交泰",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "frostflake-arrow-hit-damage",
          parameterIndex: 8,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "frostflake-arrow-bloom-damage",
          parameterIndex: 9,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive1",
          id: "a1-undivided-heart-crit-rate-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-harmony-between-heaven-and-earth-cryo-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          { at: 0, damagePartId: "frostflake-arrow-hit", id: "frostflake-arrow-hit", snapshot: "cast" },
          { at: 0, damagePartId: "frostflake-arrow-bloom", id: "frostflake-arrow-bloom", snapshot: "cast" }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "ganyu.frostflake_arrow.c1.cryo_resistance_shred",
      label: "霜华矢及霜华绽发命中后 · C1 冰元素抗性降低（6秒）",
      source: { characterId: "Ganyu", kind: "character", minimumSourceConstellation: 1 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Ganyu",
  metrics: [
    {
      actionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      characterId: "Ganyu",
      id: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      kind: "damage",
      label: "流天射术 / C0 二段蓄力霜华矢 + 霜华绽发（无反应）",
      sourceActionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Trail of the Qilin's listed skill damage and the selected metric are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. One C0 Level-two Frostflake Arrow action is verified as one target receiving its direct Arrow hit plus Frostflake Bloom: Normal Attack auto[8] + auto[9], or 128.0% + 217.6% Attack at Talent Level 1 and 230.4% + 391.68% at Level 10. Both parts use the Normal Attack talent table and a shared cast snapshot. As a conventional repeated Frostflake Arrow metric, it includes Undivided Heart's 20% Critical Rate bonus from Ascension 1 and the self Burst-field 20% Cryo Damage Bonus from Ascension 4. C1 Cryo resistance reduction after a Frostflake Arrow hit is an explicit current-action snapshot. The selected metric assumes no target aura or reaction. It excludes normal attacks, first-level or uncharged aimed shots, target count, charge and travel timing, the Ice Lotus, external infusions, remaining passives, other constellations, and state changes.",
  label: ganyuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
