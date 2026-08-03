import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sandroneDefinition } from "./definition.js"

export const sandroneCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.762863, talentLevel: 1 },
            { expectedCoefficient: 1.507985, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "sandrone.normal.auto.first_hit",
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
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-damage",
          id: "prism-bullet",
          snapshotChecks: [
            { expectedCoefficient: 0.324, talentLevel: 1 },
            { expectedCoefficient: 0.5832, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_direct",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-damage",
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
      characterId: "Sandrone",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-stellar-superconduct-damage",
          id: "prism-bullet-stellar-superconduct",
          snapshotChecks: [
            { expectedCoefficient: 0.216, talentLevel: 1 },
            { expectedCoefficient: 0.3888, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_special_reaction",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-stellar-superconduct-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "手填：当前窗口已储存元素附着次数（0–12次，非完整循环推导）",
          maximumValue: 12,
          minimumValue: 0
        }
      ],
      specialReaction: {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      },
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Sandrone",
  metrics: [
    {
      actionId: "sandrone.skill.phenomenon_calculus.prism_bullet",
      characterId: "Sandrone",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet",
      kind: "damage",
      label: "事象数式·游衍解析 / 棱晶弹单次命中（C0，无预设反应）",
      sourceActionId: "sandrone.skill.phenomenon_calculus.prism_bullet",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
      characterId: "Sandrone",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
      kind: "damage",
      label: "事象数式·游衍解析 / 棱晶弹星超导单次命中（手填附着次数，非完整循环）",
      sourceActionId: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Phenomenon Calculation prism bullet are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The default C0 metric is one prism bullet against one target: Skill parameter skill[0], or 32.4% Attack at Talent Level 1 and 58.32% at Level 10. A secondary selectable metric is its Stellar-Superconduct prism hit: Skill parameter skill[1], or 21.6% Attack at Talent Level 1 and 38.88% at Level 10. Its 0–12 stored elemental-application count is always a manual current-window snapshot, never inferred from timing or a full rotation. The A1 Decoding multiplier, burst bombardment and ray payloads, charged-attack variants, passives, all constellations, external infusions, and other character states remain unmodeled.",
  label: sandroneDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
