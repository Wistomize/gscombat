import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yaoyaoDefinition } from "./definition.js"

export const yaoyaoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Yaoyao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.510014, talentLevel: 1 },
            { expectedCoefficient: 1.008168, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "yaoyao.normal.auto.first_hit",
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
      characterId: "Yaoyao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "raphanus-sky-cluster-white-jade-radish-damage",
          id: "white-jade-radish-explosion",
          snapshotChecks: [
            { expectedCoefficient: 0.2992, talentLevel: 1 },
            { expectedCoefficient: 0.53856, talentLevel: 10 }
          ]
        }
      ],
      element: yaoyaoDefinition.element,
      evaluator: "declared_direct",
      id: "yaoyao.skill.raphanus_sky_cluster.white_jade_radish.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "raphanus-sky-cluster-white-jade-radish-damage",
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
      characterId: "Yaoyao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "moonjade-descent-initial-aoe-damage",
          id: "moonjade-descent-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 1.1456, talentLevel: 1 },
            { expectedCoefficient: 2.06208, talentLevel: 10 }
          ]
        }
      ],
      element: yaoyaoDefinition.element,
      evaluator: "declared_direct",
      id: "yaoyao.burst.moonjade_descent.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "moonjade-descent-initial-aoe-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "yaoyao.constellation.1.adeptus_tutelage.white_jade_radish.active_character.dendro_damage_bonus",
      label: "妙受琼阁 · C1 当前场上角色处于白玉萝卜爆炸范围内（草元素伤害加成 15%，8秒）",
      source: { characterId: "Yaoyao", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { elements: ["dendro"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Yaoyao",
  metrics: [
    {
      characterId: "Yaoyao",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "raphanus-sky-cluster-white-jade-radish-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 165.07991, talentLevel: 1 },
          { expectedValue: 363.20334, talentLevel: 10 }
        ]
      },
      id: "yaoyao.skill.raphanus_sky_cluster.white_jade_radish.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "云台团团降芦菔 / 月桂·抛掷型白玉萝卜单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "raphanus-sky-cluster-white-jade-radish-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.017143, talentLevel: 1 },
          { expectedValue: 0.030857, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于白玉萝卜炸裂范围内" }],
      scalingStat: "hp",
      sourceActionId: "yaoyao.skill.raphanus_sky_cluster.white_jade_radish.explosion",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit, one White Jade Radish explosion, and Moonjade Descent's initial AoE are verified as baseline C0 attack-scaling hits. The selected support metric is one Raphanus Sky Cluster Yuegui Throwing Mode White Jade Radish heal, calculated as max HP × skill[1] plus skill[2], then source and recipient healing modifiers, for a selected recipient within the explosion area; C3's +3 Skill levels are included. C1 can be selected as an explicit current-action snapshot after the user confirms the on-field recipient is inside a White Jade Radish explosion: that current character gains 15% Dendro damage bonus. It does not infer the explosion, recipient position, eight-second duration, timing, or a rotation. Yuegui's nearby-HP-at-or-below-70% branch only changes radish target selection and is not used as recipient eligibility. Starscatter's Adeptal Legacy movement throws, In Others' Shoes' separate 0.8% max-HP-per-second five-second healing, and C6's distinct Mega Radish 7.5% max-HP active-character heal are excluded. The burst uses raw burst[3] skill damage with attack scaling, but is retained only as a bottom-layer action rather than a selected support indicator. It excludes Adeptal Legacy, Yuegui, radishes, healing, Dendro resistance, movement speed, duration, exit cleanup, passives, other constellations, reactions, external infusions, character states, and multi-target count.",
  label: yaoyaoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
