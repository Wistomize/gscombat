import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xianglingDefinition } from "./definition.js"

export const xianglingCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Xiangling",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "pyronado-tick-multiplier",
          id: "pyronado-tick",
          snapshotChecks: [
            { expectedCoefficient: 1.12, talentLevel: 1 },
            { expectedCoefficient: 2.016, talentLevel: 10 }
          ]
        }
      ],
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      element: xianglingDefinition.element,
      evaluator: "declared_direct",
      id: "xiangling.burst.pyronado.reverse_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "pyronado-tick-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Xiangling",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "guoba-flame-breath-damage",
          id: "guoba-single-flame-breath",
          snapshotChecks: [
            { expectedCoefficient: 1.1128, talentLevel: 1 },
            { expectedCoefficient: 2.00304, talentLevel: 10 }
          ]
        }
      ],
      element: xianglingDefinition.element,
      evaluator: "declared_direct",
      id: "xiangling.skill.guoba.single_flame_breath",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "guoba-flame-breath-damage",
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
      characterId: "Xiangling",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.42054, talentLevel: 1 },
            { expectedCoefficient: 0.8313, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xiangling.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "xiangling.guoba.chili.attack",
      label: "绝云朝天椒（已拾取）",
      source: { characterId: "Xiangling", kind: "character" },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "xiangling.guoba.c1.pyro_resistance_shred",
      label: "锅巴命中 · C1 火元素抗性降低",
      source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 1 },
      target: "enemyResistanceReduction",
      targetFilter: {
        elements: ["pyro"],
        excludedActionIds: ["xiangling.skill.guoba.single_flame_breath"]
      },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      id: "xiangling.pyronado.c6.pyro_damage_bonus",
      label: "旋火轮持续期间 · C6 火元素伤害加成",
      source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        elements: ["pyro"],
        excludedActionIds: ["xiangling.burst.pyronado.reverse_vaporize"]
      },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Xiangling",
  metrics: [
    {
      actionId: "xiangling.burst.pyronado.reverse_vaporize",
      characterId: "Xiangling",
      id: "xiangling.burst.pyronado.reverse_vaporize",
      kind: "damage",
      label: "旋火轮 / 单次命中 · 水底蒸发",
      sourceActionId: "xiangling.burst.pyronado.reverse_vaporize",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Pyronado hit is verified with an explicit Hydro-aura Vaporize assumption, maintained equipment effects, and source-mapped C3/C5 talent levels. One Guoba flame breath is separately verified as a baseline direct Pyro hit, and one uninfused normal first hit is separately verified as baseline Physical damage. Guoba's recurrence, duration, Pyronado cadence, burst snapshot timing, elemental infusions, and broader reaction sequencing remain in progress. C1 Guoba resistance reduction, C6 Pyronado Pyro damage bonus, and A4 chili pickup are explicit current-action snapshots rather than inferred rotation states.",
  label: xianglingDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
