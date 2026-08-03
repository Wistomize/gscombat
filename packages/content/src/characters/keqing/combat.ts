import type { CharacterCombatCoverage } from "../../combat/types.js"

import { keqingDefinition } from "./definition.js"

export const keqingCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Keqing",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "stellar-restoration-stiletto-damage",
          id: "stellar-restoration-stiletto-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.504, talentLevel: 1 },
            { expectedCoefficient: 0.9072, talentLevel: 10 }
          ]
        }
      ],
      element: keqingDefinition.element,
      evaluator: "declared_direct",
      id: "keqing.skill.stellar_restoration.stiletto_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "stellar-restoration-stiletto-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "stellar-restoration-stiletto-damage",
            elementalApplication: { icd: { kind: "none" } },
            id: "stellar-restoration-stiletto-damage",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Keqing",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "stellar-restoration-recast-slash-damage",
          id: "stellar-restoration-recast-slash",
          snapshotChecks: [
            { expectedCoefficient: 1.68, talentLevel: 1 },
            { expectedCoefficient: 3.024, talentLevel: 10 }
          ]
        }
      ],
      element: keqingDefinition.element,
      evaluator: "declared_direct",
      id: "keqing.skill.stellar_restoration.recast_slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "stellar-restoration-recast-slash-damage",
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
      characterId: "Keqing",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "starward-sword-initial-hit-damage",
          id: "starward-sword-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.88, talentLevel: 1 },
            { expectedCoefficient: 1.584, talentLevel: 10 }
          ]
        }
      ],
      element: keqingDefinition.element,
      evaluator: "declared_direct",
      id: "keqing.burst.starward_sword.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "starward-sword-initial-hit-damage",
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
      id: "keqing.constellation.4.attunement.electro_reaction.attack_percent",
      label: "调律 · C4 雷元素相关反应触发后攻击力（10秒）",
      source: { characterId: "Keqing", kind: "character", minimumSourceConstellation: 4 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Keqing",
  metrics: [
    {
      actionId: "keqing.skill.stellar_restoration.recast_slash",
      characterId: "Keqing",
      id: "keqing.skill.stellar_restoration.recast_slash",
      kind: "damage",
      label: "星斗归位 / 回刺斩（C0，无预设反应）",
      sourceActionId: "keqing.skill.stellar_restoration.recast_slash",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Stellar Restoration's initial Lightning Stiletto hit and Starward Sword's initial hit remain verified baseline C0 attack-scaling Electro actions. The selected core action is exactly one Stellar Restoration recast slash after a Lightning Stiletto has already been placed: Attack × skill[1]. The pinned 6.7 snapshot gives skill[1] as 168.0% Attack at Skill Level 1 and 302.4% at Level 10, and the fixed Genshin Optimizer sheet maps its Skill slash node to that parameter. The action's sole precondition is an existing Stiletto; it does not infer placement, projectile travel, teleport position, or a rotation. It declares no target aura or reaction. The C4 reaction Attack increase is an explicit user-selected self snapshot after a confirmed Electro-related reaction and does not infer its trigger, duration, or timing. The initial Stiletto, Charged Attack Thunderclap Slash, recast-created five-second Electro infusion, Jade-Stellar's post-burst Critical Rate and Energy Recharge, C1 recast AoEs, C6 Electro Damage Bonus, the burst's remaining hits, and all other passives, constellations, timing, external effects, and character states remain excluded.",
  label: keqingDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
