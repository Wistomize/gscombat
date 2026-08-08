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
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1, windowSeconds: 15 },
      exclusivity: { group: "kinich-hunters-experience-stacks", variant: "1-stack" },
      id: "kinich.passive.flame_spirit_pact.hunters_experience.one_stack.attack_additive_damage",
      label: "固有天赋 · 焰灵的契约（猎人心得1层，迴猎贯鳞炮攻击力倍率加算320%）",
      source: { characterId: "Kinich", kind: "character", minimumSourceAscension: 4 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["kinich.skill.scalespiker_cannon.single_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 3.2 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 2, windowSeconds: 15 },
      exclusivity: { group: "kinich-hunters-experience-stacks", variant: "2-stack" },
      id: "kinich.passive.flame_spirit_pact.hunters_experience.two_stacks.attack_additive_damage",
      label: "固有天赋 · 焰灵的契约（猎人心得2层，迴猎贯鳞炮攻击力倍率加算640%）",
      source: { characterId: "Kinich", kind: "character", minimumSourceAscension: 4 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["kinich.skill.scalespiker_cannon.single_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 6.4 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
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
      label: "悬猎·游骋高狩 / 迴猎贯鳞炮单次命中（满夜魂值，无反应）",
      sourceActionId: "kinich.skill.scalespiker_cannon.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      characterId: "Kinich",
      id: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      kind: "damage",
      label: "向伟大圣龙致意 / 龙息单次命中（无反应）",
      sourceActionId: "kinich.burst.hail_to_the_almighty_dragonlord.dragonlord_breath.single_tick",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one full-Nightsoul Scalespiker Cannon hit, Hail to the Almighty Dragonlord's opening AoE, and one Dragonlord Breath tick are locked to the pinned 6.7 game-data snapshot. The first selected metric is one Scalespiker Cannon hit; Flame Spirit Pact automatically adds 320% Attack per reachable Hunter's Experience stack for 15 seconds, up to two stacks. The second selected metric is one Dragonlord Breath tick. C1 automatically adds 100% Crit DMG to the Scalespiker Cannon only, and C2 Dendro resistance reduction remains an explicit post-hit snapshot. Neither metric presets Burning, Spread, or another reaction. Dragon-breath follow-ups, Nightsoul generation, firing sequences, timing, and rotation behavior remain unmodeled.",
  label: kinichDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
