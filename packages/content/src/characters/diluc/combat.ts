import type { CharacterCombatCoverage } from "../../combat/types.js"

import { dilucDefinition } from "./definition.js"

export const dilucCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Diluc",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "searing-onslaught-first-hit-damage",
          id: "searing-onslaught-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.944, talentLevel: 1 },
            { expectedCoefficient: 1.6992, talentLevel: 10 }
          ]
        }
      ],
      element: dilucDefinition.element,
      evaluator: "declared_direct",
      id: "diluc.skill.searing_onslaught.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "searing-onslaught-first-hit-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Diluc",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "searing-onslaught-third-hit-damage",
          id: "searing-onslaught-third-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.288, talentLevel: 1 },
            { expectedCoefficient: 2.3184, talentLevel: 10 }
          ]
        }
      ],
      element: dilucDefinition.element,
      evaluator: "declared_direct",
      id: "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "searing-onslaught-third-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Diluc",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "searing-onslaught-third-hit-damage",
          id: "searing-onslaught-third-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.288, talentLevel: 1 },
            { expectedCoefficient: 2.3184, talentLevel: 10 }
          ]
        }
      ],
      element: dilucDefinition.element,
      evaluator: "declared_direct",
      id: "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "searing-onslaught-third-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Diluc",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dawn-slash-damage",
          id: "dawn-initial-slash",
          snapshotChecks: [
            { expectedCoefficient: 2.04, talentLevel: 1 },
            { expectedCoefficient: 3.672, talentLevel: 10 }
          ]
        }
      ],
      element: dilucDefinition.element,
      evaluator: "declared_direct",
      id: "diluc.burst.dawn.initial_slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dawn-slash-damage",
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
      characterId: "Diluc",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.89698, talentLevel: 1 },
            { expectedCoefficient: 1.7731, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "diluc.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "diluc.constellation.1.conviction.enemy_above_half_health.damage_bonus",
      label: "罪罚裁断 · C1 敌人生命值高于50%（迪卢克造成的伤害提高15%）",
      source: { characterId: "Diluc", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      id: "diluc.constellation.2.scorching_ember.full_stacks.attack_percent",
      label: "炙热余烬 · C2 受伤增益满3层（攻击力提高30%，10秒）",
      source: { characterId: "Diluc", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "active",
      id: "diluc.constellation.4.flowing_flame.searing_onslaught.next_hit.damage_bonus",
      label: "流火焦灼 · C4 满足节奏后的下一段逆焰之刃（第三段伤害提高40%）",
      source: { characterId: "Diluc", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize",
          "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Diluc",
  metrics: [
    {
      actionId: "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize",
      characterId: "Diluc",
      id: "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize",
      kind: "damage",
      label: "逆焰之刃 / 第三段·水底蒸发",
      sourceActionId: "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt",
      characterId: "Diluc",
      id: "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt",
      kind: "damage",
      label: "逆焰之刃 / 第三段·冰底融化",
      sourceActionId: "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first Searing Onslaught hit, Dawn's initial slash, and one uninfused normal first hit remain verified lower-level baseline actions. The selected core action is the third Searing Onslaught hit: Attack × skill[2]. The pinned 6.7 snapshot gives skill[2] as 1.288 at Skill Level 1 and 2.3184 at Level 10; the fixed Genshin Optimizer sheet maps the first, second, and third Searing Onslaught hits to skill[0], skill[1], and skill[2]. Two mutually exclusive target-aura alternatives reuse this exact third hit: Hydro aura uses the existing Pyro-on-Hydro Vaporize type and Cryo aura uses the existing Pyro-on-Cryo Melt type. They do not form a sequence or rotation. C1's enemy-above-half-health 15% Damage Bonus and C2's manually confirmed full three-stack 30% Attack bonus apply only to Diluc; C4 is a separate manual snapshot for the next eligible selected third hit after the two-second release timing and adds 40% Damage Bonus. The selected model does not infer enemy HP, receiving hits, stack timing, skill cadence, or rotations. The first and second skill hits, Dawn's traveling phoenix and terminal explosion, post-burst Pyro infusion and A4 bonus, external buffs, passives, other constellations, and all other character states remain excluded.",
  label: dilucDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
