import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sigewinneDefinition } from "./definition.js"

export const sigewinneCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Sigewinne",
      element: sigewinneDefinition.element,
      id: "sigewinne.skill.rebound_hydrotherapy.bouncing_bubble.teammate_heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "rebound-hydrotherapy-bubble-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "rebound-hydrotherapy-bubble-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Sigewinne",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.526139, talentLevel: 1 },
            { expectedCoefficient: 1.040043, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "sigewinne.normal.auto.first_hit",
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
      characterId: "Sigewinne",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "super-saturated-syringing-spout-damage",
          id: "super-saturated-syringing-spout",
          snapshotChecks: [
            { expectedCoefficient: 0.117708, talentLevel: 1 },
            { expectedCoefficient: 0.211874, talentLevel: 10 }
          ]
        }
      ],
      element: sigewinneDefinition.element,
      evaluator: "declared_direct",
      id: "sigewinne.burst.super_saturated_syringing.single_spout",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "super-saturated-syringing-spout-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "sigewinne.constellation.2.can_the_merciful_spirit_defeat_its_foes.hydro_resistance_reduction",
      label: "最仁慈的精灵，可否化解仇敌 · C2 减抗子句：水球或心意注射已命中目标（水元素抗性降低 35%，8秒）",
      source: { characterId: "Sigewinne", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.35 }
    }
  ],
  characterId: "Sigewinne",
  metrics: [
    {
      characterId: "Sigewinne",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "rebound-hydrotherapy-bubble-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 269.6314, talentLevel: 1 },
          { expectedValue: 593.2341, talentLevel: 10 }
        ]
      },
      id: "sigewinne.skill.rebound_hydrotherapy.bouncing_bubble.teammate_heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "弹跳水疗法 / 激愈水球单跳队员治疗量（基础档）",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "rebound-hydrotherapy-bubble-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.028, talentLevel: 1 },
          { expectedValue: 0.0504, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色位于激愈水球单次弹跳后的附近范围内" }
      ],
      scalingStat: "hp",
      sourceActionId: "sigewinne.skill.rebound_hydrotherapy.bouncing_bubble.teammate_heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected Sigewinne output is one basic-tier Rebound Hydrotherapy Bouncing Bubble heal for a nearby party member: max HP × skill[1] plus skill[2], then Sigewinne's Healing Bonus and the recipient's Incoming Healing Bonus. The pinned 6.7 snapshot verifies skill[1] at 2.8% and 5.04% Max HP and skill[2] at 269.6314 and 593.2341 at talent levels 1 and 10; C3 adds three Skill levels. C2's Hydro Resistance reduction can be selected as an explicit current-action snapshot after the user confirms a Rebound Hydrotherapy bubble or Super Saturated Syringing spout already hit the target: all Hydro damage against that target gains the 35% reduction. Its separate shield is not modeled, so this is explicitly the C2 resistance-reduction clause rather than a full C2 implementation. It does not infer the hit, target, eight-second duration, timing, or a rotation. This fixed basic-tier result otherwise excludes hold-tier healing bonuses, Detailed Care's Bond-of-Life-based Healing Bonus, the end-of-bounce self-heal, C1's additional bounce, other constellations, external effects, and rotation behavior. One first normal-attack hit and one Super Saturated Syringing spout remain separately verified lower-level damage actions rather than selected support metrics.",
  label: sigewinneDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
