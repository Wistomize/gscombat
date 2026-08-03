import type { CharacterCombatCoverage } from "../../combat/types.js"

import { pruneDefinition } from "./definition.js"

export const pruneCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Prune",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.486208, talentLevel: 1 },
            { expectedCoefficient: 0.875174, talentLevel: 10 }
          ]
        }
      ],
      element: pruneDefinition.element,
      evaluator: "declared_direct",
      id: "prune.normal.auto.first_hit",
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
      characterId: "Prune",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ding-ding-ding-demon-hunting-sound-damage",
          id: "ding-ding-ding-demon-hunting-sound-base-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.6744, talentLevel: 1 },
            { expectedCoefficient: 3.01392, talentLevel: 10 }
          ]
        }
      ],
      element: pruneDefinition.element,
      evaluator: "declared_direct",
      id: "prune.skill.ding_ding_ding.demon_hunting_sound.base_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "ding-ding-ding-demon-hunting-sound-damage",
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
      characterId: "Prune",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "the-bell-tolls-the-hunt-is-on-initial-hit-damage",
          id: "the-bell-tolls-the-hunt-is-on-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.9696, talentLevel: 1 },
            { expectedCoefficient: 1.74528, talentLevel: 10 }
          ]
        }
      ],
      element: pruneDefinition.element,
      evaluator: "declared_direct",
      id: "prune.burst.the_bell_tolls_the_hunt_is_on.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "the-bell-tolls-the-hunt-is-on-initial-hit-damage",
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
      characterId: "Prune",
      element: pruneDefinition.element,
      id: "prune.passive.resonant_ringing.all_damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "resonant-ringing-damage-bonus-per-attack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "resonant-ringing-duration",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "resonant-ringing-maximum-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "resonant-ringing-attack-threshold",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "prune.locked_passive.demon_hunters_oath.reaction_triggered.self_attack_percent",
      label: "魔女的前夜礼·寻魔之誓 · 受振铃鼓舞的魔导角色触发反应后自身攻击力",
      source: { characterId: "Prune", kind: "character" },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "prune.locked_passive.demon_hunters_oath.swirl_triggered.hexerei_attack_percent",
      label: "魔女的前夜礼·寻魔之誓 · 触发扩散的魔导角色自身攻击力",
      source: { characterId: "Prune", kind: "character" },
      target: "attackPercent",
      targetFilter: { recipientHexereiRequired: true },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "prune.passive.resonant_ringing.all_damage_bonus",
      label: "振铃同心 · 振铃鼓舞全伤害加成",
      source: { characterId: "Prune", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "resonant-ringing-maximum-damage-bonus",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "resonant-ringing-damage-bonus-per-attack",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        offset: -2000
      }
    }
  ],
  characterId: "Prune",
  metrics: [
    {
      characterId: "Prune",
      id: "prune.passive.resonant_ringing.all_damage_bonus",
      kind: "scalar",
      label: "振铃同心 / 振铃鼓舞全伤害加成",
      maximumValueParameter: {
        reference: {
          groupId: "passive2",
          id: "resonant-ringing-maximum-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.5, talentLevel: 1 }]
      },
      minimumScalingValue: 2000,
      ratioParameter: {
        reference: {
          groupId: "passive2",
          id: "resonant-ringing-damage-bonus-per-attack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.00025, talentLevel: 1 }]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受益角色为附近的其他队伍角色" }
      ],
      scalingStat: "attack",
      semantic: "damage_bonus",
      sourceActionId: "prune.passive.resonant_ringing.all_damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "One first normal-attack hit, one base Ding Ding Ding hit, and The Bell Tolls, the Hunt Is On's initial nearby hit remain verified lower-level C0 attack-scaling Anemo actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected support output is Resonant Ringing's other-nearby-party-member damage bonus after an elementally converted Disaster-Hunting Oathhammer hits: max(0, Prune's Attack - 2,000) × passive2[0], capped by passive2[2]. The pinned values are passive2[0] = 0.00025 (0.025% per Attack above 2,000), passive2[1] = 5 seconds, passive2[2] = 0.5, and passive2[3] = 2,000. This source-owned scalar applies to Normal, Charged, Plunging, Skill, and Burst damage without converting it into a particular recipient's final damage; recipient selection, the other-character exclusion, proximity, activation, duration, Swirl-triggered Clang replacement and elemental conversion, burst bell periodic damage, constellations, external infusions, timing, and rotation behavior remain explicit or unmodeled.",
  label: pruneDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
