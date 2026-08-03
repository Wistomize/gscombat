import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kleeDefinition } from "./definition.js"

export const kleeCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7216, talentLevel: 1 },
            { expectedCoefficient: 1.29888, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.normal.auto.first_hit",
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
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "jumpy-dumpty-damage",
          id: "jumpy-dumpty-single-bounce",
          snapshotChecks: [
            { expectedCoefficient: 0.952, talentLevel: 1 },
            { expectedCoefficient: 1.7136, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.skill.jumpy_dumpty.single_bounce",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "jumpy-dumpty-damage",
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
      attackKind: "charged",
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 1.5736, talentLevel: 1 },
            { expectedCoefficient: 2.83248, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.normal.charged_attack.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "charged-attack",
            elementalApplication: { icd: { kind: "none" } },
            id: "charged-attack",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  characterId: "Klee",
  actionEffects: [
    {
      activation: "active",
      id: "klee.constellation.1.chained_reactions.spark_triggered.attack_percent",
      label: "连环轰隆 · C1 火花已触发后（攻击力提高60%，12秒）",
      source: { characterId: "Klee", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "klee.constellation.2.sparkling_burst.enemy_defense_reduction",
      label: "目标减防已生效：蹦蹦炸弹诡雷爆炸命中后 · C2 防御力降低（23%，10秒；不作用于触发命中）",
      source: { characterId: "Klee", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.23 }
    }
  ],
  metrics: [
    {
      actionId: "klee.normal.charged_attack.single_hit",
      characterId: "Klee",
      id: "klee.normal.charged_attack.single_hit",
      kind: "damage",
      label: "砰砰礼物 / 重击单次命中·水底蒸发",
      sourceActionId: "klee.normal.charged_attack.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one single bounce of Jumpy Dumpty are verified as baseline C0 attack-scaling Pyro hits. One unbuffed C0 charged-attack hit is also verified as Pyro attack-scaling damage. Its event has no application ICD and resolves as Pyro-on-Hydro Vaporize only when the selected target scenario supplies Hydro aura; without that aura it remains a Pyro hit. At C1, the selected self snapshot means its random firework already triggered: Klee gains 60% Attack for the following 12 seconds. The separate 120%-attack firework hit is not added to this charged-attack metric, and no trigger probability or timing is inferred. At C2, the separately selected target-debuff snapshot means a Jumpy Dumpty mine already exploded on the target: Defense is reduced by 23% for 10 seconds, never for the triggering mine explosion. The charged-attack metric otherwise intentionally excludes Pounding Surprise's Explosive Spark (its 50% increased charged damage and stamina effect), Sparkling Burst energy, Hexerei/Boom Badge states, burst state, other constellations, mines, remaining skill bounces, multi-target damage, and external infusions. No character-owned state or aura setup is implied.",
  label: kleeDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
