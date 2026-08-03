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
    "The selected Mika profile reports only his own support outputs: Skyfeather Song's cast heal for one nearby party member, calculated as max HP × burst[1] plus burst[0], then Mika's Healing Bonus and the recipient's Incoming Healing Bonus; C3 adds three Burst levels. Starfrost Swirl grants a nearby party member who receives its action-owned Spiritwind state skill[3] Normal Attack Speed; C5 adds three Skill levels. Flowfrost Arrow and one Rimestar Flare remain lower-level baseline Cryo actions, not selected support metrics. Eagleplume's on-hit healing, Rimestar Shards, multi-target behavior, physical-damage buffs, elemental aura and reactions, passives, other constellations, external buffs, timing, and rotation behavior remain outside these metrics.",
  label: mikaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
