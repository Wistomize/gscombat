import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yoimiyaDefinition } from "./definition.js"

export const yoimiyaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.3564, talentLevel: 1 },
            { expectedCoefficient: 0.63585, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "yoimiya.normal.auto.first_hit",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          id: "niwabi-fire-dance-fifth-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.37909, talentLevel: 1 },
                { expectedCoefficient: 1.61744, talentLevel: 10 }
              ],
              coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.05864, talentLevel: 1 },
                { expectedCoefficient: 1.88871, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "niwabi-fire-dance-fifth-hit-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "niwabi-fire-dance-normal-damage-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          id: "niwabi-fire-dance-fifth-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.37909, talentLevel: 1 },
                { expectedCoefficient: 1.61744, talentLevel: 10 }
              ],
              coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.05864, talentLevel: 1 },
                { expectedCoefficient: 1.88871, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "niwabi-fire-dance-fifth-hit-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "niwabi-fire-dance-normal-damage-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ryukin-saxifrage-skill-damage",
          id: "ryukin-saxifrage-initial-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.272, talentLevel: 1 },
            { expectedCoefficient: 2.2896, talentLevel: 10 }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.burst.ryukin_saxifrage.initial_arrow",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "ryukin-saxifrage-skill-damage",
          parameterIndex: 0,
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
      id: "yoimiya.constellation.1.agate_ryukin.aurous_blaze_enemy_defeated.attack_percent",
      label: "赤玉琉金 · C1 宵宫自己的琉金火光影响敌人被击败后（攻击力提高20%，20秒）",
      source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "yoimiya.constellation.2.a_procession_of_jewels.pyro_critical_hit.pyro_damage_bonus",
      label: "万灯送火 · C2 火元素伤害暴击后火元素伤害加成（25%，6秒）",
      source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Yoimiya",
  metrics: [
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      characterId: "Yoimiya",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      kind: "damage",
      label: "焰硝庭火舞 / 第五段普攻·水底蒸发",
      sourceActionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      characterId: "Yoimiya",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      kind: "damage",
      label: "焰硝庭火舞 / 第五段普攻·冰底融化",
      sourceActionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and Ryuukin Saxifrage's initial firework arrow remain verified baseline C0 direct hits. The selected core action is one fifth normal-attack hit while Niwabi Fire-Dance is active: Attack × auto[4] × skill[3]. The pinned 6.7 snapshot gives auto[4] as 1.05864 at Normal Attack Level 1 and 1.88871 at Level 10, and skill[3] as the Niwabi Fire-Dance normal-damage multiplier, 1.37909 at Skill Level 1 and 1.61744 at Level 10. The fixed local action condition only states that Niwabi Fire-Dance is active; it neither generates nor consumes any state. Two mutually exclusive target-aura alternatives reuse this exact one hit: Hydro aura uses the existing Pyro-on-Hydro Vaporize type and Cryo aura uses the existing Pyro-on-Cryo Melt type. They do not form a sequence or rotation. C1 can be selected only after an enemy affected by Yoimiya's own Aurous Blaze was defeated during that mark's duration; it adds 20% Attack for the following 20 seconds without inferring the mark, defeat, or duration. C2 can be selected as an explicit self current-action snapshot after Yoimiya's Pyro damage critically hits: her Pyro damage gains 25% damage bonus. It does not infer the critical hit, six-second duration, timing, or a rotation. Target count, the Aurous Blaze mark and transfer, other normal hits, burst explosions, passives, other constellations, external effects, and all other character states remain excluded.",
  label: yoimiyaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
