import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kaeyaDefinition } from "./definition.js"

export const kaeyaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Kaeya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "frostgnaw-damage",
          id: "frostgnaw",
          snapshotChecks: [
            { expectedCoefficient: 1.912, talentLevel: 1 },
            { expectedCoefficient: 3.4416, talentLevel: 10 }
          ]
        }
      ],
      element: kaeyaDefinition.element,
      evaluator: "declared_direct",
      id: "kaeya.skill.frostgnaw",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "frostgnaw-damage",
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
      attackKind: "normal",
      characterId: "Kaeya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.5375, talentLevel: 1 },
            { expectedCoefficient: 1.0625, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "kaeya.normal.auto.first_hit",
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
      id: "kaeya.constellation.1.excellent_blood.affected_by_cryo.normal_charged.crit_rate",
      label: "卓越的血脉 · C1 敌人受到冰元素影响（普通攻击与重击暴击率提高15%）",
      source: { characterId: "Kaeya", kind: "character", minimumSourceConstellation: 1 },
      target: "critRate",
      targetFilter: { attackKinds: ["normal", "charged"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Kaeya",
  metrics: [
    {
      actionId: "kaeya.skill.frostgnaw",
      characterId: "Kaeya",
      id: "kaeya.skill.frostgnaw.single_hit",
      kind: "damage",
      label: "霜袭 / 单次伤害（C0，无预设反应）",
      sourceActionId: "kaeya.skill.frostgnaw",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Frostgnaw hit and one uninfused first normal hit are verified as baseline C0 attack-scaling damage. The selected core metric reuses one Frostgnaw hit, reading the pinned 6.7 game-data snapshot's skill[0] coefficient (1.912 at talent level one and 3.4416 at level ten) as one Cryo hit with no declared target aura, elemental application, or reaction. At C1, a separately selected current-action snapshot means the target is already affected by Cryo: only Kaeya's normal or charged attacks gain 15% Crit Rate. The current catalog has the former baseline action but no charged-hit action; the snapshot does not infer Cryo application, target aura, a reaction, or timing. It otherwise excludes Freeze, Melt, Cold-Blooded Strike healing, Glacial Heart's Energy effect conditional on a Frozen opponent, Glacial Waltz damage and duration, charged attacks, elemental overrides, remaining passives and constellations, external effects, and other state changes.",
  label: kaeyaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
