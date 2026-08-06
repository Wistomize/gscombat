import type { CharacterCombatCoverage } from "../../combat/types.js"

import { raidenDefinition } from "./definition.js"

export const RAIDEN_SKILL_EYE_EFFECT_ID = "raiden.skill.eye"
const RAIDEN_BURST_INITIAL_SLASH_ACTION_ID = "raiden.burst.initial_slash"

export const raidenCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "RaidenShogun",
      damageKind: "direct",
      damageParts: [
        {
          id: "initial-slash",
          scalingTerms: [
            {
              coefficientParameterId: "initial-slash-multiplier",
              snapshotChecks: [
                { expectedCoefficient: 4.008, talentLevel: 1 },
                { expectedCoefficient: 7.2144, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "resolve-stack-count",
              coefficientParameterId: "resolve-multiplier-per-stack",
              snapshotChecks: [
                { expectedCoefficient: 0.03888, talentLevel: 1 },
                { expectedCoefficient: 0.069984, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      element: raidenDefinition.element,
      evaluator: "declared_direct",
      id: RAIDEN_BURST_INITIAL_SLASH_ACTION_ID,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "initial-slash-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "resolve-multiplier-per-stack",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 60,
          id: "resolve-stack-count",
          label: "愿力层数",
          maximumValue: 60,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [{ at: 0, damagePartId: "initial-slash", id: "initial-slash", snapshot: "cast" }],
        duration: 1
      }
    },
    {
      characterId: "RaidenShogun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "transcendence-baleful-omen-skill-damage",
          id: "transcendence-baleful-omen-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.172, talentLevel: 1 },
            { expectedCoefficient: 2.1096, talentLevel: 10 }
          ]
        }
      ],
      element: raidenDefinition.element,
      evaluator: "declared_direct",
      id: "raiden.skill.transcendence_baleful_omen.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "transcendence-baleful-omen-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "raiden.passive.enlightened_one.energy_recharge_to_electro_damage_bonus",
      label: "殊胜之御体 · 超过100%的元素充能效率转雷元素伤害加成",
      source: { characterId: "RaidenShogun", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"], recipientSourceRelation: "source" },
      value: {
        kind: "source_stat",
        minimumValue: { kind: "fixed", value: 0 },
        multiplier: { kind: "fixed", value: 0.4 },
        offset: -1,
        sourceStat: "energyRecharge"
      }
    },
    {
      activation: "active",
      id: "raiden.skill.eye.burst_damage_bonus",
      label: "雷罚恶曜之眼 · 雷神元素爆发伤害加成",
      requiredActiveEffectIds: [RAIDEN_SKILL_EYE_EFFECT_ID],
      source: { characterId: "RaidenShogun", kind: "character" },
      target: "damageBonus",
      targetFilter: { actionIds: ["raiden.burst.initial_slash"] },
      value: {
        kind: "talent_parameter",
        multiplier: 90,
        parameter: {
          groupId: "skill",
          id: "eye-burst-damage-bonus-per-energy",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "automatic",
      id: "raiden.constellation.2.steelbreaker.burst_enemy_defense_ignore",
      label: "斩铁断金 · C2 元素爆发无视60%防御力",
      source: { characterId: "RaidenShogun", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyDefenseIgnore",
      targetFilter: { recipientSourceRelation: "source", talentSlots: ["burst"] },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "raiden.constellation.4.pledge_of_propriety.attack_percent",
      label: "梦想一心结束后 · C4 其他队友攻击力提升",
      source: { characterId: "RaidenShogun", kind: "character", minimumSourceConstellation: 4 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "RaidenShogun",
  metrics: [
    {
      actionId: RAIDEN_BURST_INITIAL_SLASH_ACTION_ID,
      characterId: "RaidenShogun",
      id: RAIDEN_BURST_INITIAL_SLASH_ACTION_ID,
      kind: "damage",
      label: "奥义 · 梦想真说 / 初始一刀",
      sourceActionId: RAIDEN_BURST_INITIAL_SLASH_ACTION_ID,
      status: "verified",
      target: "enemy"
    }
  ],
  scenarioEffectOptions: [
    {
      actionIds: [RAIDEN_BURST_INITIAL_SLASH_ACTION_ID],
      id: RAIDEN_SKILL_EYE_EFFECT_ID,
      label: "雷罚恶曜之眼"
    }
  ],
  detail:
    "The burst initial slash is a generic declared direct action with separate base and Resolve scaling terms. Enlightened One, Eye of Stormy Judgment's burst bonus for Raiden's selected slash, C2 defense ignore, and source-mapped C3/C5 talent levels are typed character-owned effects. C4's 30% Attack bonus for other nearby teammates after Musou Isshin ends is an explicit current-action snapshot and never applies back to Raiden herself. Coordinated attacks, C1/C6, and the rest of Raiden's kit remain unmodeled.",
  label: raidenDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
