import type { CharacterCombatCoverage } from "../../combat/types.js"

import { cynoDefinition } from "./definition.js"

export const cynoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "secret-rite-chasmic-soulfarer-ordinary-damage",
          id: "secret-rite-chasmic-soulfarer-ordinary",
          snapshotChecks: [
            { expectedCoefficient: 1.304, talentLevel: 1 },
            { expectedCoefficient: 2.3472, talentLevel: 10 }
          ]
        }
      ],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.skill.secret_rite_chasmic_soulfarer.ordinary",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "secret-rite-chasmic-soulfarer-ordinary-damage",
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
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          id: "pactsworn-pathclearer-normal-attack-first-hit",
          scalingTerms: [
            {
              coefficientParameterId: "pactsworn-pathclearer-normal-attack-first-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.782832, talentLevel: 1 },
                { expectedCoefficient: 1.547459, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 1.5, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "pactsworn-pathclearer-normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  characterId: "Cyno",
  metrics: [
    {
      actionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      characterId: "Cyno",
      id: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      kind: "damage",
      label: "圣仪·煟煌随狼行 / 启途誓使状态普攻一段（C0，无预设反应）",
      sourceActionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One ordinary Secret Rite: Chasmic Soulfarer hit remains a verified lower-level Electro Skill action. The selected core action is exactly the first Pactsworn Pathclearer Normal Attack while Sacred Rite: Wolf's Swiftness is already active: Attack × burst[0]. At ascension 4+, Featherfall Judgment also adds Elemental Mastery × passive2[0] (150%) before shared multipliers. The pinned 6.7 snapshot gives burst[0] as 78.2832% Attack at Burst Level 1 and 154.7459% at Level 10; the fixed Genshin Optimizer sheet maps the transformed first normal hit to that Burst parameter, while retaining its Normal Attack damage category and Electro element. This is one explicit burst-state action, not a normal-attack chain or rotation. It declares no target aura or reaction. The burst cast hit, later transformed normal hits, charged and plunge attacks, Mortuary Rite, Endseer timing, Featherfall Judgment and Duststalker Bolts, state duration, passives, constellations, external buffs, and all other character states remain excluded.",
  label: cynoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
