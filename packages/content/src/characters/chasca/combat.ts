import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chascaDefinition } from "./definition.js"

export const chascaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Chasca",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.480078, talentLevel: 1 },
            { expectedCoefficient: 0.948991, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "chasca.normal.auto.first_hit",
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
      characterId: "Chasca",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spirit-reins-shadow-hunt-resonance-damage",
          id: "resonance-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.6, talentLevel: 1 },
            { expectedCoefficient: 1.08, talentLevel: 10 }
          ]
        }
      ],
      element: chascaDefinition.element,
      evaluator: "declared_direct",
      id: "chasca.skill.spirit_reins_shadow_hunt.resonance.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "spirit-reins-shadow-hunt-resonance-damage",
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
  characterId: "Chasca",
  metrics: [
    {
      actionId: "chasca.skill.spirit_reins_shadow_hunt.resonance.initial_hit",
      characterId: "Chasca",
      id: "chasca.skill.spirit_reins_shadow_hunt.resonance.initial_hit",
      kind: "damage",
      label: "灵缰追影 / 共鸣单次命中（C0，无反应）",
      sourceActionId: "chasca.skill.spirit_reins_shadow_hunt.resonance.initial_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Spirit Reins resonance hit are verified as baseline C0 attack-scaling hits. The selected C0 metric reuses one Spirit Reins resonance hit against one enemy: the pinned 6.7 Genshin Optimizer localization encoding maps Resonance DMG to skill[0], or 0.6 Attack at Talent Level 1 and 1.08 at Level 10. It does not preset a target aura or reaction. The resonance hit covers only the cast's direct Anemo AoE, excluding post-cast Nightsoul points and state, Multitarget Fire, Shadowhunt Shells, their random elemental conversion and last-in-first-out firing order, Swirl and other reactions, timing, passives, constellations, external infusion, and character states.",
  label: chascaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
