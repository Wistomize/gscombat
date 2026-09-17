import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sayuDefinition } from "./definition.js"

export const sayuCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("sayu", 6),
    ...declareWeaponHitCapabilities(sayuDefinition),
    declareHitCapability("sayu.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["anemo"]),
    { ...declareHitCapability("sayu.kit.sustained_skill_hits", "可持续造成战技命中", ["skill"], ["anemo"], true, "on_field"), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 } },
  ],
  actions: [
    {
      characterId: "Sayu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7224, talentLevel: 1 },
            { expectedCoefficient: 1.428, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "sayu.normal.auto.first_hit",
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
      characterId: "Sayu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yoohoo-art-fuuin-dash-press-kick-damage",
          id: "yoohoo-art-fuuin-dash-press-kick",
          snapshotChecks: [
            { expectedCoefficient: 1.584, talentLevel: 1 },
            { expectedCoefficient: 2.8512, talentLevel: 10 }
          ]
        }
      ],
      element: sayuDefinition.element,
      evaluator: "declared_direct",
      id: "sayu.skill.yoohoo_art_fuuin_dash.press_kick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "yoohoo-art-fuuin-dash-press-kick-damage",
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
      characterId: "Sayu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yoohoo-art-mujina-flurry-activation-hit-damage",
          id: "yoohoo-art-mujina-flurry-activation-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.168, talentLevel: 1 },
            { expectedCoefficient: 2.1024, talentLevel: 10 }
          ]
        }
      ],
      element: sayuDefinition.element,
      evaluator: "declared_direct",
      id: "sayu.burst.yoohoo_art_mujina_flurry.activation_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "yoohoo-art-mujina-flurry-activation-hit-damage",
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
      characterId: "Sayu",
      element: sayuDefinition.element,
      id: "sayu.burst.yoohoo_art_mujina_flurry.cast_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "yoohoo-art-mujina-flurry-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "yoohoo-art-mujina-flurry-cast-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Sayu",
      element: sayuDefinition.element,
      id: "sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "muji-muji-daruma-healing-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "muji-muji-daruma-healing-attack-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Sayu",
  metrics: [
    {
      characterId: "Sayu",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "yoohoo-art-mujina-flurry-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 577.3388, talentLevel: 1 },
          { expectedValue: 1270.2417, talentLevel: 10 }
        ]
      },
      id: "sayu.burst.yoohoo_art_mujina_flurry.cast_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "呜呼流·影貉缭乱 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "yoohoo-art-mujina-flurry-cast-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.9216, talentLevel: 1 },
          { expectedValue: 1.65888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时的附近队伍成员" }
      ],
      scalingStat: "attack",
      sourceActionId: "sayu.burst.yoohoo_art_mujina_flurry.cast_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Sayu",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "muji-muji-daruma-healing-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 500.3603, talentLevel: 1 },
          { expectedValue: 1100.8761, talentLevel: 10 }
        ]
      },
      id: "sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick",
      additionalScalingTerms: [{
        label: "呼呼大睡时间 · C6 不倒貉貉额外治疗（每点精通3点，最高6000）",
        maximumValue: 6000,
        minimumSourceConstellation: 6,
        ratio: 3,
        scalingStat: "elementalMastery"
      }],
      includeHealingBonus: true,
      kind: "healing",
      label: "呜呼流·影貉缭乱 / 不倒貉貉单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "muji-muji-daruma-healing-attack-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.79872, talentLevel: 1 },
          { expectedValue: 1.437696, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        {
          kind: "recipient_in_source_area",
          label: "受治疗角色为不倒貉貉范围内的当前场上角色"
        },
        {
          comparison: "at_most",
          kind: "recipient_hp_fraction",
          label: "C0 时当前场上角色生命值不高于 70%",
          threshold: 0.7,
          waivedAtSourceConstellation: 1
        }
      ],
      scalingStat: "attack",
      sourceActionId: "sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Sayu's selected healing outputs use the pinned talent tables: Burst cast healing is Attack × burst[2] plus burst[1], and one Muji-Muji Daruma healing tick is Attack × burst[5] plus burst[4]. C3 adds three Burst levels. C6 adds min(3 × Elemental Mastery, 6000) only to the Daruma tick's base healing, before source Healing Bonus and recipient Incoming Healing Bonus; the constellation threshold and per-term cap are shown in its formula. At C0 the active recipient must have at most 70% HP, while C1 removes that gate. Lower-level normal, press-kick and Burst activation damage remain separate. Rolling and infused damage, hold stacks, separate healing passives, repeated Daruma ticks, full rotations and external timing are not inferred.",
  label: sayuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
