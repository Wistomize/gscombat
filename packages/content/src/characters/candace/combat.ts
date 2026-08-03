import type { CharacterCombatCoverage } from "../../combat/types.js"

import { candaceDefinition } from "./definition.js"

export const candaceCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Candace",
      element: candaceDefinition.element,
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.normal_damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-duration",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-wagtails-tide-skill-damage",
          id: "sacred-rite-wagtails-tide-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.066104, talentLevel: 1 },
            { expectedCoefficient: 0.118987, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.burst.sacred_rite_wagtails_tide.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sacred-rite-wagtails-tide-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-herons-sanctum-press-damage",
          id: "sacred-rite-herons-sanctum-press",
          snapshotChecks: [
            { expectedCoefficient: 0.12, talentLevel: 1 },
            { expectedCoefficient: 0.216, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.skill.sacred_rite_herons_sanctum.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sacred-rite-herons-sanctum-press-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-herons-sanctum-hold-release-damage",
          id: "sacred-rite-herons-sanctum-hold-release",
          snapshotChecks: [
            { expectedCoefficient: 0.1904, talentLevel: 1 },
            { expectedCoefficient: 0.34272, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.skill.sacred_rite_herons_sanctum.hold_release",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sacred-rite-herons-sanctum-hold-release-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.elemental_normal_damage_bonus",
      label: "赤冕祝祷 · 元素普通攻击伤害加成",
      source: { characterId: "Candace", kind: "character" },
      target: "damageBonus",
      targetFilter: {
        attackKinds: ["normal"],
        elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"]
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      }
    }
  ],
  characterId: "Candace",
  metrics: [
    {
      characterId: "Candace",
      appliesTo: ["normal"],
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.elemental_normal_damage_bonus",
      kind: "scalar",
      label: "圣仪·苍鹭庇卫 / 赤冕祝祷元素普通攻击伤害加成",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.2, talentLevel: 1 },
          { expectedValue: 0.2, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      semantic: "elemental_normal_attack_damage_bonus",
      sourceActionId: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.normal_damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "Sacred Rite: Wagtail's Tide's initial skill damage plus Sacred Rite: Heron's Sanctum's press hit and one hold release remain verified baseline C0 health-scaling Hydro actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but none is selected as Candace's display output. The selected support metric calculates Prayer of the Crimson Crown's 20% elemental Normal Attack damage bonus for one friendly recipient from burst[2]. It is deliberately scoped to elemental Normal Attacks of any element: it neither grants nor simulates Hydro infusion, and it does not apply to Physical attacks, Charged Attacks, Plunges, Skills, Bursts, or any flat-damage effect. The metric excludes duration handling, wave hits, target count, A4's separate Max-HP-scaled bonus, C1/C2/C4/C6, reactions, external effects, and rotation behavior.",
  label: candaceDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
