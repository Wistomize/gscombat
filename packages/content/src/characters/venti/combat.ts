import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ventiDefinition } from "./definition.js"

export const ventiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Venti",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "skyward-sonnet-press-damage",
          id: "skyward-sonnet-press-damage",
          snapshotChecks: [
            { expectedCoefficient: 2.76, talentLevel: 1 },
            { expectedCoefficient: 4.968, talentLevel: 10 }
          ]
        }
      ],
      element: ventiDefinition.element,
      evaluator: "declared_direct",
      id: "venti.skill.skyward_sonnet.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "skyward-sonnet-press-damage",
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
      characterId: "Venti",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "skyward-sonnet-hold-damage",
          id: "skyward-sonnet-hold",
          snapshotChecks: [
            { expectedCoefficient: 3.8, talentLevel: 1 },
            { expectedCoefficient: 6.84, talentLevel: 10 }
          ]
        }
      ],
      element: ventiDefinition.element,
      evaluator: "declared_direct",
      id: "venti.skill.skyward_sonnet.hold",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "skyward-sonnet-hold-damage",
          parameterIndex: 2,
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
      id: "venti.skyward_sonnet.c2.anemo_resistance_shred",
      label: "高天之歌命中后 · C2 风元素抗性降低（10秒，基础效果）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "active",
      id: "venti.skyward_sonnet.c2.physical_resistance_shred",
      label: "高天之歌命中后 · C2 物理抗性降低（10秒，基础效果）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "active",
      id: "venti.constellation.4.hurricane_of_freedom.anemo_damage_bonus",
      label: "拾取元素微粒或元素晶球后 · C4 自由如风：风元素伤害加成（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["anemo"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.anemo_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 风元素抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.cryo_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 冰元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "cryo" },
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.electro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 雷元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "electro" },
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.hydro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 水元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "hydro" },
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.pyro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 火元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "pyro" },
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Venti",
  metrics: [
    {
      actionId: "venti.skill.skyward_sonnet.press",
      characterId: "Venti",
      id: "venti.skill.skyward_sonnet.press",
      kind: "damage",
      label: "高天之歌 / 点按单次命中（C0，无预设反应）",
      sourceActionId: "venti.skill.skyward_sonnet.press",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Skyward Sonnet's press and hold damage are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric reuses one point-press Skyward Sonnet hit against one target: Skill parameter skill[0], or 276.0% Attack at Talent Level 1 and 496.8% at Level 10. It declares no target aura, elemental absorption, Swirl, or other fixed reaction. C2's base Anemo/Physical resistance reduction after a Skyward Sonnet hit, C4's self-only Anemo damage bonus after an Elemental Particle or Orb pickup, and C6's Stormeye Anemo/absorbed-element resistance reductions are explicit current-action snapshots. C2's additional airborne reduction, the hold hit and updraft, target count and launch state, Stormeye's base and absorbed multi-hit damage, A1 energy restoration, A4 energy refund, locked Hexerei states, external infusions, other constellations including inferred C5 Skill levels, timing, and character states remain unmodeled.",
  label: ventiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
