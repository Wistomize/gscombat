import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kinichDefinition } from "./definition.js"

export const kinichCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Kinich",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scalespiker-cannon-damage",
          id: "scalespiker-cannon",
          snapshotChecks: [
            { expectedCoefficient: 6.8744, talentLevel: 1 },
            { expectedCoefficient: 12.37392, talentLevel: 10 }
          ]
        }
      ],
      element: kinichDefinition.element,
      evaluator: "declared_direct",
      id: "kinich.skill.scalespiker_cannon.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "scalespiker-cannon-damage",
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
      characterId: "Kinich",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.98986, talentLevel: 1 },
            { expectedCoefficient: 1.9567, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "kinich.normal.auto.first_hit",
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
      characterId: "Kinich",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "hail-to-the-almighty-dragonlord-initial-aoe-damage",
          id: "hail-to-the-almighty-dragonlord-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 1.34, talentLevel: 1 },
            { expectedCoefficient: 2.412, talentLevel: 10 }
          ]
        }
      ],
      element: kinichDefinition.element,
      evaluator: "declared_direct",
      id: "kinich.burst.hail_to_the_almighty_dragonlord.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hail-to-the-almighty-dragonlord-initial-aoe-damage",
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
      characterId: "Kinich",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "hail-to-the-almighty-dragonlord-dragonlord-breath-damage",
          id: "dragonlord-breath",
          snapshotChecks: [
            { expectedCoefficient: 1.20736, talentLevel: 1 },
            { expectedCoefficient: 2.173248, talentLevel: 10 }
          ]
        }
      ],
      element: kinichDefinition.element,
      evaluator: "declared_direct",
      id: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hail-to-the-almighty-dragonlord-dragonlord-breath-damage",
          parameterIndex: 1,
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
      activation: "automatic",
      id: "kinich.constellation.1.parrots_beak.scalespiker_cannon.crit_damage",
      label: "七鹦之喙 · C1 迴猎贯鳞炮暴击伤害提高100%",
      source: { characterId: "Kinich", kind: "character", minimumSourceConstellation: 1 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["kinich.skill.scalespiker_cannon.single_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 1 }
    },
    {
      activation: "active",
      id: "kinich.scalespiker_cannon.c2.dendro_resistance_shred",
      label: "迴猎贯鳞炮命中后 · C2 草元素抗性降低（6秒）",
      source: { characterId: "Kinich", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["dendro"] },
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "Kinich",
  metrics: [
    {
      actionId: "kinich.skill.scalespiker_cannon.single_hit",
      characterId: "Kinich",
      id: "kinich.skill.scalespiker_cannon.single_hit",
      kind: "damage",
      label: "悬猎·游骋高狩 / 迴猎贯鳞炮单次命中（满夜魂值，C0，无预设反应）",
      sourceActionId: "kinich.skill.scalespiker_cannon.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      characterId: "Kinich",
      id: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      kind: "damage",
      label: "向伟大圣龙致意 / 龙息单次命中（C0，无预设反应）",
      sourceActionId: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one full-Nightsoul Scalespiker Cannon hit, Hail to the Almighty Dragonlord's opening AoE, and one Dragonlord Breath tick are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The first selected C0 metric is one Scalespiker Cannon hit against one target at full Nightsoul: Skill parameter skill[1], or 687.44% Attack at Talent Level 1 and 1237.392% at Level 10. The second selected C0 metric is one Dragonlord Breath tick against one target: Burst parameter burst[1], or 120.736% Attack at Talent Level 1 and 217.3248% at Level 10. C1 automatically adds 100% Crit DMG to the Scalespiker Cannon only. C2 Dendro resistance reduction after a Scalespiker Cannon hit is an explicit current-action snapshot. Neither metric declares a target aura, Burning, Spread, or other fixed reaction. The opening AoE remains a verified underlying action but is no longer selected. Dragon-breath follow-ups and target count, Nightsoul generation and duration extension, firing sequences and looped skill states, passives, other constellations including inferred C3 Skill and C5 Burst levels, external infusions, timing, and character states remain unmodeled.",
  label: kinichDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
