import type { CharacterCombatCoverage } from "../../combat/types.js"

import { durinDefinition } from "./definition.js"

export const durinCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Durin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.456505, talentLevel: 1 },
            { expectedCoefficient: 0.902394, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "durin.normal.auto.first_hit",
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
      characterId: "Durin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "purity-transformation-damage",
          id: "purity-transformation",
          snapshotChecks: [
            { expectedCoefficient: 1.056, talentLevel: 1 },
            { expectedCoefficient: 1.9008, talentLevel: 10 }
          ]
        }
      ],
      element: durinDefinition.element,
      evaluator: "declared_direct",
      id: "durin.skill.binary_formula.purity_transformation",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "purity-transformation-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Durin",
  metrics: [
    {
      actionId: "durin.skill.binary_formula.purity_transformation",
      characterId: "Durin",
      id: "durin.skill.binary_formula.purity_transformation",
      kind: "damage",
      label: "二元式·聚分熔炼 / 转变·白化之是单次命中（C0，无预设反应）",
      sourceActionId: "durin.skill.binary_formula.purity_transformation",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Binary Formula Purity transformation hit are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Purity transformation hit against one target: Skill parameter skill[0], or 105.6% Attack at Talent Level 1 and 190.08% at Level 10. It declares no target aura, Vaporize, Melt, or other fixed reaction. The Darkness transformation sequence, both burst forms and dragon periodic damage, A1 reaction and resistance branches, A4 stacks, passives, all constellations including inferred C5 Skill levels, external infusions, timing, and character states remain unmodeled.",
  label: durinDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
