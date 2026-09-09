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
    },
    {
      activation: "active",
      id: "freminet.constellation.6.moment_of_waking_and_resolve.reaction.full_stacks.crit_damage",
      label: "梦晓与决意之刻 · C6 触发冻结、碎冰、超导或星超导后满3层（暴击伤害提升36%）",
      source: { characterId: "Freminet", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.36 }
    }
  ],
  characterId: "Freminet",
  metrics: [
    {
      actionId: "freminet.skill.pressurized_floe.level_4.physical_damage",
      characterId: "Freminet",
      id: "freminet.skill.pressurized_floe.level_4.physical_damage",
      kind: "damage",
      label: "浮冰增压 / 四阶压力物理命中（无反应）",
      sourceActionId: "freminet.skill.pressurized_floe.level_4.physical_damage",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Pressurized Floe upward attack remain verified baseline hits. The selected metric is one Pressurized Floe Pressure Level 4 Physical hit against one target: skill[10]. C1 automatically adds 15% Crit Rate only to this Pressure Level 4 hit. At C6, the explicit full three-stack snapshot after prior Frozen, Shatter, Superconduct, or Superconduct: Stellar reaction triggers adds 36% Crit DMG. It does not apply the stack gained by this same hit retroactively. The metric assumes the pressure has already reached Level 4; it does not infer normal-attack buildup, lower-level payloads, reaction timing, or rotation state.",
  label: freminetDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
