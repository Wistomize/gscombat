import type { CharacterCombatCoverage } from "../../combat/types.js"

import { mikaDefinition } from "./definition.js"

export const mikaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "star-frost-swirl-flowfrost-arrow-damage",
          id: "star-frost-swirl-flowfrost-arrow-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.672, talentLevel: 1 },
            { expectedCoefficient: 1.2096, talentLevel: 10 }
          ]
        }
      ],
      element: mikaDefinition.element,
      evaluator: "declared_direct",
      id: "mika.skill.star_frost_swirl.flowfrost_arrow",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "star-frost-swirl-flowfrost-arrow-damage",
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
      characterId: "Mika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "star-frost-swirl-rimestar-flare-damage",
          id: "star-frost-swirl-rimestar-flare",
          snapshotChecks: [
            { expectedCoefficient: 0.84, talentLevel: 1 },
            { expectedCoefficient: 1.512, talentLevel: 10 }
          ]
        }
      ],
      element: mikaDefinition.element,
      evaluator: "declared_direct",
      id: "mika.skill.star_frost_swirl.rimestar_flare",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "star-frost-swirl-rimestar-flare-damage",
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
      characterId: "Mika",
      element: mikaDefinition.element,
      id: "mika.burst.skyfeather_song.cast_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "skyfeather-song-cast-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "skyfeather-song-cast-healing-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Mika",
      element: mikaDefinition.element,
      id: "mika.skill.star_frost_swirl.spiritwind",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "star-frost-swirl-spiritwind-normal-attack-speed-bonus",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "mika.passive.suppressive_barrage.maximum_detector_stacks.physical_damage_bonus",
      label: "速射牵制 · 灵风状态下侦明效果满4层（物理伤害提高40%）",
      source: { characterId: "Mika", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "mika.constellation.6.companions_counsel.extra_detector_stack.physical_damage_bonus",
      label: "依随的策援 · C6 侦明上限额外1层（满5层时额外10%物理伤害加成）",
      source: {
        characterId: "Mika",
        kind: "character",
        minimumSourceAscension: 1,
        minimumSourceConstellation: 6
      },
      target: "damageBonus",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "mika.constellation.6.companions_counsel.spiritwind.physical_crit_damage",
      label: "依随的策援 · C6 灵风状态下当前场上角色物理伤害暴击伤害提高60%",
      source: { characterId: "Mika", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.6 }
    }
  ],
  characterId: "Mika",
  metrics: [
    {
      characterId: "Mika",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "skyfeather-song-cast-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1172.0355, talentLevel: 1 },
          { expectedValue: 2578.6736, talentLevel: 10 }
        ]
      },
      id: "mika.burst.skyfeather_song.cast_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "苍翎的颂愿 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "skyfeather-song-cast-healing-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.12168, talentLevel: 1 },
          { expectedValue: 0.219024, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时的附近队伍成员" }
      ],
      scalingStat: "hp",
      sourceActionId: "mika.burst.skyfeather_song.cast_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Mika",
      id: "mika.skill.star_frost_swirl.spiritwind.attack_speed_bonus",
      kind: "scalar",
      label: "星霜的流旋 / 灵风状态下普通攻击速度提升",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "star-frost-swirl-spiritwind-normal-attack-speed-bonus",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.13, talentLevel: 1 },
          { expectedValue: 0.22, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        {
          kind: "recipient_in_source_area",
          label: "受益角色为星霜的流旋命中时获得灵风状态的附近队伍成员"
        }
      ],
      semantic: "attack_speed_bonus",
      sourceActionId: "mika.skill.star_frost_swirl.spiritwind",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "The selected Mika profile reports Skyfeather Song's cast heal and Starfrost Swirl's Spiritwind Normal Attack Speed. The explicit Spiritwind snapshots now also expose the conventional maximum four Detector stacks as 40% Physical Damage Bonus. At C6, the extra stack raises that maximum to 50% and the current active recipient gains 60% Physical Crit DMG. These damage effects do not change Mika's healing or speed scalar results, but they apply to eligible Physical actions evaluated with Mika in the party. Multi-target stack acquisition, duration, and rotation behavior remain explicit rather than inferred.",
  label: mikaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
