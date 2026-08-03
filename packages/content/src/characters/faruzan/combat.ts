import type { CharacterCombatCoverage } from "../../combat/types.js"

import { faruzanDefinition } from "./definition.js"

export const faruzanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Faruzan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "wind-realm-of-nasana-skill-damage",
          id: "wind-realm-of-nasana-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.488, talentLevel: 1 },
            { expectedCoefficient: 2.6784, talentLevel: 10 }
          ]
        }
      ],
      element: faruzanDefinition.element,
      evaluator: "declared_direct",
      id: "faruzan.skill.wind_realm_of_nasamjnin.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "wind-realm-of-nasana-skill-damage",
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
      characterId: "Faruzan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "the-winds-secret-ways-initial-hit-damage",
          id: "the-winds-secret-ways-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 3.776, talentLevel: 1 },
            { expectedCoefficient: 6.7968, talentLevel: 10 }
          ]
        }
      ],
      element: faruzanDefinition.element,
      evaluator: "declared_direct",
      id: "faruzan.burst.the_winds_secret_ways.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "the-winds-secret-ways-initial-hit-damage",
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
      characterId: "Faruzan",
      element: faruzanDefinition.element,
      id: "faruzan.burst.the_winds_secret_ways.prayerful_wind_benefit",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Faruzan",
      element: faruzanDefinition.element,
      id: "faruzan.burst.the_winds_secret_ways.perfidious_wind_bale",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-resistance-reduction",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "faruzan.burst.prayerful_wind_benefit.anemo_damage_bonus",
      label: "祈风之赐 · 风元素伤害加成",
      source: { characterId: "Faruzan", kind: "character" },
      target: "damageBonus",
      targetFilter: { elements: ["anemo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "faruzan.burst.perfidious_wind_bale.anemo_resistance_reduction",
      label: "诡风之祸 · 风元素抗性降低",
      source: { characterId: "Faruzan", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-resistance-reduction",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "active",
      id: "faruzan.constellation.6.prayerful_wind.anemo_crit_damage",
      label: "C6 · 当前动作受祈风之赐影响：风元素暴击伤害 +40%",
      source: { characterId: "Faruzan", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Faruzan",
  metrics: [
    {
      characterId: "Faruzan",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.18, talentLevel: 1 },
          { expectedValue: 0.324, talentLevel: 10 }
        ]
      },
      id: "faruzan.burst.prayerful_wind_benefit.anemo_damage_bonus",
      kind: "scalar",
      label: "抟风秘道 / 祈风之赐·风元素伤害加成",
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受益角色位于旋风脉冲的祈风之赐范围内" }
      ],
      semantic: "damage_bonus",
      sourceActionId: "faruzan.burst.the_winds_secret_ways.prayerful_wind_benefit",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      characterId: "Faruzan",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "the-winds-secret-ways-anemo-resistance-reduction",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.3, talentLevel: 1 },
          { expectedValue: 0.3, talentLevel: 10 }
        ]
      },
      id: "faruzan.burst.perfidious_wind_bale.anemo_resistance_reduction",
      kind: "scalar",
      label: "抟风秘道 / 诡风之祸·风元素抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "faruzan.burst.the_winds_secret_ways.perfidious_wind_bale",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    }
  ],
  detail:
    "Faruzan's selected indicators are her own support outputs, not filler personal damage. Prayerful Wind's Benefit grants one nearby recipient Anemo Damage Bonus from burst[1] (18% at talent level 1, 32.4% at level 10); C5 adds three burst levels. Perfidious Wind's Bale separately exposes 30% Anemo resistance reduction on one enemy hit by a Whirlwind Pulse. Neither scalar is converted into another character's damage or simulates the four-second effect duration. When explicitly selected, C6 adds 40% Anemo Crit DMG to a current action confirmed to be receiving Prayerful Wind's Benefit. Wind Realm of Nasamjnin's skill damage and The Wind's Secret Ways' initial hit remain verified baseline Anemo actions only. The selected support outputs exclude polyhedron pulse damage, A4, elemental aura and reactions, external buffs, timing, passives, other constellations, and rotation behavior. Hurricane Arrows and Pressurized Collapses remain unmodeled.",
  label: faruzanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
