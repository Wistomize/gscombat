import type { CharacterCombatCoverage } from "../../combat/types.js"

import { freminetDefinition } from "./definition.js"

export const freminetCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Freminet",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.842379, talentLevel: 1 },
            { expectedCoefficient: 1.665167, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "freminet.normal.auto.first_hit",
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
      characterId: "Freminet",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "pressurized-floe-upward-attack-damage",
          id: "pressurized-floe-upward-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.8304, talentLevel: 1 },
            { expectedCoefficient: 1.49472, talentLevel: 10 }
          ]
        }
      ],
      element: freminetDefinition.element,
      evaluator: "declared_direct",
      id: "freminet.skill.pressurized_floe.upward_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "pressurized-floe-upward-attack-damage",
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
      characterId: "Freminet",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "pressurized-floe-level-4-physical-damage",
          id: "pressurized-floe-level-4-physical",
          snapshotChecks: [
            { expectedCoefficient: 2.4344, talentLevel: 1 },
            { expectedCoefficient: 4.38192, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "freminet.skill.pressurized_floe.level_4.physical_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "pressurized-floe-level-4-physical-damage",
          parameterIndex: 10,
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
      id: "freminet.constellation.1.dream_of_the_sea_and_foam.pressurized_floe.level_4.crit_rate",
      label: "深水与泡沫之梦 · C1 四阶高压粉碎暴击率提高15%",
      source: { characterId: "Freminet", kind: "character", minimumSourceConstellation: 1 },
      target: "critRate",
      targetFilter: {
        actionIds: ["freminet.skill.pressurized_floe.level_4.physical_damage"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Freminet",
  metrics: [
    {
      actionId: "freminet.skill.pressurized_floe.level_4.physical_damage",
      characterId: "Freminet",
      id: "freminet.skill.pressurized_floe.level_4.physical_damage",
      kind: "damage",
      label: "浮冰增压 / 四阶压力物理命中（C0、无反应）",
      sourceActionId: "freminet.skill.pressurized_floe.level_4.physical_damage",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Pressurized Floe upward attack remain verified baseline hits in the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Pressurized Floe Pressure Level 4 Physical hit against one target: skill[10], or 243.44% Attack at Talent Level 1 and 438.192% at Level 10. C1 automatically adds 15% Crit Rate only to this Pressure Level 4 hit. It declares no target aura, Melt, Superconduct, Shatter, or other fixed reaction. The metric assumes the pressure has already reached Level 4; it does not infer normal-attack buildup, model lower-level Cryo or Physical payloads, Spiritbreath Thorn, Pers Time's Stalk state, A4's Shatter damage bonus, other constellations including C5 Skill levels, external infusions, timing, or other character states.",
  label: freminetDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
