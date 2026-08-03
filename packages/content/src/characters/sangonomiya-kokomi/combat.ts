import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sangonomiyaKokomiDefinition } from "./definition.js"

export const sangonomiyaKokomiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "SangonomiyaKokomi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.68376, talentLevel: 1 },
            { expectedCoefficient: 1.230768, talentLevel: 10 }
          ]
        }
      ],
      element: sangonomiyaKokomiDefinition.element,
      evaluator: "declared_direct",
      id: "sangonomiya_kokomi.normal.auto.first_hit",
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
      characterId: "SangonomiyaKokomi",
      element: sangonomiyaKokomiDefinition.element,
      id: "sangonomiya_kokomi.skill.kurages_oath.bake_kurage",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "bake-kurage-healing-percentage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "bake-kurage-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "SangonomiyaKokomi",
  metrics: [
    {
      characterId: "SangonomiyaKokomi",
      conditionalScalingBonuses: [
        {
          label: "命之座·海人化羽 / 低生命值额外治疗",
          minimumSourceConstellation: 2,
          ratio: 0.045,
          recipientRequirement: {
            comparison: "at_most",
            kind: "recipient_hp_fraction",
            label: "受治疗角色当前生命值不高于 50%",
            threshold: 0.5
          }
        }
      ],
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "bake-kurage-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 423.7063, talentLevel: 1 },
          { expectedValue: 932.22455, talentLevel: 10 }
        ]
      },
      id: "sangonomiya_kokomi.skill.kurages_oath.bake_kurage.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "海月之誓 / 化海月单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "bake-kurage-healing-percentage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.044, talentLevel: 1 },
          { expectedValue: 0.0792, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于化海月范围内" }],
      scalingStat: "hp",
      sourceHealingBonuses: [{ label: "匣中玉栉 / 固有治疗加成", value: 0.25 }],
      sourceActionId: "sangonomiya_kokomi.skill.kurages_oath.bake_kurage",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit is verified as a baseline C0 attack-scaling Hydro catalyst hit. One Bake-Kurage healing tick is verified as max HP × skill[0] plus skill[1], then source and recipient healing modifiers; it includes Kokomi's inherent 25% Healing Bonus, C2's extra 4.5% max HP healing for a selected recipient at or below 50% HP, and C5's +3 skill levels. No external infusion, reactions, timing, remaining passives, constellations, or character states are modeled.",
  label: sangonomiyaKokomiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
