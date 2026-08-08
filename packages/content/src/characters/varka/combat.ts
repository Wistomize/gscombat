import type { CharacterCombatCoverage } from "../../combat/types.js"

import { varkaDefinition } from "./definition.js"

export const varkaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Varka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.654598, talentLevel: 1 },
            { expectedCoefficient: 1.293972, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "varka.normal.auto.first_hit",
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
      characterId: "Varka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "windbound-execution-press-damage",
          id: "windbound-execution-press",
          snapshotChecks: [
            { expectedCoefficient: 2.784, talentLevel: 1 },
            { expectedCoefficient: 5.0112, talentLevel: 10 }
          ]
        }
      ],
      element: varkaDefinition.element,
      evaluator: "declared_direct",
      id: "varka.skill.windbound_execution.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "windbound-execution-press-damage",
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
  actionEffects: [
    {
      activation: "active",
      id: "varka.constellation.4.song_of_freedom.swirl_triggered.anemo_damage_bonus",
      label: "因为无人能夺去我们歌唱的自由 · C4 法尔伽触发扩散后（全队风元素伤害加成提高20%，10秒）",
      source: { characterId: "Varka", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Varka",
  metrics: [
    {
      actionId: "varka.skill.windbound_execution.press",
      characterId: "Varka",
      id: "varka.skill.windbound_execution.press",
      kind: "damage",
      label: "烈风终坠 / 点按单次命中（C0，无反应）",
      sourceActionId: "varka.skill.windbound_execution.press",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Windbound Execution press slash are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Windbound Execution press slash against one target: Skill parameter skill[0], or 278.4% Attack at Talent Level 1 and 501.12% at Level 10. It declares no target aura, Swirl, or other fixed reaction. C4 can be selected after Varka triggers Swirl while its ten-second team effect remains: it adds 20% Anemo damage bonus to every eligible party recipient. The corresponding absorbed-element damage bonus is intentionally not inferred. Sturm und Drang mode and its state actions, Four Winds' Ascension and team-element conversion, passive damage and stack effects, other constellations including inferred C3 Skill levels, external infusions, timing, and character states remain unmodeled.",
  label: varkaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
