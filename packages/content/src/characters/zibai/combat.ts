import type { CharacterCombatCoverage } from "../../combat/types.js"

import { zibaiDefinition } from "./definition.js"

export const zibaiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Zibai",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.505542, talentLevel: 1 },
            { expectedCoefficient: 0.999328, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "zibai.normal.auto.first_hit",
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
      characterId: "Zibai",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "tri-sphere-eminence-first-hit-damage",
          id: "tri-sphere-eminence-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.2696, talentLevel: 1 },
            { expectedCoefficient: 2.28528, talentLevel: 10 }
          ]
        }
      ],
      element: zibaiDefinition.element,
      evaluator: "declared_direct",
      id: "zibai.burst.tri_sphere_eminence.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "tri-sphere-eminence-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Zibai",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "tri-sphere-eminence-second-hit-lunar-crystallize-damage",
          id: "tri-sphere-eminence-second-hit-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 1.77744, talentLevel: 1 },
            { expectedCoefficient: 3.199392, talentLevel: 10 }
          ]
        }
      ],
      element: zibaiDefinition.element,
      evaluator: "declared_special_reaction",
      id: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "tri-sphere-eminence-second-hit-lunar-crystallize-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      specialReaction: { kind: "lunar_crystallize" },
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Zibai",
  metrics: [
    {
      actionId: "zibai.burst.tri_sphere_eminence.first_hit",
      characterId: "Zibai",
      id: "zibai.burst.tri_sphere_eminence.first_hit",
      kind: "damage",
      label: "三垣威仪法 / 第一段单次命中（C0，无预设反应）",
      sourceActionId: "zibai.burst.tri_sphere_eminence.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      characterId: "Zibai",
      id: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      kind: "damage",
      label: "三垣威仪法 / 第二段月结晶单次命中（手填快照，非完整循环）",
      sourceActionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and Tri-Sphere Eminence's first Geo hit are verified as baseline C0 hits. The default C0 metric reuses one Tri-Sphere Eminence first hit against one enemy: the pinned 6.7 Genshin Optimizer localization encoding maps Skill 1-Hit DMG to burst[0], or 1.2696 Defense at Talent Level 1 and 2.28528 at Level 10. A secondary selectable metric uses the burst's second Lunar-Crystallize hit: burst[1], or 1.77744 Defense at Talent Level 1 and 3.199392 at Level 10. It is one manually selected hit, never a full-rotation or reaction-timing inference. Lunar Phase Shift extension, Moon Sign, passives, constellations, external effects, and other character states remain unmodeled. No infusion is modeled.",
  label: zibaiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
