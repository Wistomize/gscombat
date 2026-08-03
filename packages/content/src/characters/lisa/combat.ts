import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lisaDefinition } from "./definition.js"

export const lisaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lisa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "violet-arc-point-press-damage",
          id: "violet-arc-point-press",
          snapshotChecks: [
            { expectedCoefficient: 3.2, talentLevel: 1 },
            { expectedCoefficient: 5.76, talentLevel: 10 }
          ]
        }
      ],
      element: lisaDefinition.element,
      evaluator: "declared_direct",
      id: "lisa.skill.violet_arc.point_press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "violet-arc-point-press-damage",
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
      characterId: "Lisa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "violet-arc-held-three-conductive-stacks-damage",
          id: "violet-arc-held-three-conductive-stacks",
          snapshotChecks: [
            { expectedCoefficient: 4.872, talentLevel: 1 },
            { expectedCoefficient: 8.7696, talentLevel: 10 }
          ]
        }
      ],
      element: lisaDefinition.element,
      evaluator: "declared_direct",
      id: "lisa.skill.violet_arc.held_three_conductive_stacks",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "violet-arc-held-three-conductive-stacks-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Lisa",
  metrics: [
    {
      actionId: "lisa.skill.violet_arc.held_three_conductive_stacks",
      characterId: "Lisa",
      id: "lisa.skill.violet_arc.held_three_conductive_stacks",
      kind: "damage",
      label: "苍雷 / 长按三层引雷伤害（C0、无反应）",
      sourceActionId: "lisa.skill.violet_arc.held_three_conductive_stacks",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Violet Arc held hit against a target with exactly three Conductive stacks is the selected C0, no-reaction, attack-scaling Electro damage metric. It uses skill[3], the complete three-stack held-hit multiplier: 487.2% ATK at talent level 1 and 876.96% at level 10. It does not infer how the three stacks were generated. Elemental aura and reactions, burst behavior, passives, constellations, external buffs, timing, and rotation behavior remain unmodeled.",
  label: lisaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
