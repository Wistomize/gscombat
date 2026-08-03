import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ainoDefinition } from "./definition.js"

export const ainoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Aino",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.664986, talentLevel: 1 },
            { expectedCoefficient: 1.314508, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "aino.normal.auto.first_hit",
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
      characterId: "Aino",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "musecatcher-stage-one-damage",
          id: "musecatcher-stage-one",
          snapshotChecks: [
            { expectedCoefficient: 0.656, talentLevel: 1 },
            { expectedCoefficient: 1.1808, talentLevel: 10 }
          ]
        }
      ],
      element: ainoDefinition.element,
      evaluator: "declared_direct",
      id: "aino.skill.musecatcher.stage_one",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "musecatcher-stage-one-damage",
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
      characterId: "Aino",
      damageKind: "direct",
      damageParts: [
        {
          id: "precision-hydronic-cooler-water-ball",
          scalingTerms: [
            {
              coefficientParameterId: "precision-hydronic-cooler-water-ball-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.20112, talentLevel: 1 },
                { expectedCoefficient: 0.362016, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "precision-hydronic-cooler-a4-elemental-mastery-ratio",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.5, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: ainoDefinition.element,
      evaluator: "declared_direct",
      id: "aino.burst.precision_hydronic_cooler.water_ball",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "precision-hydronic-cooler-water-ball-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "precision-hydronic-cooler-a4-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "aino.constellation.1.balance_of_ash_and_field.self.elemental_mastery",
      label: "灰与力场的平衡理论 · C1 元素战技或元素爆发后（爱诺元素精通提高80，15秒）",
      source: { characterId: "Aino", kind: "character", minimumSourceConstellation: 1 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 80 }
    },
    {
      activation: "active",
      id: "aino.constellation.1.balance_of_ash_and_field.nearby_on_field_teammate.elemental_mastery",
      label: "灰与力场的平衡理论 · C1 施放时附近的其他在场角色（元素精通提高80，15秒）",
      source: { characterId: "Aino", kind: "character", minimumSourceConstellation: 1 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 80 }
    }
  ],
  characterId: "Aino",
  metrics: [
    {
      actionId: "aino.burst.precision_hydronic_cooler.water_ball",
      characterId: "Aino",
      id: "aino.burst.precision_hydronic_cooler.water_ball",
      kind: "damage",
      label: "精密水冷仪 / 单颗水球伤害（C0，无预设反应）",
      sourceActionId: "aino.burst.precision_hydronic_cooler.water_ball",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one initial Musecatcher Stage 1 hit, and one Precision Hydronic Cooler water ball are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Water ball against one target: Burst parameter burst[0], or 20.112% Attack at Talent Level 1 and 36.2016% at Level 10. At ascension 4+, A4 also adds Elemental Mastery × passive2[0] (0.5) before shared multipliers. C1 provides separately selected self and nearby-on-field-teammate snapshots after Aino casts her Skill or Burst: each adds 80 Elemental Mastery for 15 seconds. The latter does not infer who was on field at cast time. It declares no target aura, Vaporize, or other fixed reaction. Stage 2 damage, self-dragging and movement endpoint targeting, hold aiming, target count, water-bullet recurrence and duration, Moonsign Full Moon cadence and area enhancement, external infusions, C2's extra hybrid water bullet, C6 reaction bonuses, inferred C3 Burst and C5 Skill levels, timing, and character states remain unmodeled.",
  label: ainoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
