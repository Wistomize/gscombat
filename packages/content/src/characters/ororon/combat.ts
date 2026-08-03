import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ororonDefinition } from "./definition.js"

export const ororonCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nights-shade-synesthetic-gathering-damage",
          id: "nights-shade-synesthetic-gathering",
          snapshotChecks: [
            { expectedCoefficient: 1.976, talentLevel: 1 },
            { expectedCoefficient: 3.5568, talentLevel: 10 }
          ]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.skill.nights_shade_synesthetic_gathering",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "nights-shade-synesthetic-gathering-damage",
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
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dark-voices-echo-activation-hit-damage",
          id: "dark-voices-echo-activation-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.74384, talentLevel: 1 },
            { expectedCoefficient: 3.138912, talentLevel: 10 }
          ]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.burst.dark_voices_echo.activation_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dark-voices-echo-activation-hit-damage",
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
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nightshade-synesthesia-super-sensory-thunderbolt-damage",
          id: "super-sensory-thunderbolt",
          snapshotChecks: [{ expectedCoefficient: 1.6, talentLevel: 1 }]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "nightshade-synesthesia-super-sensory-thunderbolt-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "passive"
    }
  ],
  characterId: "Ororon",
  metrics: [
    {
      actionId: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      characterId: "Ororon",
      id: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      kind: "damage",
      label: "夜翳交织 / 超感知雷击单次命中（C0、触发条件已满足）",
      sourceActionId: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Nights Shade Synesthetic Gathering hit and Dark Voices Echo's activation hit remain locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is exactly one Nightshade Synesthesia Super-Sensory Thunderbolt after its own trigger condition has already been fulfilled: Attack × passive1[1], a fixed 160% Attack Electro hit. This action records the fulfilled trigger as a named static precondition; it does not infer the prerequisite event, consume Nightsoul points, or create a separate Electro-Charged or Lunar-Charged damage variant. The selected action declares no target aura or reaction. The Skill and Burst hits, periodic sound-wave collisions, all other passive follow-ups, constellations including inferred C5 Skill levels, external infusions, timing, and other character states remain unmodeled.",
  label: ororonDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
