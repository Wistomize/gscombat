import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kukiShinobuDefinition } from "./definition.js"

export const kukiShinobuCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "KukiShinobu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sanctifying-ring-skill-damage",
          id: "sanctifying-ring-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.75712, talentLevel: 1 },
            { expectedCoefficient: 1.362816, talentLevel: 10 }
          ]
        }
      ],
      element: kukiShinobuDefinition.element,
      evaluator: "declared_direct",
      id: "kuki_shinobu.skill.sanctifying_ring.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sanctifying-ring-skill-damage",
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
      characterId: "KukiShinobu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.48762, talentLevel: 1 },
            { expectedCoefficient: 0.9639, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "kuki_shinobu.normal.auto.first_hit",
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
      characterId: "KukiShinobu",
      element: kukiShinobuDefinition.element,
      id: "kuki_shinobu.skill.sanctifying_ring.grass_ring",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "grass-ring-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "grass-ring-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "KukiShinobu",
      damageKind: "transformative",
      element: "dendro",
      evaluator: "declared_transformative",
      id: "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom",
      kind: "damage",
      status: "verified",
      talentSlot: "skill",
      transformativeReaction: { kind: "hyperbloom" }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "kuki_shinobu.constellation.6.to_ward_weakness.low_hp.elemental_mastery",
      label: "割舍软弱之心 · C6 生命值低于25%时的元素精通",
      source: { characterId: "KukiShinobu", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      targetFilter: {
        actionIds: ["kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 150 }
    }
  ],
  characterId: "KukiShinobu",
  metrics: [
    {
      actionId: "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom",
      characterId: "KukiShinobu",
      id: "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom",
      kind: "damage",
      label: "越祓雷草之轮 / 越祓草轮单枚超绽放伤害（已存在草原核）",
      sourceActionId: "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom",
      status: "verified",
      target: "enemy"
    },
    {
      additionalScalingTerms: [
        {
          label: "安心之所 / 元素精通附加治疗",
          minimumSourceAscension: 4,
          ratio: 0.75,
          scalingStat: "elementalMastery"
        }
      ],
      characterId: "KukiShinobu",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "grass-ring-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 288.8908, talentLevel: 1 },
          { expectedValue: 635.608, talentLevel: 10 }
        ]
      },
      id: "kuki_shinobu.skill.sanctifying_ring.grass_ring.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "越祓雷草之轮 / 越祓草轮单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "grass-ring-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.03, talentLevel: 1 },
          { expectedValue: 0.054, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于越祓草轮范围内" }],
      scalingStat: "hp",
      sourceActionId: "kuki_shinobu.skill.sanctifying_ring.grass_ring",
      sourceHealingBonuses: [
        {
          label: "破笼之志 / 低生命治疗加成",
          minimumSourceAscension: 1,
          sourceRequirement: {
            comparison: "at_most",
            kind: "source_hp_fraction",
            label: "久岐忍当前生命值不高于 50%",
            threshold: 0.5
          },
          value: 0.15
        }
      ],
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Sanctifying Ring's activation damage is verified as a baseline C0 attack-scaling Electro hit. One uninfused normal first hit is separately verified as baseline Physical damage. One Grass Ring healing tick is verified as max HP × skill[1] + skill[2], plus Heart's Repose's ascension-four 75% Elemental Mastery addend, then source and recipient healing modifiers. One standalone Hyperbloom metric is verified only when a current Grass Ring Electro hit triggers one already-existing, in-range Dendro Core; it does not create or assign ownership of the Core, infer aura, timing, tick count, or a rotation. Break Free's 15% Healing Bonus requires an explicitly supplied source HP fraction at or below 50%; C3 adds three Skill levels. C6's low-HP 150 Elemental Mastery is an explicit self-owned current-action snapshot only for the single Hyperbloom metric; it does not infer HP loss, lethal-damage prevention, trigger frequency, duration, or cooldown. Grass Ring direct damage ticks, elemental infusions, other reaction scenarios, remaining passives, constellations, and state changes remain unmodeled.",
  label: kukiShinobuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
