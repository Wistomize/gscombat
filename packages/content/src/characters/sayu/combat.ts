import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sayuDefinition } from "./definition.js"

export const sayuCombatCoverage: CharacterCombatCoverage = {
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
    "One first normal-attack hit, one Yoohoo Art: Fuuin Dash press kick, and Yoohoo Art: Mujina Flurry's activation hit remain verified lower-level C0 damage actions. Sayu's selected outputs are instead her own healing: the burst cast heal for one nearby party member is Attack × burst[2] plus burst[1], then Sayu's Healing Bonus and the recipient's Incoming Healing Bonus; C3 adds three Burst levels. One Muji-Muji Daruma healing tick for the current active character in its area is Attack × burst[5] plus burst[4], with the same healing modifiers and C3 bonus. At C0 the tick applies when that active character has at most 70% HP; C1 removes that HP gate. These parameters are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073: cast healing is burst[1] and burst[2], and Daruma healing is burst[4] and burst[5]. Rolling periodic damage, infused rolling damage, hold kick damage, target count, C2 press bonus and hold stacks, both healing passives, C6 Elemental Mastery modification, Daruma repeat count, attack/heal area increase, external infusions, other constellations, timing, and character states remain unmodeled.",
  label: sayuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
